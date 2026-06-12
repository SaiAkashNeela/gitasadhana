#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Android Debug Build Process..."

# 1. Build and Deploy Cloud Functions
echo "📦 Building Cloud Functions..."
cd functions
bun run build
cd ..

echo "☁️ Deploying Cloud Functions to Firebase..."
npx firebase-tools deploy --only functions --force

# 2. Build Frontend Web Assets
echo "🎨 Building Web Assets..."
bun run build

# 3. Sync Capacitor
echo "🔄 Syncing Capacitor web assets & plugins..."
npx cap sync android

# 4. Compile Android Debug APK
echo "🤖 Building Android Debug APK..."
cd android
./gradlew assembleDebug
cd ..

echo "✅ Success! Debug APK generated successfully."
echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
