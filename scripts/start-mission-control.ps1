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

$nodeCandidates = @(
  (Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source),
  (Join-Path $env:LOCALAPPDATA "OpenAI\Codex\bin\node.exe"),
  (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
) | Where-Object { $_ -and (Test-Path $_) }

if (!$nodeCandidates -or $nodeCandidates.Count -eq 0) {
  Write-Host "Node.js was not found." -ForegroundColor Yellow
  Write-Host "Install Node.js from https://nodejs.org or run this from inside Codex where bundled Node is available." -ForegroundColor Yellow
  exit 1
}

$node = $nodeCandidates[0]

Write-Host "Mission Control starting at http://${HostName}:$Port" -ForegroundColor Green
Write-Host "Using Node: $node"
Write-Host "Use Ctrl+C to stop it."
Push-Location $root
try {
  & $node server.mjs
}
finally {
  Pop-Location
}
