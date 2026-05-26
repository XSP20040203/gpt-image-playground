$ErrorActionPreference = 'Stop'

$ProjectDir = 'C:\Users\30272\Desktop\skills\local-image-webui\gpt-image-playground'
$NextCmd = Join-Path $ProjectDir 'node_modules\.bin\next.cmd'
$Cloudflared = 'C:\Users\30272\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe'
$TunnelConfig = 'C:\Users\30272\.cloudflared\config-img.yml'
$TunnelId = '0e6f2745-2a55-467e-af2f-4d47642e0040'
$TunnelProcessPattern = 'config-img.yml|0e6f2745-2a55-467e-af2f-4d47642e0040'
$LocalUrl = 'http://127.0.0.1:3000'
$PublicUrl = 'https://img.xsp2api.top'

function Test-HttpOk {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 12
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Start-ImageWebUi {
    $listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        Write-Host "Image WebUI is already listening on port 3000. PID: $($listener.OwningProcess)" -ForegroundColor Green
        return
    }

    if (-not (Test-Path $NextCmd)) {
        throw "next.cmd not found: $NextCmd"
    }

    Write-Host 'Starting Image WebUI on http://127.0.0.1:3000 ...' -ForegroundColor Cyan
    Start-Process -FilePath 'cmd.exe' -ArgumentList @('/d', '/c', "`"$NextCmd`" start") -WorkingDirectory $ProjectDir -WindowStyle Hidden

    for ($i = 1; $i -le 30; $i++) {
        if (Test-HttpOk $LocalUrl) {
            Write-Host 'Image WebUI started.' -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 1
    }

    throw 'Image WebUI did not become ready on port 3000.'
}

function Start-XspTunnel {
    $cloudflaredProcess = Get-CimInstance Win32_Process -Filter "name = 'cloudflared.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match $TunnelProcessPattern } |
        Select-Object -First 1

    if ($cloudflaredProcess) {
        Write-Host "Cloudflare tunnel is already running. PID: $($cloudflaredProcess.ProcessId)" -ForegroundColor Green
        return
    }

    Write-Host 'Starting Cloudflare tunnel for img.xsp2api.top (xsp-image) ...' -ForegroundColor Cyan
    Start-Process -FilePath $Cloudflared -ArgumentList @('tunnel', '--config', $TunnelConfig, 'run', $TunnelId) -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

Start-ImageWebUi
Start-XspTunnel

Write-Host ''
Write-Host "Local:  $LocalUrl" -ForegroundColor White
Write-Host "Domain: $PublicUrl" -ForegroundColor White
Write-Host ''

if (Test-HttpOk $LocalUrl) {
    Write-Host 'Local check: OK' -ForegroundColor Green
} else {
    Write-Host 'Local check: FAILED' -ForegroundColor Red
}

if (Test-HttpOk $PublicUrl) {
    Write-Host 'Domain check: OK' -ForegroundColor Green
} else {
    Write-Host 'Domain check: not ready yet. DNS or tunnel propagation may need a minute.' -ForegroundColor Yellow
}

Start-Process $PublicUrl

Write-Host ''
Write-Host 'Done. You can close this window.' -ForegroundColor Cyan
Read-Host 'Press Enter to exit'
