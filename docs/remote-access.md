# Remote Access

Mission Control is designed to sit behind a private network layer or a zero-trust tunnel. Do not expose it directly to the public internet without authentication.

## Option A: Tailscale

Good when you want private access from your own devices.

This is the recommended first setup for this project.

1. Install and sign in to Tailscale on the machine running Mission Control.
2. Set a username and password in `.env`:

   ```powershell
   MC_USER=operator
   MC_PASSWORD=use-a-long-unique-password
   MC_HOST=127.0.0.1
   MC_PORT=8787
   ```

3. Start the panel:

   ```powershell
   .\scripts\start-mission-control.ps1
   ```

4. Enable a private Tailscale HTTPS URL:

   ```powershell
   .\scripts\enable-tailscale-serve.ps1
   ```

5. Open the HTTPS URL shown by:

   ```powershell
   tailscale serve status
   ```

Direct tailnet IP fallback is also possible if you start the server with `-HostName 0.0.0.0`, but Tailscale Serve is preferred because Mission Control can stay bound to localhost.

To disable the private HTTPS forwarding:

```powershell
.\scripts\disable-tailscale-serve.ps1
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
