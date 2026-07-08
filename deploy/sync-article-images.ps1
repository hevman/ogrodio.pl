# Wgranie zdjęć artykułów na VPS — tylko WebP (~52 MB)
# Oryginały JPG zostają lokalnie na PC (poza git).
#
#   .\deploy\sync-article-images.ps1
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

$files = Get-ChildItem $LocalDir -Filter *.webp -File
$sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

Write-Host "Lokalnie: $LocalDir"
Write-Host "WebP: $($files.Count) plikow, ${sizeMB} MB (JPG pomijane — tylko na PC)"
Write-Host "Cel: ${RemoteHost}:${RemoteDir}"
Write-Host ""
Write-Host "Podaj haslo SSH gdy zostaniesz poproszony..."
Write-Host ""

ssh $RemoteHost "mkdir -p `"$RemoteDir`""

$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if ($wsl) {
    $wslLocal = wsl wslpath -a $LocalDir
    wsl rsync -avz --progress --include='*.webp' --exclude='*' "$wslLocal/" "${RemoteHost}:${RemoteDir}/"
} else {
    foreach ($file in $files) {
        scp $file.FullName "${RemoteHost}:${RemoteDir}/"
    }
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test:"
Write-Host "  curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
