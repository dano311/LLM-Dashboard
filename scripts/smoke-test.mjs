import { spawn } from "node:child_process";

const port = 9797;
const child = spawn(process.execPath, ["server.mjs"], {
  env: {
    ...process.env,
    MC_HOST: "127.0.0.1",
    MC_PORT: String(port),
    MC_USER: "",
    MC_PASSWORD: ""
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  await wait(700);
  const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((res) => res.json());
  const boot = await fetch(`http://127.0.0.1:${port}/api/bootstrap`).then((res) => res.json());
  if (!health.ok) throw new Error("Health check failed");
  if (!Array.isArray(boot.agents) || boot.agents.length < 2) throw new Error("Bootstrap did not include agents");
  if (!boot.agents.find((agent) => agent.id === "openclaw")) throw new Error("OpenClaw missing");
  if (!boot.agents.find((agent) => agent.id === "hermes")) throw new Error("Hermes missing");
  const chat = await fetch(`http://127.0.0.1:${port}/api/agents/hermes/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Run a smoke test" })
  }).then((res) => res.json());
  if (!chat.ok || !chat.reply?.content) throw new Error("Chat endpoint failed");
  console.log("Smoke test passed");
} finally {
  child.kill();
  if (output.includes("EADDRINUSE")) {
    console.error(output);
  }
}
