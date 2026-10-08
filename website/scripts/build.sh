#!/usr/bin/env bash
# Builds the website's data and pre-rendered pages (the Cloudflare Pages build command).
set -euo pipefail
cd "$(dirname "$0")/../.."
bun website/scripts/build-website-data.mjs
bun website/scripts/build-website-seo.mjs
