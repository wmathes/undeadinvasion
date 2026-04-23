/**
 * CreateJS global exposure shim.
 *
 * Problem: `createjs-module` is a UMD bundle that uses the pattern
 * `this.createjs = this.createjs || {}` at the top of each sub-library.
 * When Bun evaluates it as ESM, `this` at module scope is `undefined`,
 * so the intended `window.createjs` attachment never happens.
 *
 * @types/createjs declares `createjs` as a global ambient namespace, so
 * our source code references `createjs.Stage`, `createjs.Ticker`, etc.
 * as free-standing globals. We have to make that real at runtime.
 *
 * This module imports the package, pulls out whichever shape it exposes
 * (default export vs named re-exports vs the whole module object), and
 * assigns the result to globalThis.createjs. Import this file once, as
 * the very first import in main.ts, before anything that touches the
 * createjs namespace.
 */

import * as createjsModule from "createjs-module";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function resolveNamespace(): AnyRecord {
    const mod = createjsModule as unknown as AnyRecord;

    // 1. Namespace already attached to globalThis by the module's own IIFE
    //    (happens in Node or when `this` resolved to globalThis).
    const existing = (globalThis as AnyRecord)["createjs"];
    if (existing && typeof existing.Stage === "function") {
        return existing;
    }

    // 2. ESM default export is the createjs namespace (`module.exports = createjs`).
    if (mod.default && typeof mod.default.Stage === "function") {
        return mod.default;
    }

    // 3. Named re-exports - the module object itself IS the namespace.
    if (typeof mod["Stage"] === "function") {
        return mod;
    }

    // 4. Nothing recognisable - surface a clear error now so the crash is
    //    diagnosable rather than a generic `createjs is not defined` later.
    throw new Error(
        "createjs-module loaded but no CreateJS namespace could be resolved. " +
            "Expected either globalThis.createjs, createjsModule.default.Stage, " +
            "or createjsModule.Stage to be present.",
    );
}

(globalThis as AnyRecord)["createjs"] = resolveNamespace();
