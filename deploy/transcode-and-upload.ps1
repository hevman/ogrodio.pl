# Transkodowanie wideo do HLS lokalnie przez Docker + wysłanie na VPS
#
# Użycie:
#   .\deploy\transcode-and-upload.ps1 -Name oregano-owady-kwitnienie
#
# Plik źródłowy:  D:\www_work\garden\data\<Name>.mp4
# Wynik lokalny:  D:\www_work\garden\data\videos\hls\<Name>\
# Cel na VPS:     /opt/ogrodio/data/videos/hls/<Name>/

param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [string]$RemoteHost = "debian@51.83.162.34",
    [string]$RemoteDir  = "/opt/ogrodio/data/videos/hls",

    [switch]$SkipTranscode,  # Pomiń transkodowanie, tylko wyślij
    [switch]$SkipUpload      # Tylko transkoduj, nie wysyłaj
)

$ErrorActionPreference = "Stop"

$Root      = (Resolve-Path "$PSScriptRoot\..").Path
$DataDir   = Join-Path $Root "data"
$RawDir    = Join-Path $DataDir "videos\raw"
$HlsDir    = Join-Path $DataDir "videos\hls"
$OutputDir = Join-Path $HlsDir $Name
$InputFile = Join-Path $RawDir "$Name.mp4"

# Sprawdź plik źródłowy
if (-not $SkipTranscode) {
    if (-not (Test-Path $InputFile)) {
        # Sprawdź też w data/ bezpośrednio
        $AltInput = Join-Path $DataDir "$Name.mp4"
        if (Test-Path $AltInput) {
            Write-Host "Znaleziono plik w data/, przenoszę do raw..."
            New-Item -ItemType Directory -Path $RawDir -Force | Out-Null
            Move-Item $AltInput $InputFile
        } else {
            Write-Host "BŁĄD: Nie znaleziono pliku: $InputFile" -ForegroundColor Red
            Write-Host "Skopiuj plik do: $RawDir\" -ForegroundColor Yellow
            exit 1
        }
    }

    # Sprawdź czy Docker działa
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "BŁĄD: Docker nie jest uruchomiony" -ForegroundColor Red
        exit 1
    }

    # Przygotuj folder wyjściowy
    if (Test-Path $OutputDir) {
        Write-Host "Czyszczę poprzedni output: $OutputDir"
        Remove-Item -Recurse -Force $OutputDir
    }
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

    # Konwertuj ścieżki Windows na format Docker
    $DockerRawDir    = $RawDir    -replace '\\', '/' -replace '^([A-Za-z]):', '//$1'
    $DockerOutputDir = $OutputDir -replace '\\', '/' -replace '^([A-Za-z]):', '//$1'

    Write-Host ""
    Write-Host "=== Transkodowanie: $Name ===" -ForegroundColor Cyan
    Write-Host "Wejście:  $InputFile"
    Write-Host "Wyjście:  $OutputDir"
    Write-Host ""
    Write-Host "Trwa transkodowanie 4 jakości (480p/720p/1080p/4K)..."
    Write-Host "To może potrwać kilka minut zależnie od długości filmu."
    Write-Host ""

    $startTime = Get-Date

    docker run --rm `
        -v "${DockerRawDir}:/input:ro" `
        -v "${DockerOutputDir}:/output" `
        linuxserver/ffmpeg `
        -i "/input/${Name}.mp4" `
        -filter_complex `
            "[0:v]split=4[v1][v2][v3][v4]; ``
             [v1]scale=w=trunc(oh*a/2)*2:h=480[v480]; ``
             [v2]scale=w=trunc(oh*a/2)*2:h=720[v720]; ``
             [v3]scale=w=trunc(oh*a/2)*2:h=1080[v1080]; ``
             [v4]scale=w=trunc(oh*a/2)*2:h=2160[v2160]" `
        -map "[v480]"  -map "0:a?" -c:v:0 libx264 -crf 23 -preset fast -c:a:0 aac -b:a 96k `
            -hls_time 6 -hls_playlist_type vod -hls_segment_filename "/output/480p_%04d.ts" `
            /output/480p.m3u8 `
        -map "[v720]"  -map "0:a?" -c:v:1 libx264 -crf 22 -preset fast -c:a:1 aac -b:a 128k `
            -hls_time 6 -hls_playlist_type vod -hls_segment_filename "/output/720p_%04d.ts" `
            /output/720p.m3u8 `
        -map "[v1080]" -map "0:a?" -c:v:2 libx264 -crf 21 -preset fast -c:a:2 aac -b:a 128k `
            -hls_time 6 -hls_playlist_type vod -hls_segment_filename "/output/1080p_%04d.ts" `
            /output/1080p.m3u8 `
        -map "[v2160]" -map "0:a?" -c:v:3 libx264 -crf 20 -preset fast -c:a:3 aac -b:a 192k `
            -hls_time 6 -hls_playlist_type vod -hls_segment_filename "/output/4k_%04d.ts" `
            /output/4k.m3u8

    if ($LASTEXITCODE -ne 0) {
        Write-Host "" 
        Write-Host "BŁĄD: Transkodowanie nieudane (kod: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }

    # Master playlist
    $masterPlaylist = @"
#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480,NAME="480p"
480p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720,NAME="720p"
720p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,NAME="1080p"
1080p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=15000000,RESOLUTION=3840x2160,NAME="4K"
4k.m3u8
"@
    $masterPlaylist | Out-File -FilePath (Join-Path $OutputDir "playlist.m3u8") -Encoding utf8 -NoNewline

    $elapsed = (Get-Date) - $startTime
    $files = Get-ChildItem $OutputDir
    $sizeMB = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)

    Write-Host ""
    Write-Host "Transkodowanie ukończone w $([math]::Round($elapsed.TotalSeconds))s" -ForegroundColor Green
    Write-Host "Pliki: $($files.Count), rozmiar: ${sizeMB} MB"
    Write-Host ""
}

if ($SkipUpload) {
    Write-Host "Pomijam upload (SkipUpload)."
    exit 0
}

# Upload na VPS przez SCP
Write-Host "=== Wysyłanie na VPS ===" -ForegroundColor Cyan
Write-Host "Cel: ${RemoteHost}:${RemoteDir}/${Name}/"
Write-Host ""

# Utwórz katalog na VPS
ssh $RemoteHost "mkdir -p `"$RemoteDir/$Name`""

