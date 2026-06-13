#!/bin/bash
set -e

echo "🚀 Starting iOS App Store Release Build..."

release_root="/private/tmp/gita-sadhana-ios-release"
derived_data_path="$release_root/DerivedData"
archive_path="$release_root/GitaSadhanaApp.xcarchive"
export_path="$release_root/Exported"
export_plist="$release_root/ExportOptions.plist"
apple_id="saiakashneela@icloud.com"
version_file="$(mktemp /tmp/gita-sadhana-ios-version.XXXXXX.json)"
tmp_android_backup="$(mktemp /tmp/gita-android-iosrelease.XXXXXX.gradle)"
tmp_ios_backup="$(mktemp /tmp/gita-ios-iosrelease.XXXXXX.pbxproj)"

mkdir -p "$release_root"
cp android/app/build.gradle "$tmp_android_backup"
cp ios/App/App.xcodeproj/project.pbxproj "$tmp_ios_backup"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    cp "$tmp_android_backup" android/app/build.gradle
    cp "$tmp_ios_backup" ios/App/App.xcodeproj/project.pbxproj
  fi
  rm -f "$version_file"
  rm -f "$tmp_android_backup"
  rm -f "$tmp_ios_backup"
  rm -f "$export_plist"
}
trap cleanup EXIT

echo "🏷️  Preparing next release version..."
node -e "const fs=require('fs'); const path=require('path'); const current=JSON.parse(fs.readFileSync('app-version.json','utf8')); const match=String(current.marketingVersion ?? '1.0.0').trim().match(/^(\\d+)\\.(\\d+)\\.(\\d+)$/); if(!match) throw new Error('Invalid marketingVersion: '+current.marketingVersion); const marketingVersion=match[1]+'.'+match[2]+'.'+(Number(match[3])+1); const buildNumber=Number(current.buildNumber ?? 0)+1; fs.writeFileSync(path.resolve(process.argv[1]), JSON.stringify({ ...current, marketingVersion, buildNumber }, null, 2)+'\\n');" "$version_file"

echo "🎨 Building Web Assets..."
bun run build

echo "🏷️  Syncing native versions..."
VERSION_FILE="$version_file" bun run version:sync

echo "🔄 Syncing Capacitor for iOS..."
npx cap sync ios

cat > "$export_plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>teamID</key>
  <string>8GG7J6LQZL</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>destination</key>
  <string>export</string>
  <key>stripSwiftSymbols</key>
  <true/>
</dict>
</plist>
PLIST

echo "🛠️  Archiving iOS app..."
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -derivedDataPath "$derived_data_path" \
  -archivePath "$archive_path" \
  -allowProvisioningUpdates \
  archive

echo "📦 Exporting App Store package..."
xcodebuild \
  -exportArchive \
  -archivePath "$archive_path" \
  -exportPath "$export_path" \
  -exportOptionsPlist "$export_plist" \
  -allowProvisioningUpdates

version=$(node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(String(v.marketingVersion ?? '1.0.0')); " "$version_file")
versioned_ipa="ios/gita-sadhana-v${version}.ipa"
ipa_source="$(find "$export_path" -maxdepth 1 -type f -name '*.ipa' -print -quit)"

if [ -n "$ipa_source" ] && [ -f "$ipa_source" ]; then
  mkdir -p ios
  cp "$ipa_source" "$versioned_ipa"
else
  echo "⚠️  No IPA was exported from Xcode."
  exit 1
fi

cp "$version_file" app-version.json

upload_status="skipped"
upload_to_app_store_connect() {
  local ipa_file="$1"
  if [ -z "$ipa_file" ] || [ ! -f "$ipa_file" ]; then
    echo "⚠️  IPA file not found, skipping upload."
    return 1
  fi

  local app_specific_password=""
  printf "Enter App Store Connect app-specific password for %s: " "$apple_id"
  read -rs app_specific_password
  printf "\n"

  if [ -z "$app_specific_password" ]; then
    echo "⚠️  No password entered, skipping upload."
    return 1
  fi

  echo "🔎 Validating IPA with Apple ID credentials..."
  xcrun altool --validate-app "$ipa_file" -t ios -u "$apple_id" -p "$app_specific_password"

  echo "📤 Uploading IPA with Apple ID credentials..."
  xcrun altool --upload-app -f "$ipa_file" -t ios -u "$apple_id" -p "$app_specific_password"
  upload_status="completed"
  return 0
}

printf "Upload to App Store Connect now? [y/N]: "
read -r upload_answer
case "$upload_answer" in
  y|Y|yes|YES)
    upload_to_app_store_connect "$versioned_ipa"
    ;;
  *)
    echo "ℹ️  Skipping App Store Connect upload."
    ;;
esac

if [ "$upload_status" = "completed" ]; then
  upload_line="App Store Connect upload: completed"
else
  upload_line="App Store Connect upload: skipped"
fi

echo "✅ iOS release summary"
echo "   Version: $version"
echo "   IPA: $versioned_ipa"
echo "   $upload_line"
