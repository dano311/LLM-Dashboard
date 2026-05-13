# Using Mission Control

Mission Control has two layers:

- The dashboard UI for selecting agents, chatting, viewing logs, checking config, and running actions.
- The backend config in `.env` and `data/agents.json`, which tells the dashboard where each agent or LLM lives.

## Daily Startup

Double-click the desktop launcher:

```text
Mission Control.cmd
```

It starts the Node server in a PowerShell window and opens your Tailscale URL:

```text
https://tx-pc.cockatoo-roach.ts.net
```

Keep the PowerShell window open while using the dashboard.

## What The Dashboard Panels Mean

- **Agents**: each LLM, agent, automation service, or tool endpoint.
- **Chat**: sends a message to the selected agent. If the endpoint is not wired yet, Mission Control returns a simulated response.
- **Logs**: fetches the selected agent's logs if a logs route is configured.
- **Actions**: runs supported actions such as restart, open, or logs.
- **Credentials**: shows what environment variable or token mapping the agent needs. Do not paste secrets into the repo.
- **Config**: shows the resolved config for the selected agent.
- **Deployments**: shows Tailscale and Cloudflare access notes.
- **GitHub Revisions**: shows local git branch/change status when git is available.

## Add A Local LLM

Use this when a model server already runs on your machine or tailnet, such as Ollama, LM Studio, llama.cpp, Open WebUI, or an OpenAI-compatible server.

1. Open `.env`.
2. Add an environment variable for the server:

   ```env
   MY_LLM_URL=http://127.0.0.1:11434
   ```

3. Open `data/agents.json`.
4. Add a new object inside the `agents` array:

   ```json
   {
     "id": "my-local-llm",
     "name": "My Local LLM",
     "kind": "Runtime",
     "status": "online",
     "version": "local",
     "summary": "Local model runtime.",
     "baseUrlEnv": "MY_LLM_URL",
     "routes": {
       "health": "/health",
       "chat": "/chat",
       "logs": "/logs"
     },
     "resources": {
       "cpu": 0,
       "memory": "n/a",
       "latency": "n/a"
     },
     "capabilities": [
       "Private chat",
       "Local inference"
     ],
     "actions": [
       "chat",
       "logs",
       "open"
     ],
     "accent": "green"
   }
   ```

5. Restart Mission Control.

If your LLM exposes an API endpoint, the chat route is usually one of these:

```text
/v1/chat/completions
/api/chat
/chat
```

Mission Control currently sends a simple `{ "message": "..." }` payload. Some LLM servers need a custom adapter next, which is the next integration step for Ollama, LM Studio, Open WebUI, llama.cpp, and other OpenAI-compatible runtimes.

## Add An Agent On Another Tailscale Machine

Use the Tailscale machine name or Tailscale IP:

```env
HERMES_URL=http://hermes:8788
OPENCLAW_URL=http://clawbox:8790
```

Or:

```env
HERMES_URL=http://100.111.85.93:8788
OPENCLAW_URL=http://100.91.188.128:8790
```

Then make sure the agent's `routes` in `data/agents.json` match its API.

## Current OpenClaw Gateway Setup

The OpenClaw card is wired for this gateway:

```env
OPENCLAW_URL=http://100.99.165.16:18789
OPENCLAW_CANVAS_URL=http://100.99.165.16:18789/__openclaw__/canvas/
OPENCLAW_WS_URL=ws://100.99.165.16:18789/
```

Mission Control can use:

```text
GET /health
Open /__openclaw__/canvas/
```

OpenClaw realtime uses WebSocket at:

```text
ws://100.99.165.16:18789/
```

The dashboard records that WebSocket endpoint, but live chat needs one more adapter once we know the exact OpenClaw WebSocket message format.

If the Open button or Health action cannot reach OpenClaw, check the mini PC:

- OpenClaw is running.
- It is listening on `0.0.0.0:18789`, not only `127.0.0.1:18789`.
- The mini PC firewall allows inbound TCP `18789` from Tailscale.
- The Tailscale IP is still `100.99.165.16`.

## What I Would Wire Next

1. Persistent "Add Agent" and "Edit Agent" forms inside the dashboard.
2. Adapters for Ollama, OpenAI-compatible `/v1/chat/completions`, LM Studio, Open WebUI, and llama.cpp.
3. Live health polling instead of seeded status values.
4. Streaming chat/log output.
5. Windows scheduled task or Unraid Docker for always-on service.
