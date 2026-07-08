# Wgranie zdjec artykulow na VPS — tylko WebP (~52 MB)
# Oryginaly JPG zostaja lokalnie na PC (poza git).
#
#   D:\www_work\garden\deploy\sync-article-images.bat
#   powershell -File D:\www_work\garden\deploy\sync-article-images.ps1

param(
    [string]$RemoteHost = "debian@51.83.162.34",
    [string]$RemoteDir = "/opt/ogrodio/app/frontend/public/images/articles"
)

$ErrorActionPreference = "Stop"

function Convert-ToWslPath([string]$Path) {
    $full = (Resolve-Path $Path).Path
    if ($full -match '^([A-Za-z]):\\(.*)$') {
        $drive = $matches[1].ToLower()
        $rest = $matches[2] -replace '\\', '/'
        return "/mnt/$drive/$rest"
    }
    throw "Nie mozna przekonwertowac sciezki Windows na WSL: $Path"
}

function Invoke-CmdTarPipe {
    param([string]$SourceDir, [string]$Remote, [string]$RemotePath)
    # cmd.exe zachowuje binarny strumien tar (PowerShell | psuje archiwum)
    $inner = "cd /d `"$SourceDir`" && tar -cf - *.webp | ssh $Remote `"mkdir -p $RemotePath && cd $RemotePath && tar -xf -`""
    cmd /c $inner
    if ($LASTEXITCODE -ne 0) { throw "tar+ssh zakonczyl sie kodem $LASTEXITCODE" }
}

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$LocalDir = Join-Path $Root "frontend\public\images\articles"

if (-not (Test-Path $LocalDir)) {
    Write-Host "BLAD: Brak katalogu: $LocalDir" -ForegroundColor Red
    Write-Host "Uruchom: D:\www_work\garden\deploy\sync-article-images.bat"
    exit 1
}

$files = Get-ChildItem $LocalDir -Filter *.webp -File
if ($files.Count -eq 0) {
    Write-Host "BLAD: Brak plikow .webp w $LocalDir" -ForegroundColor Red
    exit 1
}

$sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

Write-Host "Repo:     $Root"
Write-Host "Lokalnie: $LocalDir"
Write-Host "WebP:     $($files.Count) plikow, ${sizeMB} MB (JPG pomijane)"
Write-Host "Cel:      ${RemoteHost}:${RemoteDir}"
Write-Host ""
Write-Host "Podaj haslo SSH (moze byc 2x — mkdir + upload)..."
Write-Host ""

ssh $RemoteHost "mkdir -p `"$RemoteDir`""

$uploaded = $false
$wsl = Get-Command wsl -ErrorAction SilentlyContinue

if ($wsl) {
    try {
        $wslLocal = Convert-ToWslPath $LocalDir
        Write-Host "WSL rsync z: $wslLocal"
        wsl rsync -avz --progress --include='*.webp' --exclude='*' "$wslLocal/" "${RemoteHost}:${RemoteDir}/"
        if ($LASTEXITCODE -eq 0) { $uploaded = $true }
    } catch {
        Write-Host "WSL rsync nieudany: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if (-not $uploaded) {
    Write-Host "Wysylam przez tar+ssh (cmd.exe)..."
    Invoke-CmdTarPipe -SourceDir $LocalDir -Remote $RemoteHost -RemotePath $RemoteDir
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test: curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
