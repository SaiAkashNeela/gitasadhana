import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgSwift = resolve(
  __dirname,
  "../node_modules/@capacitor-community/apple-sign-in/Package.swift"
);

const content = readFileSync(pkgSwift, "utf8");
const patched = content.replace(
  '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")',
  '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")'
);

if (content !== patched) {
  writeFileSync(pkgSwift, patched);
  console.log("Patched @capacitor-community/apple-sign-in Package.swift");
} else {
  console.log("@capacitor-community/apple-sign-in already patched");
}
