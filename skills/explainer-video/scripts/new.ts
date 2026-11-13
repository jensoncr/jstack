#!/usr/bin/env bun
// Scaffold an explainer video project from a template and install its pinned dependencies.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const USAGE = "bun new.ts <2d|3d> <slug> [--dir <parent>]   (parent defaults to ~/explainers)";
const [mode, slug] = Bun.argv.slice(2);
const dirFlag = Bun.argv.indexOf("--dir");
const parent = dirFlag > 0 ? resolve(Bun.argv[dirFlag + 1]!) : join(homedir(), "explainers");

if ((mode !== "2d" && mode !== "3d") || !slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error(USAGE);
  process.exit(1);
}
const project = join(parent, slug);
if (existsSync(project)) {
  console.error(`${project} already exists. Pick another slug or work in that project.`);
  process.exit(1);
}

const template = join(import.meta.dir, "..", "templates", mode);
mkdirSync(parent, { recursive: true });
cpSync(template, project, { recursive: true, filter: (src) => !src.includes("node_modules") });

const install = Bun.spawnSync(["bun", "install", "--frozen-lockfile"], { cwd: project, stdout: "inherit", stderr: "inherit" });
if (install.exitCode !== 0) process.exit(install.exitCode ?? 1);

// Fonts and GSAP come from the installed packages, so the plugin ships no binaries.
const assets = mode === "2d" ? join(project, "proj", "assets") : join(project, "public");
mkdirSync(assets, { recursive: true });
mkdirSync(join(project, "out"), { recursive: true });
for (const weight of ["600", "800"]) {
  cpSync(join(project, "node_modules/@fontsource/inter/files", `inter-latin-${weight}-normal.woff`), join(assets, `inter-${weight}.woff`));
}
if (mode === "2d") cpSync(join(project, "node_modules/gsap/dist/gsap.min.js"), join(assets, "gsap.min.js"));

console.log(project);
