import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, createReadStream, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const dataDir = join(root, "data");
loadEnvFile();

const host = process.env.MC_HOST || "127.0.0.1";
const port = Number(process.env.MC_PORT || 8787);
const authUser = process.env.MC_USER || "";
const authPassword = process.env.MC_PASSWORD || "";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const actionLabels = {
  chat: "Chat",
  logs: "Logs",
  restart: "Restart",
  open: "Open",
  tasks: "Tasks"
};

function loadEnvFile() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;
  try {
    const raw = readFileSync(envPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    // The app can run without .env; command-line env vars still work.
  }
}

async function readJson(name, fallback) {
  try {
    const raw = await readFile(join(dataDir, name), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(name, payload) {
  await writeFile(join(dataDir, name), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendText(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
}

function isAuthorized(req) {
  if (!authUser || !authPassword) return true;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;
  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return safeEqual(user, authUser) && safeEqual(password, authPassword);
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return cryptoSafeCompare(left, right);
}

function cryptoSafeCompare(left, right) {
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function enrichAgent(agent) {
  const baseUrl = agent.baseUrlEnv ? process.env[agent.baseUrlEnv] : agent.baseUrl;
  const routes = agent.routes || {};
  const endpoints = {};
  Object.entries(routes).forEach(([key, route]) => {
    endpoints[key] = buildUrl(baseUrl, route);
  });
  if (baseUrl) endpoints.open = baseUrl;
  return {
    ...agent,
    endpoints,
    actionLabels: (agent.actions || []).map((action) => ({
      id: action,
      label: actionLabels[action] || titleCase(action)
    }))
  };
}

function buildUrl(baseUrl, route) {
  if (!route) return "";
  if (/^https?:\/\//i.test(route)) return route;
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/$/, "")}/${String(route).replace(/^\//, "")}`;
}

function titleCase(value) {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getBootstrap() {
  const seed = await readJson("agents.json", { agents: [], systems: {}, events: [], revisions: [] });
  const chatHistory = await readJson("chat-history.json", {});
  const git = await getGitSnapshot(seed.revisions || []);
  return {
    agents: seed.agents.map(enrichAgent),
    systems: seed.systems || {},
    events: seed.events || [],
    revisions: git.revisions,
    git: git.summary,
    chatHistory,
    server: {
      remoteReady: Boolean(authUser && authPassword),
      host,
      port
    }
  };
}

async function getGitSnapshot(fallbackRevisions) {
  const [branch, status, log] = await Promise.all([
    runGit(["rev-parse", "--abbrev-ref", "HEAD"]).catch(() => readGitBranchFallback()),
    runGit(["status", "--short"]).catch(() => ""),
    runGit(["log", "--pretty=format:%h%x09%s%x09%an%x09%cr", "-n", "6"]).catch(() => "")
  ]);
  const revisions = log
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [sha, title, author, age] = line.split("\t");
      return { sha, title, author, age, status: "success" };
    });
  return {
    summary: {
      branch: branch.trim(),
      dirty: status.trim().split(/\r?\n/).filter(Boolean).length,
      remote: process.env.GITHUB_REPO || ""
    },
    revisions: revisions.length ? revisions : fallbackRevisions
  };
}

async function readGitBranchFallback() {
  try {
    const head = await readFile(join(root, ".git", "HEAD"), "utf8");
    const match = head.match(/^ref: refs\/heads\/(.+)$/m);
    return match ? match[1] : head.trim().slice(0, 7);
  } catch {
    return process.env.GITHUB_DEFAULT_BRANCH || "main";
  }
}

function runGit(args) {
  return new Promise((resolve, reject) => {
    execGit("git", args, (error, stdout) => {
      if (!error) return resolve(stdout);
      const windowsGit = "C:\\Program Files\\Git\\cmd\\git.exe";
      if (!existsSync(windowsGit)) return reject(error);
      return execGit(windowsGit, args, (fallbackError, fallbackStdout) => {
        if (fallbackError) reject(fallbackError);
        else resolve(fallbackStdout);
      });
    });
  });
}

function execGit(command, args, callback) {
  execFile(command, args, { cwd: root, timeout: 3000 }, (error, stdout) => {
    callback(error, stdout);
  });
}

async function findAgent(agentId) {
  const seed = await readJson("agents.json", { agents: [] });
  const agent = seed.agents.find((item) => item.id === agentId);
  return agent ? enrichAgent(agent) : null;
}

async function proxyAgent(agent, routeName, payload) {
  const endpoint = agent.endpoints?.[routeName];
  if (!endpoint) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(endpoint, {
      method: payload ? "POST" : "GET",
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal
    });
    const text = await response.text();
    let parsed = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Plain-text logs or agent responses are fine.
    }
    if (!response.ok) {
      return {
        ok: false,
        proxied: true,
        message: `Agent endpoint returned ${response.status}`,
        data: parsed
      };
    }
    return { ok: true, proxied: true, data: parsed };
  } catch (error) {
    return {
      ok: false,
      proxied: true,
      message: error.name === "AbortError" ? "Agent endpoint timed out" : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function handleChat(req, res, agentId) {
  const agent = await findAgent(agentId);
  if (!agent) return sendJson(res, 404, { ok: false, message: "Agent not found" });
  const body = await readBody(req);
  const message = String(body.message || "").trim();
  if (!message) return sendJson(res, 400, { ok: false, message: "Message is required" });

  const proxied = await proxyAgent(agent, "chat", { message, agentId });
  const reply = normalizeAgentReply(agent, message, proxied);
  const history = await readJson("chat-history.json", {});
  const now = new Date().toISOString();
  const entry = history[agentId] || [];
  entry.push({ role: "user", content: message, at: now });
  entry.push({ role: "agent", content: reply.content, at: now, meta: reply.meta });
  history[agentId] = entry.slice(-50);
  await writeJson("chat-history.json", history);
  return sendJson(res, 200, { ok: true, reply, history: history[agentId] });
}

function normalizeAgentReply(agent, message, proxied) {
  if (proxied?.ok) {
    const data = proxied.data;
    if (typeof data === "string") return { content: data, meta: "proxied" };
    return {
      content: data.reply || data.message || data.content || JSON.stringify(data, null, 2),
      meta: "proxied"
    };
  }
  const lower = message.toLowerCase();
  if (agent.id === "hermes") {
    if (lower.includes("test") || lower.includes("build")) {
      return {
        content:
          "Hermes can queue a build/test plan once its endpoint is connected. For now, I would run dependency checks, execute the test command, collect logs, and summarize failures back here.",
        meta: proxied?.message || "simulated"
      };
    }
    return {
      content:
        "Hermes is ready in simulated mode. Connect HERMES_URL to enable live task planning, run logs, and action execution.",
      meta: proxied?.message || "simulated"
    };
  }
  if (agent.id === "openclaw") {
    return {
      content:
        "OpenClaw is ready in simulated mode. Connect OPENCLAW_URL to enable live repository analysis, code search, and task-specific context retrieval.",
      meta: proxied?.message || "simulated"
    };
  }
  return {
    content: `${agent.name} received: "${message}". Add a chat route for live responses.`,
    meta: proxied?.message || "simulated"
  };
}

async function handleAction(req, res, agentId) {
  const agent = await findAgent(agentId);
  if (!agent) return sendJson(res, 404, { ok: false, message: "Agent not found" });
  const body = await readBody(req);
  const action = String(body.action || "").trim();
  if (!action) return sendJson(res, 400, { ok: false, message: "Action is required" });
  if (action === "open") {
    return sendJson(res, 200, {
      ok: true,
      action,
      url: agent.endpoints?.open || "",
      message: agent.endpoints?.open ? "Open URL available" : "No live URL configured"
    });
  }
  const proxied = await proxyAgent(agent, action, { action, agentId });
  if (proxied) return sendJson(res, proxied.ok ? 200 : 502, { action, ...proxied });
  return sendJson(res, 200, {
    ok: true,
    action,
    proxied: false,
    message: `${titleCase(action)} queued for ${agent.name} in simulated mode.`
  });
}

async function handleLogs(res, agentId) {
  const agent = await findAgent(agentId);
  if (!agent) return sendJson(res, 404, { ok: false, message: "Agent not found" });
  const proxied = await proxyAgent(agent, "logs");
  if (proxied?.ok) return sendJson(res, 200, { ok: true, logs: proxied.data, proxied: true });
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const logs = [
    `[${now}] ${agent.name}: status ${agent.status}`,
    `[${now}] ${agent.name}: resources cpu=${agent.resources?.cpu || 0}% memory=${agent.resources?.memory || "n/a"}`,
    `[${now}] ${agent.name}: live logs will appear when ${agent.baseUrlEnv || "an endpoint"} is configured`
  ];
  return sendJson(res, 200, { ok: true, logs, proxied: false });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalized = normalize(join(publicDir, requestedPath));
  if (!normalized.startsWith(publicDir)) return sendText(res, 403, "Forbidden");
  if (!existsSync(normalized)) return sendText(res, 404, "Not found");
  const ext = extname(normalized);
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  createReadStream(normalized).pipe(res);
}

async function route(req, res) {
  if (!isAuthorized(req)) {
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Mission Control"',
      "Content-Type": "text/plain; charset=utf-8"
    });
    return res.end("Authentication required");
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/bootstrap") {
      return sendJson(res, 200, await getBootstrap());
    }
    const chatMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/chat$/);
    if (req.method === "POST" && chatMatch) return handleChat(req, res, chatMatch[1]);
    const actionMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/action$/);
    if (req.method === "POST" && actionMatch) return handleAction(req, res, actionMatch[1]);
    const logsMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/logs$/);
    if (req.method === "GET" && logsMatch) return handleLogs(res, logsMatch[1]);
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, service: "mission-control", at: new Date().toISOString() });
    }
    if (req.method === "GET") return serveStatic(req, res);
    return sendText(res, 405, "Method not allowed");
  } catch (error) {
    return sendJson(res, 500, { ok: false, message: error.message });
  }
}

const server = createServer(route);
server.listen(port, host, () => {
  const authMode = authUser && authPassword ? "auth enabled" : "auth disabled";
  console.log(`Mission Control listening on http://${host}:${port} (${authMode})`);
});
