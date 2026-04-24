#!/usr/bin/env node

/**
 * Undead Invasion CLI launcher.
 *
 * Serves the pre-built `dist/` directory over HTTP and opens the default
 * browser. Designed to be run via `npx @tailstorm/undeadinvasion`, so it
 * uses only the Node standard library - no runtime dependencies.
 *
 * Flags:
 *   --port=N     Listen on port N (default 4173, overridable via $PORT)
 *   --no-open    Don't auto-launch the browser
 *   --help       Print usage and exit
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// -------- CLI parsing --------

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`undeadinvasion - top-down zombie shooter

Usage:  npx @tailstorm/undeadinvasion [--port=N] [--no-open]

Options:
  --port=N    Listen on port N (default 4173, or \$PORT env var)
  --no-open   Don't auto-launch the default browser
  --help      Show this message`);
    process.exit(0);
}

const portFlag = argv.find((a) => a.startsWith("--port="));
const PORT = Number(portFlag?.split("=")[1] ?? process.env.PORT ?? 4173);
const AUTO_OPEN = !argv.includes("--no-open");

// -------- Filesystem --------

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(HERE, "..", "dist");

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".cjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".ico": "image/x-icon",
};

/** Safely resolve a request path under DIST, rejecting traversal. */
function resolveSafe(urlPath) {
    const decoded = decodeURIComponent(urlPath.split("?")[0]);
    const cleaned = decoded === "/" ? "/index.html" : decoded;
    const full = normalize(join(DIST, cleaned));
    if (!full.startsWith(DIST)) return null;
    return full;
}

async function serveFile(res, filePath) {
    try {
        const s = await stat(filePath);
        if (!s.isFile()) return false;
    } catch {
        return false;
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const body = await readFile(filePath);
    res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": body.length,
        "Cache-Control": "no-cache",
    });
    res.end(body);
    return true;
}

// -------- HTTP server --------

const server = createServer(async (req, res) => {
    try {
        const requested = resolveSafe(req.url ?? "/");
        if (!requested) {
            res.writeHead(403).end("Forbidden");
            return;
        }
        if (await serveFile(res, requested)) return;
        // Fallback: always hand back index.html so deep links work.
        const indexPath = join(DIST, "index.html");
        if (await serveFile(res, indexPath)) return;
        res.writeHead(404).end("Not Found");
    } catch (err) {
        console.error(err);
        res.writeHead(500).end("Internal Server Error");
    }
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    const line = "=".repeat(url.length + 24);
    console.log(`\n${line}\n  Undead Invasion -> ${url}\n${line}\n`);
    console.log("  Press Ctrl+C to stop.\n");
    if (AUTO_OPEN) tryOpenBrowser(url);
});

server.on("error", (err) => {
    if (/** @type {NodeJS.ErrnoException} */ (err).code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Try --port=${PORT + 1}.`);
        process.exit(1);
    }
    throw err;
});

// -------- Auto-opener --------

function tryOpenBrowser(url) {
    const plat = process.platform;
    let cmd;
    let args;
    if (plat === "win32") {
        // `start` is a cmd builtin. The empty "" is the window title arg.
        cmd = "cmd";
        args = ["/c", "start", "", url];
    } else if (plat === "darwin") {
        cmd = "open";
        args = [url];
    } else {
        cmd = "xdg-open";
        args = [url];
    }
    try {
        spawn(cmd, args, { detached: true, stdio: "ignore" }).unref();
    } catch {
        // Auto-open is best-effort. User can just click the URL above.
    }
}

// -------- Graceful shutdown --------

for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
        server.close(() => process.exit(0));
    });
}
