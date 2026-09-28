// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Per-language Gita translations ship as assets and are read on demand (see src/lib/gita.ts).
config.resolver.assetExts.push("gita");

// capacitor-app/ (legacy app) and api/ (Cloudflare Worker) have their own node_modules, and
// website/ is the separate plain-HTML site; keep Metro out of all three.
const escape = (dir) => path.resolve(__dirname, dir).replace(/[/\\]/g, "[/\\\\]");
config.resolver.blockList = ["capacitor-app", "api", "website"].map((dir) => new RegExp(`^${escape(dir)}[/\\\\].*`));
config.watchFolders = [];

module.exports = config;
