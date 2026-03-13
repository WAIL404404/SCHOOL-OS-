import { cp, mkdir, rm } from "node:fs/promises";

const outDir = new URL("../dist", import.meta.url);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(new URL("../index.html", import.meta.url), new URL("../dist/index.html", import.meta.url));
await cp(new URL("../src", import.meta.url), new URL("../dist/src", import.meta.url), { recursive: true });

console.log("Build output created in dist/.");
