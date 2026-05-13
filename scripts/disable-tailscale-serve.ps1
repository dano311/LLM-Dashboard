$ErrorActionPreference = "Stop"

Write-Host "Disabling Tailscale Serve for Mission Control..." -ForegroundColor Yellow
& tailscale serve reset
Write-Host "Tailscale Serve rules removed."
