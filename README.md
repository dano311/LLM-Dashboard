# Mission Control Panel

A local-first web control panel for AI agents and automation systems. The first build includes OpenClaw and Hermes Agent, with room for Codex, Claude, local LLM runtimes, automation runners, vector stores, crawlers, and any service that exposes HTTP endpoints.

## What It Does

- Agent directory with live-ish status, resources, capabilities, endpoints, and quick actions.
- Per-agent chat panel. If an agent chat endpoint is configured, Mission Control proxies to it. Otherwise it returns a simulated response so the UI remains usable.
- Logs, action runner, config inspector, credentials notes, audit trail, health tiles, deployment status, and GitHub revisions.
- Dark and light themes with low-contrast, calm colors.
- Remote-access documentation for Tailscale and Cloudflare Tunnel.
- Dependency-light runtime: Node.js only, no `npm install` required.

## Quick Start

```powershell
Copy-Item .env.example .env
node server.mjs
```

Then open:

```text
http://127.0.0.1:8787
```

If `MC_USER` and `MC_PASSWORD` are set in `.env`, the panel uses browser Basic Auth.

## Tailscale Quick Start

Tailscale is the recommended first remote-access path because it keeps the panel private to your tailnet.

1. Copy `.env.example` to `.env`.
2. Set a long unique `MC_PASSWORD`.
3. Start the panel locally:

   ```powershell
   .\scripts\start-mission-control.ps1
   ```

4. In another terminal, enable Tailscale Serve:

   ```powershell
   .\scripts\enable-tailscale-serve.ps1
   ```

5. Open the HTTPS URL shown by `tailscale serve status` from another tailnet device.

## Configure Agents

Edit [data/agents.json](data/agents.json). Each agent can define direct endpoints or environment-driven URLs:

```json
{
  "id": "hermes",
  "name": "Hermes Agent",
  "baseUrlEnv": "HERMES_URL",
  "routes": {
    "health": "/health",
    "chat": "/chat",
    "logs": "/logs",
    "restart": "/restart"
  }
}
```

When `HERMES_URL` is set, the server builds full URLs from those routes. If it is not set, the app stays in simulated mode.

For day-to-day use and LLM setup, see [docs/using-dashboard.md](docs/using-dashboard.md).

## Remote Access

Start local-only while configuring:

```powershell
$env:MC_HOST="127.0.0.1"
$env:MC_PORT="8787"
node server.mjs
```

For Tailscale or Cloudflare Tunnel, set a real password and follow [docs/remote-access.md](docs/remote-access.md).

## GitHub Revisions

This workspace is ready for git revisions. After you provide or configure a GitHub remote, use the workflow in [docs/github-workflow.md](docs/github-workflow.md).
