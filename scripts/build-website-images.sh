#!/usr/bin/env bash
# Web-sized artwork for website/ from the app's assets (macOS `sips`).
set -euo pipefail
cd "$(dirname "$0")/.."
W=website/assets
mkdir -p $W/art/chapters $W/art/thumbs $W/art/scenes $W/icons
cp assets/art/chapters/*.jpg $W/art/chapters/
cp assets/art/scenes/*.jpg $W/art/scenes/
cp assets/art/welcome-journey.jpg assets/art/listen-return.jpg assets/art/read-focus.jpg assets/art/lord-krishna.jpg $W/art/
for f in assets/art/chapters/*.jpg; do sips -s format jpeg -s formatOptions 72 -Z 320 "$f" --out "$W/art/thumbs/$(basename "$f")" >/dev/null; done
cp assets/art/brand/emblem.png $W/icons/emblem.png
sips -s format png -Z 180 assets/images/icon.png --out $W/icons/apple-touch-icon.png >/dev/null
sips -s format png -Z 192 assets/images/icon.png --out $W/icons/icon-192.png >/dev/null
sips -s format png -Z 512 assets/images/icon.png --out $W/icons/icon-512.png >/dev/null
sips -s format png -Z 512 assets/images/android-icon-foreground.png --out $W/icons/maskable-512.png >/dev/null
sips -s format png -Z 64 assets/art/brand/emblem.png --out $W/icons/favicon.png >/dev/null
sips -s format jpeg -s formatOptions 80 -Z 1200 assets/art/scenes/scene-1.jpg --out $W/icons/og-image.jpg >/dev/null
echo "website images ready"
