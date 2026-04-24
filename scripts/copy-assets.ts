/**
 * Copies static assets into the build output directory.
 *
 * The JS code references assets via runtime-constructed URLs like
 *   createjs.Bitmap("Images/bullet_" + type + ".png")
 *   createjs.Sound.registerSound("Sounds/" + name + ".mp3", ...)
 * so these folders need to exist at the same paths inside dist/ after a
 * production build.
 *
 * Run standalone:  bun run scripts/copy-assets.ts
 * Or via npm:      bun run build     (package.json chains it after bun build)
 */

import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();
const DIST = join(PROJECT_ROOT, "dist");

const ASSET_FOLDERS = ["Images", "Sounds"] as const;

async function copyAssetFolder(name: string): Promise<void> {
    const src = join(PROJECT_ROOT, name);
    const dest = join(DIST, name);
    if (!existsSync(src)) {
        console.warn(`[copy-assets] skipped ${name}: source folder missing`);
        return;
    }
    // recursive preserves the directory structure, overwrites existing files
    await cp(src, dest, { recursive: true, force: true });
    console.log(`[copy-assets] ${name}/ -> dist/${name}/`);
}

async function main(): Promise<void> {
    if (!existsSync(DIST)) {
        await mkdir(DIST, { recursive: true });
    }
    for (const folder of ASSET_FOLDERS) {
        await copyAssetFolder(folder);
    }
    console.log("[copy-assets] done.");
}

main().catch((err) => {
    console.error("[copy-assets] failed:", err);
    process.exit(1);
});
