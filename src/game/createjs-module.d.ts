/**
 * Ambient type stub for createjs-module.
 *
 * The npm package ships no TypeScript declarations. The actual CreateJS
 * API types come from @types/createjs, which declares `createjs` as a
 * global ambient namespace. This stub just keeps TypeScript from
 * complaining about the `import * as createjsModule from "createjs-module"`
 * line in createjs-bootstrap.ts.
 */

declare module "createjs-module" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any;
    export = value;
}
