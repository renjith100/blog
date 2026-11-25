#!/usr/bin/env bash
# Renders the AI This Week explainer video.
#   ./make-video.sh                      -> out/ai-this-week.mp4 (silent)
#   ./make-video.sh path/to/music.mp3    -> also out/ai-this-week-with-music.mp4
#   STILLS=6,19.5,27.5 ./make-video.sh   -> only PNG stills at those seconds, for checking
set -euo pipefail
# Turn the music path into an absolute one before changing folders, so a
# path relative to where you ran the script still works
music=""
if [[ -n "${1:-}" ]]; then
  [[ -f "$1" ]] || { echo "music file not found: $1" >&2; exit 1; }
  music="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
fi
cd "$(dirname "$0")"
node build.mjs
if [[ -n "${STILLS:-}" ]]; then
  rm -rf out/stills && node record.mjs out/scene.html out/stills 30 "$STILLS"
  echo "stills in $(pwd)/out/stills"; exit 0
fi
rm -rf out/frames
node record.mjs out/scene.html out/frames 30
ffmpeg -v error -y -framerate 30 -i out/frames/%05d.jpg -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart -an out/ai-this-week.mp4
rm -rf out/frames
echo "video: $(pwd)/out/ai-this-week.mp4"
if [[ -n "$music" ]]; then
  # Music fades in over 0.6s and out over the last 3.5s
  len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/ai-this-week.mp4)
  fade=$(echo "$len - 3.5" | bc)
  ffmpeg -v error -y -i out/ai-this-week.mp4 -i "$music" -map 0:v -map 1:a -c:v copy \
    -af "afade=t=in:st=0:d=0.6,afade=t=out:st=${fade}:d=3.5" -c:a aac -b:a 192k -t "$len" -movflags +faststart out/ai-this-week-with-music.mp4
  echo "with music: $(pwd)/out/ai-this-week-with-music.mp4"
fi
