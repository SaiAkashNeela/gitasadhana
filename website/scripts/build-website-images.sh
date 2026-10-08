#!/usr/bin/env bash
# Web-sized artwork for website/ from the app's assets (macOS `sips`).
set -euo pipefail
cd "$(dirname "$0")/../.."
W=website/assets
mkdir -p $W/art/chapters $W/art/thumbs $W/art/scenes $W/icons
cp app/assets/art/chapters/*.jpg $W/art/chapters/
cp app/assets/art/scenes/*.jpg $W/art/scenes/
cp app/assets/art/welcome-journey.jpg app/assets/art/listen-return.jpg app/assets/art/read-focus.jpg app/assets/art/lord-krishna.jpg $W/art/
for f in app/assets/art/chapters/*.jpg; do sips -s format jpeg -s formatOptions 72 -Z 320 "$f" --out "$W/art/thumbs/$(basename "$f")" >/dev/null; done
cp app/assets/art/brand/emblem.png $W/icons/emblem.png
sips -s format png -Z 180 app/assets/images/icon.png --out $W/icons/apple-touch-icon.png >/dev/null
sips -s format png -Z 192 app/assets/images/icon.png --out $W/icons/icon-192.png >/dev/null
sips -s format png -Z 512 app/assets/images/icon.png --out $W/icons/icon-512.png >/dev/null
sips -s format png -Z 512 app/assets/images/android-icon-foreground.png --out $W/icons/maskable-512.png >/dev/null
sips -s format png -Z 64 app/assets/art/brand/emblem.png --out $W/icons/favicon.png >/dev/null
sips -s format jpeg -s formatOptions 80 -Z 1200 app/assets/art/scenes/scene-1.jpg --out $W/icons/og-image.jpg >/dev/null
echo "website images ready"
