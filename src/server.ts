/**
 * Local dev / preview server.
 *
 *   bun run dev       -> bundles on the fly with HMR from src/
 *   bun run preview   -> serves the already-built dist/ directory
 *
 * Bun's built-in bundler handles TypeScript, CSS, and asset URL rewriting
 * automatically when we hand index.html to `routes`. Legacy asset folders
 * (images/, Sounds/) are served pass-through from the project root so the
 * dynamic `"images/bullet_" + type + ".png"` references in game code keep
 * working without an intermediate copy step.
 */

import { serve } from "bun";
import { join } from "node:path";
import indexHtml from "../index.html";

// process.cwd() returns a native OS path (C:\... on Windows, /... on Unix).
// This is more robust than deriving from import.meta.url, which yields a
// file:// URL with awkward leading slashes on Windows.
const PROJECT_ROOT = process.cwd();
const DIST = join(PROJECT_ROOT, "dist");
const PREVIEW = process.argv.includes("--dist");
const PORT = Number(process.env.PORT ?? 3000);

/** Static asset folders served directly from the project root during dev. */
const PASS_THROUGH_PREFIXES = ["/images/", "/sounds/", "/styles/"];

async function servePassThroughAsset(pathname: string, root: string): Promise<Response | null> {
    for (const prefix of PASS_THROUGH_PREFIXES) {
        if (pathname.startsWith(prefix)) {
            // pathname begins with "/", join() handles the separator itself
            const diskPath = join(root, pathname);
            const file = Bun.file(diskPath);
            if (await file.exists()) {
                return new Response(file);
            }
        }
    }
    return null;
}

if (PREVIEW) {
    // Static file server for the production build output.
    serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url);
            const path = url.pathname === "/" ? "/index.html" : url.pathname;

            const file = Bun.file(join(DIST, path));
            if (await file.exists()) return new Response(file);

            // Fall back to legacy asset folders (if they weren't copied into dist).
            const asset = await servePassThroughAsset(url.pathname, PROJECT_ROOT);
            if (asset) return asset;

            // SPA-style fallback to index.html
            return new Response(Bun.file(join(DIST, "index.html")));
        },
    });
    console.log(`[preview] serving dist/ on http://localhost:${PORT}`);
} else {
    // Dev mode: Bun bundles index.html + its module graph on demand.
    serve({
        port: PORT,
        development: true,
        routes: {
            "/": indexHtml,
            "/index.html": indexHtml,
        },
        async fetch(req) {
            const url = new URL(req.url);
            const asset = await servePassThroughAsset(url.pathname, PROJECT_ROOT);
            if (asset) return asset;
            return new Response("Not Found", { status: 404 });
        },
    });
    console.log(`[dev] serving on http://localhost:${PORT}`);
    console.log(`[dev] HMR enabled; edits under src/ reload automatically.`);
    console.log(`[dev] asset pass-through: ${PASS_THROUGH_PREFIXES.join(", ")}`);
}
