#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting iOS Build Process..."

tmp_version_file="$(mktemp /tmp/gita-sadhana-ios-version.XXXXXX.json)"
tmp_android_backup="$(mktemp /tmp/gita-android-iosbuild.XXXXXX.gradle)"
tmp_ios_backup="$(mktemp /tmp/gita-ios-iosbuild.XXXXXX.pbxproj)"
cp android/app/build.gradle "$tmp_android_backup"
cp ios/App/App.xcodeproj/project.pbxproj "$tmp_ios_backup"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    cp "$tmp_android_backup" android/app/build.gradle
    cp "$tmp_ios_backup" ios/App/App.xcodeproj/project.pbxproj
  fi
  rm -f "$tmp_version_file"
  rm -f "$tmp_android_backup"
  rm -f "$tmp_ios_backup"
}
trap cleanup EXIT

# 1. Prepare the next release version without persisting it yet
echo "🏷️  Preparing next release version..."
node -e "const fs=require('fs'); const path=require('path'); const current=JSON.parse(fs.readFileSync('app-version.json','utf8')); const match=String(current.marketingVersion ?? '1.0.0').trim().match(/^(\\d+)\\.(\\d+)\\.(\\d+)$/); if(!match) throw new Error('Invalid marketingVersion: '+current.marketingVersion); const marketingVersion=match[1]+'.'+match[2]+'.'+(Number(match[3])+1); const buildNumber=Number(current.buildNumber ?? 0)+1; fs.writeFileSync(path.resolve(process.argv[1]), JSON.stringify({ ...current, marketingVersion, buildNumber }, null, 2)+'\\n');" "$tmp_version_file"

# 2. Build Frontend Web Assets
echo "🎨 Building Web Assets..."
bun run build

# 3. Sync app version into native targets
echo "🏷️  Syncing native versions..."
VERSION_FILE="$tmp_version_file" bun run version:sync

# 4. Sync Capacitor
echo "🔄 Syncing Capacitor web assets & plugins..."
npx cap sync ios

# 5. Open iOS Project in Xcode
echo "🛠️  Opening iOS project in Xcode..."
npx cap open ios

cp "$tmp_version_file" app-version.json

echo "✅ Success! Sync complete. Xcode is now open."
echo "👉 Instructions for App Store Archive:"
echo "   1. Select 'Any iOS Device (arm64)' as the build target in Xcode."
echo "   2. Click Product -> Archive from the top menu."
echo "   3. Follow the Xcode prompts to distribute/upload your app to App Store Connect."
