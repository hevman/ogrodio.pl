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

function Test-RemoteRsync {
    param([string]$Remote)
    ssh $Remote "command -v rsync >/dev/null 2>&1"
    return ($LASTEXITCODE -eq 0)
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

    return ($LASTEXITCODE -eq 0)
}

function Get-RemoteWebpSizes {
    param(
        [string]$Remote,
        [string]$RemotePath,
        [string]$Socket
    )

    $sizes = @{}
    $lines = ssh -o ControlPath=$Socket $Remote `
        "find '$RemotePath' -maxdepth 1 -name '*.webp' -printf '%f %s\n' 2>/dev/null || true"

    foreach ($line in ($lines -split "`n")) {
        if ($line -match '^(\S+)\s+(\d+)$') {
            $sizes[$Matches[1]] = [int64]$Matches[2]
        }
    }

    return $sizes
}

function Invoke-ScpUpload {
    param(
        [string]$Remote,
        [string]$RemotePath,
        [System.IO.FileInfo[]]$Files
    )

    $socket = Join-Path $env:TEMP ("ogrodio-ssh-{0}" -f [guid]::NewGuid().ToString('n'))
    $uploaded = 0
    $skipped = 0

    try {
        ssh -o ControlMaster=yes -o ControlPath=$socket -o ControlPersist=120 `
            $Remote "mkdir -p `"$RemotePath`""

        $remoteSizes = Get-RemoteWebpSizes -Remote $Remote -RemotePath $RemotePath -Socket $socket

        $i = 0
        foreach ($file in $Files) {
            $i++
            if ($remoteSizes.ContainsKey($file.Name) -and $remoteSizes[$file.Name] -eq $file.Length) {
                Write-Host "[$i/$($Files.Count)] skip $($file.Name)"
                $skipped++
                continue
            }

            Write-Host "[$i/$($Files.Count)] upload $($file.Name)"
            scp -o ControlPath=$socket $file.FullName "${Remote}:${RemotePath}/"
            if ($LASTEXITCODE -ne 0) {
                throw "scp nieudany dla $($file.Name)"
            }
            $uploaded++
        }
    } finally {
        ssh -o ControlPath=$socket -O exit $Remote 2>$null
    }

    Write-Host ""
    Write-Host "SCP: wyslano $uploaded, pominieto $skipped (bez zmian)"
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
Write-Host "Podaj haslo SSH gdy zostaniesz poproszony..."
Write-Host ""

ssh $RemoteHost "mkdir -p `"$RemoteDir`""

$usedRsync = $false
$rsync = Find-Rsync
if ($rsync -and (Test-RemoteRsync -Remote $RemoteHost)) {
    Write-Host "Tryb: rsync (tylko nowe/zmienione pliki)..."
    Write-Host ""
    $usedRsync = Invoke-RsyncUpload -Rsync $rsync -LocalDir $LocalDir -Remote $RemoteHost -RemotePath $RemoteDir
    if (-not $usedRsync) {
        Write-Host "rsync nieudany, przechodze na scp..." -ForegroundColor Yellow
        Write-Host ""
    }
} elseif ($rsync) {
    Write-Host "Na VPS brak rsync - uzywam scp plik po pliku."
    Write-Host "Opcjonalnie na serwerze: sudo apt install -y rsync"
    Write-Host ""
}

if (-not $usedRsync) {
    Write-Host "Tryb: scp (pomija pliki o tym samym rozmiarze na serwerze)..."
    Write-Host ""
    Invoke-ScpUpload -Remote $RemoteHost -RemotePath $RemoteDir -Files $files
}

Write-Host ""
Write-Host "Gotowe."
Write-Host "Test: curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
