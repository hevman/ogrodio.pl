# Wgranie zdjec artykulow na VPS — tylko WebP (~52 MB)
# Oryginaly JPG zostaja lokalnie na PC (poza git).
#
# Uruchom (dziala z dowolnego folderu):
#   D:\www_work\garden\deploy\sync-article-images.bat
#   powershell -File D:\www_work\garden\deploy\sync-article-images.ps1
#
# W cmd: cd /d D:\www_work\garden   (wazne /d — inaczej zostajesz na C:)

param(
    [string]$RemoteHost = "debian@51.83.162.34",
    [string]$RemoteDir = "/opt/ogrodio/app/frontend/public/images/articles"
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$LocalDir = Join-Path $Root "frontend\public\images\articles"

if (-not (Test-Path $LocalDir)) {
    Write-Host "BLAD: Brak katalogu ze zdjeciami:" -ForegroundColor Red
    Write-Host "  $LocalDir"
    Write-Host ""
    Write-Host "Uruchom skrypt pelna sciezka, np.:"
    Write-Host "  D:\www_work\garden\deploy\sync-article-images.bat"
    exit 1
}

$files = Get-ChildItem $LocalDir -Filter *.webp -File
if ($files.Count -eq 0) {
    Write-Host "BLAD: Brak plikow .webp w $LocalDir" -ForegroundColor Red
    exit 1
}

$sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

Write-Host "Repo:   $Root"
Write-Host "Lokalnie: $LocalDir"
Write-Host "WebP: $($files.Count) plikow, ${sizeMB} MB (JPG pomijane)"
Write-Host "Cel: ${RemoteHost}:${RemoteDir}"
Write-Host ""
Write-Host "Podaj haslo SSH gdy zostaniesz poproszony..."
Write-Host ""

ssh $RemoteHost "mkdir -p `"$RemoteDir`""

$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if ($wsl) {
    try {
        $wslLocal = (wsl wslpath -a $LocalDir).Trim()
        if (-not $wslLocal) { throw "wslpath failed" }
        wsl rsync -avz --progress --include='*.webp' --exclude='*' "$wslLocal/" "${RemoteHost}:${RemoteDir}/"
    } catch {
        Write-Host "WSL rsync nieudany, uzywam tar+ssh..." -ForegroundColor Yellow
        Push-Location $LocalDir
        tar -cf - *.webp | ssh $RemoteHost "cd `"$RemoteDir`" && tar -xf -"
        Pop-Location
    }
} else {
    Write-Host "Wysylam przez tar+ssh (bez WSL)..."
    Push-Location $LocalDir
    tar -cf - *.webp | ssh $RemoteHost "cd `"$RemoteDir`" && tar -xf -"
    Pop-Location
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test:"
Write-Host "  curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
