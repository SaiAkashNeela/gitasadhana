// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Per-language Gita translations ship as assets and are read on demand (see src/lib/gita.ts).
config.resolver.assetExts.push("gita");

module.exports = config;
