import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(rootDir, "..");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: resolve(repoRoot, "public"),
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: [repoRoot],
    },
  },
});
