#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting iOS Build Process..."

# 1. Build Frontend Web Assets
echo "🎨 Building Web Assets..."
bun run build

# 2. Sync app version into native targets
echo "🏷️  Syncing native versions..."
bun run version:sync

# 3. Sync Capacitor
echo "🔄 Syncing Capacitor web assets & plugins..."
npx cap sync ios

# 4. Open iOS Project in Xcode
echo "🛠️  Opening iOS project in Xcode..."
npx cap open ios

echo "✅ Success! Sync complete. Xcode is now open."
echo "👉 Instructions for App Store Archive:"
echo "   1. Select 'Any iOS Device (arm64)' as the build target in Xcode."
echo "   2. Click Product -> Archive from the top menu."
echo "   3. Follow the Xcode prompts to distribute/upload your app to App Store Connect."
