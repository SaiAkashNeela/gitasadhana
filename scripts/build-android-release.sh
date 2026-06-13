#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Android Play Store Release Build Process..."

tmp_version_file="$(mktemp /tmp/gita-sadhana-version.XXXXXX.json)"
tmp_android_backup="$(mktemp /tmp/gita-android-build.XXXXXX.gradle)"
tmp_ios_backup="$(mktemp /tmp/gita-ios-build.XXXXXX.pbxproj)"
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
npx cap sync android

# 5. Compile Android Release AAB (Android App Bundle)
echo "🤖 Building Android Release AAB (Play Store)..."
cd android
./gradlew bundleRelease
cd ..

cp "$tmp_version_file" app-version.json
version=$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync('app-version.json','utf8')); process.stdout.write(String(v.marketingVersion ?? '1.0.0'));")
versioned_aab="android/app/build/outputs/bundle/release/gita-sadhana-v${version}.aab"
cp "android/app/build/outputs/bundle/release/app-release.aab" "$versioned_aab"

echo "✅ Success! Release App Bundle (AAB) generated successfully."
echo "📍 Location: android/app/build/outputs/bundle/release/app-release.aab"
echo "📦 Versioned copy: $versioned_aab"
echo "🔐 Release signing uses /Users/saiakashneela/android-certs/gitasadhana/gita.jks by default."
echo "⚠️  If your alias/passwords are not configured, Gradle will stop before producing an unsigned release."
