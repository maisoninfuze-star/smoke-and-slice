#!/usr/bin/env bash
# Turn the restaurant's phone footage into web-ready kitchen loops.
#
# Nothing generative happens here — this is a trim, a colour grade toward the
# brand's warm/dark look, and a compress. The cooking you see is the real
# kitchen. Audio is stripped because the loops autoplay muted.
#
# Excluded on purpose: WhatsApp videos 1 and 2 are wedding footage from a
# different client (a "Garry and Joanne" welcome sign and a banquet hall)
# and have nothing to do with this restaurant.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="brand/client-media/originals"
OUT="public/media"

# Brand grade: lift warmth, hold contrast, gentle vignette, no crushed blacks.
GRADE="eq=contrast=1.10:saturation=1.14:gamma=0.99:brightness=0.005,\
colorbalance=rs=0.045:gs=0.005:bs=-0.040:rm=0.030:bm=-0.030,\
vignette=angle=PI/5.2,\
scale=540:960:force_original_aspect_ratio=increase,crop=540:960"

encode () {  # encode <in> <ss> <t> <out>
  ffmpeg -hide_banner -loglevel error -y \
    -ss "$2" -t "$3" -i "$1" \
    -vf "$GRADE" \
    -c:v libx264 -profile:v high -crf 27 -preset slow \
    -pix_fmt yuv420p -movflags +faststart -an \
    "$4"
  printf "  %-28s %s\n" "$(basename "$4")" "$(du -h "$4" | cut -f1)"
}

echo "processing kitchen footage:"
encode "$SRC/video-3.mp4" 6   11   "$OUT/kitchen-pizza.mp4"
encode "$SRC/video-4.mp4" 0.5 11.5 "$OUT/kitchen-burger.mp4"

# Poster frames so the <video> has something to show before it buffers.
for n in pizza burger; do
  ffmpeg -hide_banner -loglevel error -y -ss 2 -i "$OUT/kitchen-$n.mp4" -frames:v 1 -q:v 4 "$OUT/kitchen-$n.jpg"
  printf "  %-28s %s\n" "kitchen-$n.jpg" "$(du -h "$OUT/kitchen-$n.jpg" | cut -f1)"
done
echo "done"
