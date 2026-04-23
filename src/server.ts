/**
 * Local dev / preview server.
 *
 *   bun run dev       -> bundles on the fly with HMR from src/
 *   bun run preview   -> serves the already-built dist/ directory
 *
 * Bun's HTMLRewriter / built-in bundler handles TypeScript, SCSS,
 * and asset URL rewriting automatically when we hand index.html to
 * `routes`. See https://bun.sh/docs/bundler/fullstack for the exact
 * semantics.
 */

import { serve } from "bun";
import indexHtml from "../index.html";

const PREVIEW = process.argv.includes("--dist");
const PORT = Number(process.env.PORT ?? 3000);
const PROJECT_ROOT = new URL("..", import.meta.url).pathname;

if (PREVIEW) {
    // Static file server for the production build output.
    const DIST = `${PROJECT_ROOT}dist`;
    serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url);
            let path = url.pathname === "/" ? "/index.html" : url.pathname;
            const file = Bun.file(DIST + path);
            if (await file.exists()) return new Response(file);
            // SPA-style fallback to index.html
            return new Response(Bun.file(`${DIST}/index.html`));
        },
    });
    console.log(`[preview] serving dist/ on http://localhost:${PORT}`);
} else {
    // Dev mode: Bun bundles index.html + its module graph on demand.
    // Static asset folders (Images/, Sounds/) are served pass-through from the
    // project root so we don't need an intermediate copy step during Phase 1.
    serve({
        port: PORT,
        development: true,
        routes: {
            "/": indexHtml,
            "/index.html": indexHtml,
        },
        async fetch(req) {
            const url = new URL(req.url);
            // Serve legacy asset folders directly from the project root.
            if (
                url.pathname.startsWith("/Images/") ||
                url.pathname.startsWith("/Sounds/") ||
                url.pathname.startsWith("/Styles/")
            ) {
                const file = Bun.file(PROJECT_ROOT + url.pathname.slice(1));
                if (await file.exists()) return new Response(file);
            }
            return new Response("Not Found", { status: 404 });
        },
    });
    console.log(`[dev] serving on http://localhost:${PORT}`);
    console.log(`[dev] HMR enabled; edits under src/ reload automatically.`);
}
