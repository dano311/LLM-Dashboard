param(
  [string]$HostName = "127.0.0.1",
  [int]$Port = 8787
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"

if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) { return }
    $parts = $line.Split("=", 2)
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()
    if ($name) {
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

if (!$env:MC_USER) {
  $env:MC_USER = "operator"
}

if (!$env:MC_PASSWORD -or $env:MC_PASSWORD -like "change-me*") {
  Write-Host "Set MC_PASSWORD in .env before remote access." -ForegroundColor Yellow
  Write-Host "Example: MC_PASSWORD=<long unique password>" -ForegroundColor Yellow
  exit 1
}

$env:MC_HOST = $HostName
$env:MC_PORT = [string]$Port

Write-Host "Mission Control starting at http://${HostName}:$Port" -ForegroundColor Green
Write-Host "Use Ctrl+C to stop it."
Push-Location $root
try {
  node server.mjs
}
finally {
  Pop-Location
}
