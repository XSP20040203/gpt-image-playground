$ErrorActionPreference = 'Continue'

$checks = @(
    @{ Name = 'Local WebUI'; Url = 'http://127.0.0.1:3000' },
    @{ Name = 'Public Domain'; Url = 'https://img.xsp2api.top' }
)
$TunnelProcessPattern = 'config-img.yml|0e6f2745-2a55-467e-af2f-4d47642e0040'

Write-Host 'Image WebUI status check' -ForegroundColor Cyan
Write-Host ''

$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    Write-Host "Port 3000: listening, PID $($listener.OwningProcess)" -ForegroundColor Green
} else {
    Write-Host 'Port 3000: not listening' -ForegroundColor Red
}

$tunnel = Get-CimInstance Win32_Process -Filter "name = 'cloudflared.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match $TunnelProcessPattern } |
    Select-Object -First 1
if ($tunnel) {
    Write-Host "Cloudflare tunnel: running, PID $($tunnel.ProcessId)" -ForegroundColor Green
} else {
    Write-Host 'Cloudflare tunnel: not running' -ForegroundColor Red
}

foreach ($check in $checks) {
    try {
        $response = Invoke-WebRequest -Uri $check.Url -UseBasicParsing -TimeoutSec 12
        Write-Host "$($check.Name): HTTP $($response.StatusCode) $($check.Url)" -ForegroundColor Green
    } catch {
        Write-Host "$($check.Name): FAILED $($check.Url)" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

Write-Host ''
Read-Host 'Press Enter to exit'
