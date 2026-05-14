const state = {
  agents: [],
  systems: {},
  events: [],
  revisions: [],
  git: {},
  chatHistory: {},
  selectedAgentId: "hermes",
  inspectorTab: "chat",
  deploymentTab: "tailscale",
  activeNav: "dashboard",
  search: "",
  theme: localStorage.getItem("mission-theme") || "dark"
};

const navItems = [
  ["dashboard", "Dashboard", "grid"],
  ["agents", "Agents", "agents"],
  ["systems", "Systems", "monitor"],
  ["deployments", "Deployments", "rocket"],
  ["credentials", "Credentials", "key"],
  ["logs", "Logs", "list"],
  ["audit", "Audit Trail", "shield"],
  ["alerts", "Alerts", "bell"]
];

const infraItems = [
  ["tailscale", "Tailscale", "nodes"],
  ["cloudflare", "Cloudflare Tunnel", "cloud"],
  ["endpoints", "Endpoints", "server"],
  ["secrets", "Secrets Store", "lock"]
];

const configItems = [
  ["settings", "Settings", "settings"],
  ["templates", "Templates", "template"],
  ["policies", "Policies", "shield"],
  ["integrations", "Integrations", "plug"]
];

const icons = {
  search: '<path d="m15 15 4 4"/><circle cx="10.5" cy="10.5" r="5.5"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  agents: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="12" cy="16" r="4"/><path d="M4 19c1-3 3-4 5-4"/><path d="M20 19c-1-3-3-4-5-4"/>',
  monitor: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M9 20h6"/><path d="M12 16v4"/>',
  rocket: '<path d="M13 4c3 1 5 3 7 7-3 1-5 3-7 7-1-2-3-4-5-5l-4 2 2-4c-1-2-3-4-5-5 4-2 8-3 12-2Z"/><path d="M13 9h.01"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h8"/><path d="M17 12v3"/><path d="M20 12v2"/>',
  list: '<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
  shield: '<path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-5"/>',
  bell: '<path d="M18 15H6c1-1 2-3 2-6a4 4 0 0 1 8 0c0 3 1 5 2 6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  nodes: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8"/><path d="M6 8v8"/><path d="M18 8v8"/><path d="M8 18h8"/>',
  cloud: '<path d="M7 18h11a4 4 0 0 0 0-8 6 6 0 0 0-11-2A5 5 0 0 0 7 18Z"/>',
  server: '<rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M8 7h.01"/><path d="M8 17h.01"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 3.1h5l.4-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/>',
  template: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  plug: '<path d="M8 4v5"/><path d="M16 4v5"/><path d="M7 9h10v3a5 5 0 0 1-10 0V9Z"/><path d="M12 17v3"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 11.5-2.5L20 12"/><path d="M18 15a7 7 0 0 1-11.5 2.5L4 12"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
  external: '<path d="M14 4h6v6"/><path d="m10 14 10-10"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
  github: '<path d="M12 2a10 10 0 0 0-3 19c.5.1.7-.2.7-.5v-2c-3 .7-3.6-1-3.6-1-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1A10 10 0 0 1 12 5c.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.9 0 4.1-2.5 5-4.9 5.3.4.3.8 1 .8 2v3.1c0 .3.2.6.8.5A10 10 0 0 0 12 2Z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};

function icon(name, size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.grid}</svg>`;
}

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusText(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "healthy") return "Healthy";
  if (normalized === "online") return "Online";
  if (normalized === "idle") return "Idle";
  return status || "Unknown";
}

function selectedAgent() {
  return state.agents.find((agent) => agent.id === state.selectedAgentId) || state.agents[0];
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function load() {
  document.documentElement.dataset.theme = state.theme;
  renderStaticChrome();
  const data = await api("/api/bootstrap");
  Object.assign(state, data);
  if (!state.agents.some((agent) => agent.id === state.selectedAgentId)) {
    state.selectedAgentId = state.agents[0]?.id || "";
  }
  render();
  qs("#app").dataset.ready = "true";
}

function renderStaticChrome() {
  qsa("[data-icon]").forEach((node) => {
    node.innerHTML = icon(node.dataset.icon, 17);
  });
  qsa("[data-icon-button]").forEach((node) => {
    node.innerHTML = icon(node.dataset.iconButton, 17);
  });
  qs("#newAgentButton").innerHTML = `${icon("plus", 16)} New Agent`;
  qs("#themeToggle").innerHTML = icon(state.theme === "dark" ? "moon" : "sun", 18);
  qs("#refreshButton").innerHTML = icon("refresh", 18);
  qs("#openAgentButton").innerHTML = icon("external", 18);
  qs("#reloadLogsButton").innerHTML = icon("refresh", 18);
  qs(".modal .icon-button").innerHTML = icon("x", 18);
  renderNav(".nav-section[aria-label='Overview']", navItems, "data-view");
  renderNav(".nav-section[aria-label='Infrastructure']", infraItems, "data-infra");
  renderNav(".nav-section[aria-label='Configuration']", configItems, "data-config");
}

function renderNav(sectionSelector, items, attribute) {
  const buttons = qsa(`button[${attribute}]`, qs(sectionSelector));
  buttons.forEach((button, index) => {
    const [, label, iconName] = items[index];
    button.innerHTML = `${icon(iconName, 17)} <span>${label}</span>${label === "Alerts" ? '<em>3</em>' : ""}`;
  });
}

function render() {
  renderTopbar();
  renderAgents();
  renderHealth();
  renderDeployment();
  renderRevisions();
  renderAudit();
  renderInspector();
}

function renderTopbar() {
  const remote = state.server?.remoteReady ? "Protected" : "Local setup";
  qs("#remoteStatus").innerHTML = `<span class="dot good"></span><span><strong>Remote Access</strong><small>${remote}</small></span>`;
  const dirty = state.git?.dirty ? `${state.git.dirty} local change${state.git.dirty === 1 ? "" : "s"}` : "Up to date";
  qs("#gitStatus").innerHTML = `${icon("github", 18)}<span><strong>GitHub</strong><small>${escapeHtml(dirty)} · ${escapeHtml(state.git?.branch || "main")}</small></span>`;
}

function filteredAgents() {
  const query = state.search.trim().toLowerCase();
  if (!query) return state.agents;
  return state.agents.filter((agent) => {
    const haystack = [agent.name, agent.kind, agent.summary, ...(agent.capabilities || [])].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderAgents() {
  const agents = filteredAgents();
  qs("#agentCount").textContent = `${agents.length} total`;
  qs("#agentGrid").innerHTML = agents.map(agentCard).join("");
  qsa(".agent-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.selectedAgentId = card.dataset.agentId;
      state.inspectorTab = "chat";
      render();
    });
  });
  qsa("[data-agent-action]").forEach((button) => {
    button.addEventListener("click", () => handleAgentAction(button.dataset.agentId, button.dataset.agentAction));
  });
}

function agentCard(agent) {
  const selected = agent.id === state.selectedAgentId ? " selected" : "";
  const status = String(agent.status || "unknown").toLowerCase();
  const actions = (agent.actionLabels || [])
    .slice(0, 3)
    .map((action) => `<button class="tool-button" data-agent-id="${agent.id}" data-agent-action="${action.id}">${icon(actionIcon(action.id), 15)}<span>${action.label}</span></button>`)
    .join("");
  return `
    <article class="agent-card${selected}" data-agent-id="${agent.id}">
      <div class="agent-topline">
        <div class="agent-symbol">${agentIcon(agent.id)}</div>
        <div>
          <h3>${escapeHtml(agent.name)}</h3>
          <span class="muted">${escapeHtml(agent.kind || "")}</span>
        </div>
        <span class="status-dot ${status}"></span>
      </div>
      <p>${escapeHtml(agent.summary || "")}</p>
      <div class="agent-meta">
        <span>${escapeHtml(agent.version || "v0.0.0")}</span>
        <span>CPU ${escapeHtml(agent.resources?.cpu ?? 0)}%</span>
        <span>MEM ${escapeHtml(agent.resources?.memory || "n/a")}</span>
      </div>
      <div class="capability-row">${(agent.capabilities || []).slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <div class="card-actions">${actions}</div>
    </article>
  `;
}

function agentIcon(agentId) {
  const map = {
    openclaw: "OC",
    hermes: "HA",
    codex: "CX",
    claude: "AI",
    "local-llm": "LL",
    "automation-runner": "AR",
    "vector-store": "VS",
    "web-crawler": "WC"
  };
  return `<span>${map[agentId] || "AG"}</span>`;
}

function actionIcon(action) {
  if (action === "chat") return "agents";
  if (action === "logs") return "list";
  if (action === "open") return "external";
  if (action === "health") return "monitor";
  if (action === "wscheck") return "nodes";
  return "refresh";
}

function renderHealth() {
  const health = state.systems?.health || [];
  qs("#healthGrid").innerHTML = health
    .map((item) => `
      <div class="metric-card">
        <div>
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
        <small>${escapeHtml(item.detail)}</small>
        <svg class="sparkline ${escapeHtml(item.trend)}" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
          <path d="${sparkPath(item.trend)}"></path>
        </svg>
      </div>
    `)
    .join("");
}

function sparkPath(trend) {
  if (trend === "rise") return "M0 20 C12 18 18 14 28 15 C40 17 43 17 52 12 C64 8 78 9 90 5 C94 4 98 3 100 3";
  if (trend === "warn") return "M0 12 C10 10 18 16 30 13 C42 10 45 10 56 15 C66 18 73 18 84 12 C90 10 96 12 100 14";
  if (trend === "pulse") return "M0 15 C8 12 16 18 24 14 C32 10 40 6 48 12 C56 20 62 20 74 8 C80 10 86 14 100 11";
  return "M0 14 C12 14 20 13 30 14 C40 15 48 16 58 12 C68 10 72 10 84 12 C90 13 96 12 100 11";
}

function renderDeployment() {
  qsa("[data-deployment-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.deploymentTab === state.deploymentTab);
  });
  const item = state.systems?.deployments?.[state.deploymentTab] || {};
  const rows = Object.entries(item)
    .map(([key, value]) => `<div><span>${formatLabel(key)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
  const command = state.deploymentTab === "tailscale"
    ? "tailscale serve --bg http://127.0.0.1:8787"
    : "cloudflared tunnel run mission-control";
  qs("#deploymentDetails").innerHTML = `
    <div class="deployment-detail">${rows}</div>
    <pre class="command-line">${escapeHtml(command)}</pre>
    <button class="button secondary full-width" data-copy-command="${escapeHtml(command)}">${state.deploymentTab === "tailscale" ? "Copy Tailscale command" : "Copy Cloudflare command"}</button>
  `;
  qs("[data-copy-command]")?.addEventListener("click", (event) => {
    navigator.clipboard?.writeText(event.currentTarget.dataset.copyCommand);
    event.currentTarget.textContent = "Copied";
  });
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function renderRevisions() {
  qs("#revisionList").innerHTML = (state.revisions || [])
    .map((revision) => `
      <div class="revision-row">
        <code>${escapeHtml(revision.sha || "")}</code>
        <div>
          <strong>${escapeHtml(revision.title || "Untitled change")}</strong>
          <span>${escapeHtml(revision.author || "operator")} · ${escapeHtml(revision.age || "")}</span>
        </div>
        <span class="status-dot ${revision.status || "success"}"></span>
      </div>
    `)
    .join("");
}

function renderAudit() {
  qs("#auditList").innerHTML = (state.events || [])
    .map((event) => `
      <div class="audit-row">
        <time>${escapeHtml(event.time)}</time>
        <span>${escapeHtml(event.actor)}</span>
        <strong>${escapeHtml(event.message)}</strong>
        <em>${escapeHtml(event.status)}</em>
      </div>
    `)
    .join("");
}

function setActiveNav(id) {
  state.activeNav = id;
  qsa(".nav-item").forEach((button) => {
    const value = button.dataset.view || button.dataset.infra || button.dataset.config;
    button.classList.toggle("active", value === id);
  });
}

function focusPanel(selector, label) {
  const panel = qs(selector);
  if (!panel) return;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
  panel.classList.remove("focus-pulse");
  window.requestAnimationFrame(() => panel.classList.add("focus-pulse"));
  if (label) showToast(label);
}

function focusInspector(tab, label) {
  state.inspectorTab = tab;
  renderInspector();
  const inspector = qs(".inspector");
  inspector?.scrollIntoView({ behavior: "smooth", block: "start" });
  inspector?.classList.remove("focus-pulse");
  window.requestAnimationFrame(() => inspector?.classList.add("focus-pulse"));
  showToast(label);
}

function showToast(message) {
  const toast = qs("#navToast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function handleOverviewNav(id) {
  setActiveNav(id);
  const actions = {
    dashboard: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Dashboard overview");
    },
    agents: () => focusPanel(".agents-panel", "Agent directory"),
    systems: () => focusPanel(".health-panel", "System health"),
    deployments: () => focusPanel(".deployment-panel", "Remote access and deployments"),
    credentials: () => focusInspector("credentials", "Agent credential map"),
    logs: () => focusInspector("logs", "Selected agent logs"),
    audit: () => focusPanel(".audit-panel", "Audit trail"),
    alerts: () => focusPanel(".health-panel", "Alerts are shown in system health and audit trail")
  };
  actions[id]?.();
}

function handleInfrastructureNav(id) {
  setActiveNav(id);
  if (id === "tailscale" || id === "cloudflare") {
    state.deploymentTab = id;
    renderDeployment();
    focusPanel(".deployment-panel", id === "tailscale" ? "Tailscale access" : "Cloudflare Tunnel setup");
    return;
  }
  if (id === "endpoints") {
    focusInspector("config", "Endpoint routes for the selected agent");
    return;
  }
  if (id === "secrets") {
    focusInspector("credentials", "Secrets should stay in .env or a vault");
  }
}

function handleConfigNav(id) {
  setActiveNav(id);
  const messages = {
    settings: "Settings currently live in .env and data/agents.json",
    templates: "Agent templates are in docs/using-dashboard.md",
    policies: "Access policy is currently Basic Auth plus Tailscale",
    integrations: "Add integrations in data/agents.json"
  };
  if (id === "integrations") focusPanel(".agents-panel", messages[id]);
  else focusInspector("config", messages[id]);
}

function renderInspector() {
  const agent = selectedAgent();
  if (!agent) return;
  qs("#inspectorTitle").textContent = agent.name;
  qs("#inspectorMeta").innerHTML = `<span class="status-dot ${agent.status}"></span>${statusText(agent.status)} · ${escapeHtml(agent.version || "")}`;
  qsa("[data-inspector-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.inspectorTab === state.inspectorTab);
  });
  const body = qs("#inspectorBody");
  if (state.inspectorTab === "chat") body.innerHTML = chatPanel(agent);
  if (state.inspectorTab === "info") body.innerHTML = infoPanel(agent);
  if (state.inspectorTab === "actions") body.innerHTML = actionsPanel(agent);
  if (state.inspectorTab === "credentials") body.innerHTML = credentialsPanel(agent);
  if (state.inspectorTab === "logs") body.innerHTML = logsPanel(agent);
  if (state.inspectorTab === "config") body.innerHTML = configPanel(agent);
  bindInspector(agent);
}

function chatPanel(agent) {
  const history = state.chatHistory?.[agent.id] || seedChat(agent);
  return `
    <div class="chat-thread" id="chatThread">
      ${history.map(chatBubble).join("")}
    </div>
    <div class="quick-actions">
      <button data-quick="Run a status check and summarize anything unhealthy.">Status check</button>
      <button data-quick="Show the latest logs and point out anything I should inspect.">Inspect logs</button>
      <button data-quick="Draft the next safe action plan for this agent.">Plan next action</button>
    </div>
    <form class="composer" id="chatForm">
      <input id="chatInput" placeholder="Message ${escapeHtml(agent.name)}..." autocomplete="off">
      <button class="icon-button send-button" title="Send" aria-label="Send">${icon("send", 18)}</button>
    </form>
  `;
}

function seedChat(agent) {
  return [
    {
      role: "agent",
      content:
        agent.id === "hermes"
          ? "Hermes Agent is selected. Send a task request and I will route it to the configured endpoint, or simulate the plan until HERMES_URL is connected."
          : `${agent.name} is selected. Connect its endpoint for live chat, logs, and actions.`,
      at: new Date().toISOString(),
      meta: "system"
    }
  ];
}

function chatBubble(item) {
  const who = item.role === "user" ? "You" : "Agent";
  return `
    <div class="chat-bubble ${item.role}">
      <div class="bubble-meta"><strong>${who}</strong><span>${new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
      <p>${escapeHtml(item.content)}</p>
      ${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ""}
    </div>
  `;
}

function infoPanel(agent) {
  return `
    <div class="info-stack">
      <p>${escapeHtml(agent.summary || "")}</p>
      <div class="detail-grid">
        <div><span>Status</span><strong>${statusText(agent.status)}</strong></div>
        <div><span>Version</span><strong>${escapeHtml(agent.version || "")}</strong></div>
        <div><span>CPU</span><strong>${escapeHtml(agent.resources?.cpu || 0)}%</strong></div>
        <div><span>Memory</span><strong>${escapeHtml(agent.resources?.memory || "n/a")}</strong></div>
        <div><span>Latency</span><strong>${escapeHtml(agent.resources?.latency || "n/a")}</strong></div>
        <div><span>Base URL</span><strong>${escapeHtml(agent.endpoints?.open || "not configured")}</strong></div>
        ${agent.endpoints?.websocket ? `<div><span>WebSocket</span><strong>${escapeHtml(agent.endpoints.websocket)}</strong></div>` : ""}
        ${agent.auth ? `<div><span>Auth</span><strong>${agent.auth.configured ? "Token configured" : `Missing ${escapeHtml(agent.auth.tokenEnv || "token")}`}</strong></div>` : ""}
      </div>
      <div class="capability-list">
        ${(agent.capabilities || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function actionsPanel(agent) {
  const actions = agent.actionLabels || [];
  return `
    <div class="action-grid">
      ${actions.map((action) => `<button class="action-card" data-agent-action="${action.id}" data-agent-id="${agent.id}">${icon(actionIcon(action.id), 18)}<strong>${action.label}</strong><span>${actionHelp(action.id)}</span></button>`).join("")}
    </div>
    <div class="note-box">
      Live actions call configured agent routes. Without routes, Mission Control records the requested action in simulated mode.
    </div>
  `;
}

function actionHelp(action) {
  const help = {
    chat: "Open chat workspace",
    health: "Check health endpoint",
    wscheck: "Verify WebSocket auth",
    logs: "Fetch latest agent logs",
    restart: "Restart or queue restart",
    open: "Open direct agent UI"
  };
  return help[action] || "Run agent action";
}

function credentialsPanel(agent) {
  return `
    <div class="note-box">
      Store actual secrets outside this repository. Use environment variables, Cloudflare Access, Tailscale identity, or a vault. This panel is for mapping what each agent needs.
    </div>
    <div class="credential-list">
      <div><span>${escapeHtml(agent.baseUrlEnv || "AGENT_URL")}</span><strong>${agent.endpoints?.open ? "Configured" : "Missing"}</strong></div>
      ${agent.webSocketUrlEnv ? `<div><span>${escapeHtml(agent.webSocketUrlEnv)}</span><strong>${agent.endpoints?.websocket ? "Configured" : "Missing"}</strong></div>` : ""}
      ${agent.auth?.tokenEnv ? `<div><span>${escapeHtml(agent.auth.tokenEnv)}</span><strong>${agent.auth.configured ? "Configured" : "Missing"}</strong></div>` : ""}
      <div><span>Read-only logs token</span><strong>Recommended</strong></div>
      <div><span>Action token</span><strong>Use least privilege</strong></div>
    </div>
  `;
}

function logsPanel(agent) {
  return `
    <div class="log-window" id="logWindow">
      <span>Loading logs for ${escapeHtml(agent.name)}...</span>
    </div>
  `;
}

function configPanel(agent) {
  return `
    <pre class="config-block">${escapeHtml(JSON.stringify({
      id: agent.id,
      name: agent.name,
      baseUrlEnv: agent.baseUrlEnv,
      openUrlEnv: agent.openUrlEnv,
      webSocketUrlEnv: agent.webSocketUrlEnv,
      auth: agent.auth,
      transport: agent.transport,
      routes: agent.routes,
      endpoints: agent.endpoints,
      actions: agent.actions
    }, null, 2))}</pre>
  `;
}

function bindInspector(agent) {
  if (state.inspectorTab === "chat") {
    qs("#chatForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = qs("#chatInput");
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      await sendChat(agent.id, message);
    });
    qsa("[data-quick]").forEach((button) => {
      button.addEventListener("click", () => sendChat(agent.id, button.dataset.quick));
    });
    qs("#chatThread")?.scrollTo({ top: qs("#chatThread").scrollHeight });
  }
  if (state.inspectorTab === "logs") loadLogs(agent.id);
  qsa("[data-agent-action]", qs("#inspectorBody")).forEach((button) => {
    button.addEventListener("click", () => handleAgentAction(button.dataset.agentId, button.dataset.agentAction));
  });
}

async function sendChat(agentId, message) {
  const history = state.chatHistory[agentId] || [];
  history.push({ role: "user", content: message, at: new Date().toISOString(), meta: "pending" });
  state.chatHistory[agentId] = history;
  renderInspector();
  try {
    const data = await api(`/api/agents/${agentId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
    state.chatHistory[agentId] = data.history;
  } catch (error) {
    state.chatHistory[agentId].push({
      role: "agent",
      content: error.message,
      at: new Date().toISOString(),
      meta: "error"
    });
  }
  renderInspector();
}

async function loadLogs(agentId) {
  const logWindow = qs("#logWindow");
  if (!logWindow) return;
  try {
    const data = await api(`/api/agents/${agentId}/logs`);
    const logs = Array.isArray(data.logs) ? data.logs : [JSON.stringify(data.logs, null, 2)];
    logWindow.innerHTML = logs.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  } catch (error) {
    logWindow.innerHTML = `<span>${escapeHtml(error.message)}</span>`;
  }
}

async function handleAgentAction(agentId, action) {
  if (action === "chat") {
    state.selectedAgentId = agentId;
    state.inspectorTab = "chat";
    render();
    return;
  }
  if (action === "logs") {
    state.selectedAgentId = agentId;
    state.inspectorTab = "logs";
    render();
    return;
  }
  if (action === "health" || action === "wscheck") {
    try {
      const data = await api(`/api/agents/${agentId}/action`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      addLocalEvent(data.message || "Health check completed");
      state.inspectorTab = "config";
      render();
    } catch (error) {
      addLocalEvent(error.message, "error");
    }
    return;
  }
  try {
    const data = await api(`/api/agents/${agentId}/action`, {
      method: "POST",
      body: JSON.stringify({ action })
    });
    if (action === "open" && data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
      return;
    }
    addLocalEvent(data.message || `${action} completed`);
  } catch (error) {
    addLocalEvent(error.message, "error");
  }
}

function addLocalEvent(message, status = "success") {
  state.events = [
    {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actor: "operator",
      message,
      status
    },
    ...state.events
  ].slice(0, 8);
  renderAudit();
}

function bindEvents() {
  qsa("[data-view]").forEach((button) => {
    button.addEventListener("click", () => handleOverviewNav(button.dataset.view));
  });
  qsa("[data-infra]").forEach((button) => {
    button.addEventListener("click", () => handleInfrastructureNav(button.dataset.infra));
  });
  qsa("[data-config]").forEach((button) => {
    button.addEventListener("click", () => handleConfigNav(button.dataset.config));
  });
  qs("#searchInput").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderAgents();
  });
  qs("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("mission-theme", state.theme);
    document.documentElement.dataset.theme = state.theme;
    qs("#themeToggle").innerHTML = icon(state.theme === "dark" ? "moon" : "sun", 18);
  });
  qs("#refreshButton").addEventListener("click", load);
  qsa("[data-inspector-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.inspectorTab = tab.dataset.inspectorTab;
      renderInspector();
    });
  });
  qsa("[data-deployment-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.deploymentTab = tab.dataset.deploymentTab;
      renderDeployment();
    });
  });
  qs("#openAgentButton").addEventListener("click", () => handleAgentAction(state.selectedAgentId, "open"));
  qs("#reloadLogsButton").addEventListener("click", () => {
    state.inspectorTab = "logs";
    renderInspector();
  });
  qs("#newAgentButton").addEventListener("click", () => qs("#agentDialog").showModal());
  qs("#saveDraftAgent").addEventListener("click", (event) => {
    event.preventDefault();
    const name = qs("#draftAgentName").value.trim();
    const url = qs("#draftAgentUrl").value.trim();
    const notes = qs("#draftAgentNotes").value.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    state.agents.push({
      id,
      name,
      kind: "Draft agent",
      status: "idle",
      version: "draft",
      summary: notes || "Session-only draft. Add it to data/agents.json to persist.",
      resources: { cpu: 0, memory: "n/a", latency: "n/a" },
      capabilities: ["Draft"],
      actions: ["chat", "logs", "open"],
      actionLabels: [
        { id: "chat", label: "Chat" },
        { id: "logs", label: "Logs" },
        { id: "open", label: "Open" }
      ],
      endpoints: { open: url },
      accent: "amber"
    });
    state.selectedAgentId = id;
    qs("#agentDialog").close();
    render();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      qs("#searchInput").focus();
    }
  });
}

bindEvents();
load().catch((error) => {
  qs("#app").innerHTML = `<div class="fatal"><h1>Mission Control failed to start</h1><p>${escapeHtml(error.message)}</p></div>`;
});
