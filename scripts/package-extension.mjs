import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const extensionDirectory = resolve(repositoryRoot, "extension");
const distributionDirectory = resolve(repositoryRoot, "dist");
const unpackedDirectory = resolve(distributionDirectory, "unpacked");
const archivePath = resolve(distributionDirectory, "linkedin-post-extension.zip");

if (!existsSync(extensionDirectory)) {
  throw new Error(`Expected extension directory at ${extensionDirectory}`);
}

rmSync(distributionDirectory, { force: true, recursive: true });
mkdirSync(unpackedDirectory, { recursive: true });
cpSync(extensionDirectory, unpackedDirectory, { recursive: true });

execFileSync("zip", ["-r", archivePath, "."], {
  cwd: unpackedDirectory,
  stdio: "inherit"
});

console.log(`Packaged extension at ${archivePath}`);