# Wyślij wszystkie pliki
$files = @(Get-ChildItem $OutputDir -File)
$uploaded = 0
$skipped = 0
$i = 0

# Pobierz rozmiary istniejących plików na VPS
$remoteSizes = @{}
$remoteList = ssh $RemoteHost "find '$RemoteDir/$Name' -maxdepth 1 -type f -printf '%f %s\n' 2>/dev/null || true"
foreach ($line in ($remoteList -split "`n")) {
    if ($line -match '^(\S+)\s+(\d+)$') {
        $remoteSizes[$Matches[1]] = [int64]$Matches[2]
    }
}

foreach ($file in $files) {
    $i++
    if ($remoteSizes.ContainsKey($file.Name) -and $remoteSizes[$file.Name] -eq $file.Length) {
        Write-Host "[$i/$($files.Count)] skip  $($file.Name)"
        $skipped++
        continue
    }
    Write-Host "[$i/$($files.Count)] upload $($file.Name) ($([math]::Round($file.Length/1KB))KB)"
    scp $file.FullName "${RemoteHost}:${RemoteDir}/${Name}/"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "BŁĄD: scp nieudany dla $($file.Name)" -ForegroundColor Red
        exit 1
    }
    $uploaded++
}

Write-Host ""
Write-Host "Upload ukończony. Wysłano: $uploaded, pominięto: $skipped" -ForegroundColor Green
Write-Host ""
Write-Host "URL playlisty: /videos/$Name/playlist.m3u8" -ForegroundColor Cyan
Write-Host ""
Write-Host "Artykuł JSON - pole video:"
Write-Host "  `"video`": {"
Write-Host "    `"src`": `"/videos/$Name/playlist.m3u8`","
Write-Host "    `"poster`": `"/images/articles/$Name-cover.webp`","
Write-Host "    `"alt`": `"Film: ..`""
Write-Host "  }"
