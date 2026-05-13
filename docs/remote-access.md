# Remote Access

Mission Control is designed to sit behind a private network layer or a zero-trust tunnel. Do not expose it directly to the public internet without authentication.

## Option A: Tailscale

Good when you want private access from your own devices.

1. Install and sign in to Tailscale on the machine running Mission Control.
2. Set a username and password in `.env`:

   ```powershell
   MC_USER=operator
   MC_PASSWORD=use-a-long-unique-password
   MC_HOST=0.0.0.0
   MC_PORT=8787
   ```

3. Start the panel:

   ```powershell
   node server.mjs
   ```

4. Open it from another device on your tailnet:

   ```text
   http://<tailscale-device-name>:8787
   ```

5. Optional: publish it with Tailscale Serve if you want a tailnet HTTPS URL:

   ```powershell
   tailscale serve --bg http://127.0.0.1:8787
   ```

## Option B: Cloudflare Tunnel

Good when you want a normal domain such as `mission.example.com` with Cloudflare Access in front.

1. Set a username and password in `.env`.
2. Keep Mission Control bound locally:

   ```powershell
   MC_HOST=127.0.0.1
   MC_PORT=8787
   ```

3. Create a tunnel:

   ```powershell
   cloudflared tunnel create mission-control
   cloudflared tunnel route dns mission-control mission.example.com
   ```

4. Copy [cloudflare/tunnel.example.yml](../cloudflare/tunnel.example.yml) to your Cloudflare config location and replace `mission.example.com`.
5. Run the tunnel:

   ```powershell
   cloudflared tunnel run mission-control
   ```

6. In Cloudflare Zero Trust, protect the hostname with Cloudflare Access.

## Security Checklist

- Use a long unique `MC_PASSWORD`.
- Put Cloudflare Access or Tailscale identity in front of the panel.
- Do not commit `.env`.
- Keep agent admin endpoints bound to localhost where possible, then proxy through Mission Control.
- Use HTTPS for any remote agent endpoint.
- Prefer read-only tokens for logs and status.
