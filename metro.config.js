// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Per-language Gita translations ship as assets and are read on demand (see src/lib/gita.ts).
config.resolver.assetExts.push("gita");

// The legacy Capacitor app lives in capacitor-app/ with its own node_modules; keep Metro out of it.
const legacy = path.resolve(__dirname, "capacitor-app").replace(/[/\\]/g, "[/\\\\]");
config.resolver.blockList = [new RegExp(`^${legacy}[/\\\\].*`)];
config.watchFolders = [];

module.exports = config;
