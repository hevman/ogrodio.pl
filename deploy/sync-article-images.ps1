# Wgranie zdjęć artykułów na VPS (katalog poza git, ~350 MB)
# Uruchom z PowerShell w katalogu repo:
#   .\deploy\sync-article-images.ps1
#
# Opcjonalnie:
#   .\deploy\sync-article-images.ps1 -RemoteHost debian@51.83.162.34

param(
    [string]$RemoteHost = "debian@51.83.162.34",
    [string]$RemoteDir = "/opt/ogrodio/app/frontend/public/images/articles"
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$LocalDir = Join-Path $Root "frontend/public/images/articles"

if (-not (Test-Path $LocalDir)) {
    throw "Brak katalogu: $LocalDir"
}

$files = Get-ChildItem $LocalDir -File
$sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

Write-Host "Lokalnie: $LocalDir"
Write-Host "Plikow: $($files.Count), rozmiar: ${sizeMB} MB"
Write-Host "Cel: ${RemoteHost}:${RemoteDir}"
Write-Host ""
Write-Host "Podaj haslo SSH gdy zostaniesz poproszony..."
Write-Host ""

ssh $RemoteHost "mkdir -p `"$RemoteDir`""

# Prefer WSL rsync (szybszy, wznawialny); fallback: scp
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if ($wsl) {
    $wslLocal = wsl wslpath -a $LocalDir
    wsl rsync -avz --progress "$wslLocal/" "${RemoteHost}:${RemoteDir}/"
} else {
    scp -r "$LocalDir/." "${RemoteHost}:${RemoteDir}/"
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test na VPS lub lokalnie:"
Write-Host "  curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
