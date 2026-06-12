#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Android Debug Build Process..."

# 1. Build Frontend Web Assets
echo "🎨 Building Web Assets..."
bun run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor web assets & plugins..."
npx cap sync android

# 3. Compile Android Debug APK
echo "🤖 Building Android Debug APK..."
cd android
./gradlew assembleDebug
cd ..

echo "✅ Success! Debug APK generated successfully."
echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
