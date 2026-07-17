#!/bin/bash
# Transkodowanie wideo do HLS z wieloma jakościami
#
# Użycie:
#   ./transcode-video.sh <nazwa_pliku_bez_rozszerzenia>
#
# Przykład:
#   ./transcode-video.sh oregano-owady-kwitnienie
#
# Plik źródłowy:  /opt/ogrodio/data/videos/raw/<nazwa>.mp4
# Wynik HLS:      /opt/ogrodio/data/videos/hls/<nazwa>/
# Plik po ENCODE: /opt/ogrodio/app/frontend/public/images/articles/<nazwa>.mp4 (usunięty)

set -e

NAME="$1"
if [ -z "$NAME" ]; then
  echo "BŁĄD: Podaj nazwę pliku bez rozszerzenia"
  echo "Użycie: $0 <nazwa>"
  exit 1
fi

RAW_DIR="/opt/ogrodio/data/videos/raw"
HLS_DIR="/opt/ogrodio/data/videos/hls"
INPUT="$RAW_DIR/${NAME}.mp4"

if [ ! -f "$INPUT" ]; then
  # Sprawdź też czy plik jest już w images/articles (wgrany przez scp)
  ARTICLES_INPUT="/opt/ogrodio/app/frontend/public/images/articles/${NAME}.mp4"
  if [ -f "$ARTICLES_INPUT" ]; then
    echo "Znaleziono plik w images/articles, przenoszę do raw..."
    mkdir -p "$RAW_DIR"
    mv "$ARTICLES_INPUT" "$INPUT"
  else
    echo "BŁĄD: Nie znaleziono pliku: $INPUT"
    echo "Wgraj plik do: $RAW_DIR/"
    exit 1
  fi
fi

OUTPUT_DIR="$HLS_DIR/$NAME"
mkdir -p "$OUTPUT_DIR"

echo "=== Transkodowanie: $NAME ==="
echo "Wejście:  $INPUT"
echo "Wyjście:  $OUTPUT_DIR"
echo ""

# Sprawdź rozdzielczość źródła
RESOLUTION=$(docker run --rm -v "$RAW_DIR:/input:ro" linuxserver/ffmpeg \
  -ffprobe -v quiet -select_streams v:0 \
  -show_entries stream=width,height \
  -of csv=s=x:p=0 /input/${NAME}.mp4 2>/dev/null || echo "unknown")

echo "Rozdzielczość źródłowa: $RESOLUTION"
echo ""

# Transkodowanie HLS - warianty jakości
# Każda jakość: playlist + segmenty 6s
docker run --rm \
  -v "$RAW_DIR:/input:ro" \
  -v "$OUTPUT_DIR:/output" \
  linuxserver/ffmpeg \
  -i "/input/${NAME}.mp4" \
  -filter_complex \
    "[0:v]split=4[v1][v2][v3][v4]; \
     [v1]scale=w=854:h=480:force_original_aspect_ratio=decrease[v480]; \
     [v2]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v720]; \
     [v3]scale=w=1920:h=1080:force_original_aspect_ratio=decrease[v1080]; \
     [v4]scale=w=3840:h=2160:force_original_aspect_ratio=decrease[v2160]" \
  -map "[v480]"  -map 0:a? -c:v:0 libx264 -crf 23 -preset fast -c:a:0 aac -b:a:0 96k  \
    -hls_time 6 -hls_playlist_type vod -hls_segment_filename /output/480p_%04d.ts \
    /output/480p.m3u8 \
  -map "[v720]"  -map 0:a? -c:v:1 libx264 -crf 22 -preset fast -c:a:1 aac -b:a:1 128k \
    -hls_time 6 -hls_playlist_type vod -hls_segment_filename /output/720p_%04d.ts \
    /output/720p.m3u8 \
  -map "[v1080]" -map 0:a? -c:v:2 libx264 -crf 21 -preset fast -c:a:2 aac -b:a:2 128k \
    -hls_time 6 -hls_playlist_type vod -hls_segment_filename /output/1080p_%04d.ts \
    /output/1080p.m3u8 \
  -map "[v2160]" -map 0:a? -c:v:3 libx264 -crf 20 -preset fast -c:a:3 aac -b:a:3 192k \
    -hls_time 6 -hls_playlist_type vod -hls_segment_filename /output/4k_%04d.ts \
    /output/4k.m3u8

echo ""
echo "=== Generowanie master playlisty ==="

# Master playlist - przeglądarka wybiera jakość automatycznie
cat > "$OUTPUT_DIR/playlist.m3u8" << EOF
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
EOF

echo "Gotowe! Pliki HLS:"
ls -lh "$OUTPUT_DIR"
echo ""
echo "URL playlisty: /videos/$NAME/playlist.m3u8"
echo ""
echo "Zaktualizuj artykuł JSON:"
echo "  \"video\": {"
echo "    \"src\": \"/videos/$NAME/playlist.m3u8\","
echo "    \"poster\": \"/images/articles/${NAME}-cover.webp\","
echo "    \"alt\": \"...\""
echo "  }"
