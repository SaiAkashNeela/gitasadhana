import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const rootDir = process.cwd();
const versionFile = resolve(rootDir, "app-version.json");
const bumpType = (process.argv[2] ?? "patch").toLowerCase();

function parseVersion(version) {
  const match = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid marketingVersion: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function nextVersion(version, kind) {
  const current = parseVersion(version);

  switch (kind) {
    case "major":
      return `${current.major + 1}.0.0`;
    case "minor":
      return `${current.major}.${current.minor + 1}.0`;
    case "patch":
      return `${current.major}.${current.minor}.${current.patch + 1}`;
    default:
      throw new Error(
        `Unsupported bump type "${kind}". Use major, minor, or patch.`,
      );
  }
}

const raw = readFileSync(versionFile, "utf8");
const versionData = JSON.parse(raw);

const marketingVersion = nextVersion(versionData.marketingVersion ?? "1.0.0", bumpType);
const buildNumber = Number(versionData.buildNumber ?? 0) + 1;

if (!Number.isInteger(buildNumber) || buildNumber < 1) {
  throw new Error("buildNumber must be a positive integer");
}

const updated = {
  ...versionData,
  marketingVersion,
  buildNumber,
};

writeFileSync(versionFile, `${JSON.stringify(updated, null, 2)}\n`);

console.log(
  `Bumped version to ${marketingVersion} (build ${buildNumber}).`,
);
