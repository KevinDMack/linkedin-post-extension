import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const manifestPath = resolve(repositoryRoot, "extension", "manifest.json");

if (!existsSync(manifestPath)) {
  throw new Error(`Expected manifest at ${manifestPath}`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

if (manifest.manifest_version !== 3) {
  throw new Error("This scaffold expects a Manifest V3 extension.");
}

const requiredFiles = [
  manifest.background?.service_worker,
  manifest.action?.default_popup
];

for (const file of requiredFiles) {
  if (!file) {
    throw new Error("Manifest is missing a required scaffold entry.");
  }

  const filePath = resolve(repositoryRoot, "extension", file);

  if (!existsSync(filePath)) {
    throw new Error(`Manifest references a missing file: ${file}`);
  }
}

console.log("Extension scaffold validated successfully.");
