param(
  [int]$Port = 8787
)

$ErrorActionPreference = "Stop"

$ip = (& tailscale ip -4) | Select-Object -First 1
if (!$ip) {
  Write-Host "Tailscale is installed, but this device does not have a tailnet IPv4 address yet." -ForegroundColor Yellow
  Write-Host "Run: tailscale up"
  exit 1
}

Write-Host "Enabling Tailscale Serve for Mission Control..." -ForegroundColor Green
& tailscale serve --bg "http://127.0.0.1:$Port"

Write-Host ""
Write-Host "Tailscale Serve is now forwarding to http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "Tailnet IP fallback: http://$ip`:$Port"
Write-Host ""
Write-Host "Current serve status:"
& tailscale serve status
