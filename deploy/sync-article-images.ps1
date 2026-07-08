# Wgranie zdjec artykulow na VPS - tylko WebP, plik po pliku (rsync/scp)
# Przy kolejnych uruchomieniach rsync wysyla tylko nowe/zmienione pliki.
# Oryginaly JPG zostaja lokalnie na PC.
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
    throw "Nie mozna przekonwertowac sciezki: $Path"
}

function Find-Rsync {
    $wsl = Get-Command wsl -ErrorAction SilentlyContinue
    if ($wsl) { return @{ Type = "wsl"; Bin = "wsl" } }

    $gitRsync = Join-Path ${env:ProgramFiles} "Git\usr\bin\rsync.exe"
    if (Test-Path $gitRsync) { return @{ Type = "git"; Bin = $gitRsync } }

    $gitRsync32 = Join-Path ${env:ProgramFiles(x86)} "Git\usr\bin\rsync.exe"
    if (Test-Path $gitRsync32) { return @{ Type = "git"; Bin = $gitRsync32 } }

    return $null
}

function Invoke-RsyncUpload {
    param(
        [hashtable]$Rsync,
        [string]$LocalDir,
        [string]$Remote,
        [string]$RemotePath
    )

    if ($Rsync.Type -eq "wsl") {
        $wslLocal = Convert-ToWslPath $LocalDir
        $wslArgs = @(
            "rsync",
            "-avz",
            "--progress",
            "--include=*.webp",
            "--exclude=*",
            "$wslLocal/",
            "${Remote}:${RemotePath}/"
        )
        & wsl @wslArgs
    } else {
        $localUnix = ($LocalDir -replace '\\', '/') + "/"
        $rsyncArgs = @(
            "-avz",
            "--progress",
            "--include=*.webp",
            "--exclude=*",
            $localUnix,
            "${Remote}:${RemotePath}/"
        )
        & $Rsync.Bin @rsyncArgs
    }

    if ($LASTEXITCODE -ne 0) {
        throw "rsync zakonczyl sie kodem $LASTEXITCODE"
    }
}

function Invoke-ScpUpload {
    param(
        [string]$Remote,
        [string]$RemotePath,
        [System.IO.FileInfo[]]$Files
    )

    $socket = Join-Path $env:TEMP ("ogrodio-ssh-{0}" -f [guid]::NewGuid().ToString('n'))
    try {
        ssh -o ControlMaster=yes -o ControlPath=$socket -o ControlPersist=120 `
            $Remote "mkdir -p `"$RemotePath`""

        $i = 0
        foreach ($file in $Files) {
            $i++
            Write-Host "[$i/$($Files.Count)] $($file.Name)"
            scp -o ControlPath=$socket $file.FullName "${Remote}:${RemotePath}/"
            if ($LASTEXITCODE -ne 0) {
                throw "scp nieudany dla $($file.Name)"
            }
        }
    } finally {
        ssh -o ControlPath=$socket -O exit $Remote 2>$null
    }
}

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$LocalDir = Join-Path $Root "frontend\public\images\articles"

if (-not (Test-Path $LocalDir)) {
    Write-Host "BLAD: Brak katalogu: $LocalDir" -ForegroundColor Red
    exit 1
}

$files = @(Get-ChildItem $LocalDir -Filter *.webp -File)
if ($files.Count -eq 0) {
    Write-Host "BLAD: Brak plikow .webp" -ForegroundColor Red
    exit 1
}

$sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

Write-Host "Repo:     $Root"
Write-Host "Lokalnie: $LocalDir"
Write-Host "WebP:     $($files.Count) plikow, ${sizeMB} MB (JPG pomijane)"
Write-Host "Cel:      ${RemoteHost}:${RemoteDir}"
Write-Host ""

$rsync = Find-Rsync
if ($rsync) {
    Write-Host "Tryb: rsync (tylko nowe/zmienione pliki)..."
    Write-Host "Podaj haslo SSH gdy zostaniesz poproszony..."
    Write-Host ""
    Invoke-RsyncUpload -Rsync $rsync -LocalDir $LocalDir -Remote $RemoteHost -RemotePath $RemoteDir
} else {
    Write-Host "Tryb: scp plik po pliku (brak rsync - zainstaluj WSL lub Git for Windows)"
    Write-Host "Podaj haslo SSH raz na poczatku..."
    Write-Host ""
    Invoke-ScpUpload -Remote $RemoteHost -RemotePath $RemoteDir -Files $files
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test: curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
