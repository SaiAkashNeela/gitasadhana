#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Android Play Store Release Build Process..."

# 1. Build Frontend Web Assets
echo "🎨 Building Web Assets..."
bun run build

# 2. Sync app version into native targets
echo "🏷️  Syncing native versions..."
bun run version:sync

# 3. Sync Capacitor
echo "🔄 Syncing Capacitor web assets & plugins..."
npx cap sync android

# 4. Compile Android Release AAB (Android App Bundle)
echo "🤖 Building Android Release AAB (Play Store)..."
cd android
./gradlew bundleRelease
cd ..

echo "✅ Success! Release App Bundle (AAB) generated successfully."
echo "📍 Location: android/app/build/outputs/bundle/release/app-release.aab"
echo "⚠️  Note: Make sure to sign this AAB with your release keystore before uploading to Google Play Console."
