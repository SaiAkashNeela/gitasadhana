import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const rootDir = process.cwd();
const versionFile = resolve(rootDir, "app-version.json");
const androidGradleFile = resolve(rootDir, "android/app/build.gradle");
const iosProjectFile = resolve(
  rootDir,
  "ios/App/App.xcodeproj/project.pbxproj",
);

function readVersionConfig() {
  try {
    const raw = readFileSync(versionFile, "utf8");
    const parsed = JSON.parse(raw);

    const marketingVersion = String(parsed.marketingVersion ?? "").trim();
    const buildNumber = Number(parsed.buildNumber);

    if (!marketingVersion) {
      throw new Error("marketingVersion is missing");
    }

    if (!Number.isInteger(buildNumber) || buildNumber < 1) {
      throw new Error("buildNumber must be a positive integer");
    }

    return { marketingVersion, buildNumber };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown version config error";
    throw new Error(`Failed to read ${versionFile}: ${message}`);
  }
}

function replaceAllOrThrow(input, pattern, replacement, label) {
  if (!pattern.test(input)) {
    throw new Error(`Could not find ${label} in target file`);
  }
  return input.replace(pattern, replacement);
}

function syncAndroid(marketingVersion, buildNumber) {
  const original = readFileSync(androidGradleFile, "utf8");
  let updated = original;

  updated = replaceAllOrThrow(
    updated,
    /versionCode\s+\d+/g,
    `versionCode ${buildNumber}`,
    "Android versionCode",
  );
  updated = replaceAllOrThrow(
    updated,
    /versionName\s+"[^"]*"/g,
    `versionName "${marketingVersion}"`,
    "Android versionName",
  );

  if (updated !== original) {
    writeFileSync(androidGradleFile, updated);
  }
}

function syncIos(marketingVersion, buildNumber) {
  const original = readFileSync(iosProjectFile, "utf8");
  let updated = original;

  updated = replaceAllOrThrow(
    updated,
    /CURRENT_PROJECT_VERSION = \d+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    "iOS CURRENT_PROJECT_VERSION",
  );
  updated = replaceAllOrThrow(
    updated,
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${marketingVersion};`,
    "iOS MARKETING_VERSION",
  );

  if (updated !== original) {
    writeFileSync(iosProjectFile, updated);
  }
}

const { marketingVersion, buildNumber } = readVersionConfig();
syncAndroid(marketingVersion, buildNumber);
syncIos(marketingVersion, buildNumber);

console.log(
  `Synced native versions to ${marketingVersion} (build ${buildNumber}).`,
);
