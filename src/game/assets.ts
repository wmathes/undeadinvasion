/**
 * Centralised PixiJS texture preloading and frame-slicing helpers.
 *
 * The legacy code (and the original CreateJS build) used lazy loading via
 * `createjs.Bitmap(path)` - textures would request over the network the
 * first time they were referenced. That works in the happy path but races
 * the first sprite render against the network in ways that bite on cold
 * caches and slow connections.
 *
 * PixiJS's `Assets` API lets us batch-preload all known textures up front
 * and hand them out synchronously via `getTexture(name)` for the rest of
 * the app. Asset paths that are built dynamically at runtime (e.g.
 * `"Images/bullet_" + type + ".png"`) still resolve synchronously because
 * we preload every possible value.
 *
 * Call `preloadAssets()` once from main.ts before constructing Game.
 */

import { Assets, Rectangle, Texture } from "pixi.js";

// -------- Asset manifest --------

/** Non-spritesheet images, loaded as plain textures. */
const FLAT_IMAGES: readonly string[] = [
    "Images/background.png",
    "Images/bloodSplatter_0.png",
    "Images/bones_0.png",
    "Images/health.png",
    "Images/Microchip.png",
    // Bullet types - one per weapon BulletType value plus the "default".
    "Images/bullet_default.png",
    "Images/bullet_small.png",
    "Images/bullet_cannonball.png",
    "Images/bullet_flame.png",
    "Images/bullet_ion.png",
    "Images/bullet_phaser.png",
    "Images/bullet_ray.png",
    "Images/bullet_shrapnel.png",
    "Images/bullet_shrapnel_slim.png",
];

/**
 * Spritesheet-style images where a single file holds N horizontally-tiled
 * frames. Keyed by a short logical name used at runtime.
 */
const SPRITESHEETS = {
    Player: { path: "Images/player_run.png", frameWidth: 35, frameHeight: 30, frameCount: 13 },
    ZombieBlue: { path: "Images/zombie_blue.png", frameWidth: 35, frameHeight: 29, frameCount: 16 },
    ZombieRed: { path: "Images/zombie_red.png", frameWidth: 35, frameHeight: 29, frameCount: 16 },
    ZombieYellow: { path: "Images/zombie_yellow.png", frameWidth: 35, frameHeight: 29, frameCount: 16 },
} as const satisfies Record<string, { path: string; frameWidth: number; frameHeight: number; frameCount: number }>;

export type SpritesheetName = keyof typeof SPRITESHEETS;

// -------- Runtime state --------

const _textures = new Map<string, Texture>();
const _spritesheetFrames = new Map<SpritesheetName, Texture[]>();
let _loaded = false;

// -------- Public API --------

export async function preloadAssets(): Promise<void> {
    if (_loaded) return;

    // Flat images: straight Assets.load per path
    const flatPromises = FLAT_IMAGES.map(async (path) => {
        const texture = await Assets.load<Texture>(path);
        _textures.set(path, texture);
    });

    // Spritesheets: load the image, infer columns from its width, slice
    // row-major into frameCount textures. The legacy source images are
    // multi-row strips (e.g. player_run.png is 280x60 = 8 cols x 2 rows
    // of 35x30 frames, zombie_*.png is 385x87 = 11 cols x 3 rows of
    // 35x29 frames) - CreateJS's SpriteSheet auto-figured this out at
    // load time; we replicate that here.
    //
    // PixiJS v8 note: Texture.baseTexture was removed; new sliced textures
    // share the parent's underlying TextureSource via `{ source, frame }`.
    const sheetEntries = Object.entries(SPRITESHEETS) as [SpritesheetName, (typeof SPRITESHEETS)[SpritesheetName]][];
    const sheetPromises = sheetEntries.map(async ([name, meta]) => {
        const texture = await Assets.load<Texture>(meta.path);
        _textures.set(meta.path, texture);

        const sheetWidth = texture.source.width;
        const framesPerRow = Math.floor(sheetWidth / meta.frameWidth);
        if (framesPerRow <= 0) {
            throw new Error(
                `Spritesheet ${meta.path} is ${sheetWidth}px wide, smaller than frameWidth ${meta.frameWidth}`,
            );
        }

        const frames: Texture[] = [];
        for (let i = 0; i < meta.frameCount; i++) {
            const col = i % framesPerRow;
            const row = Math.floor(i / framesPerRow);
            frames.push(
                new Texture({
                    source: texture.source,
                    frame: new Rectangle(
                        col * meta.frameWidth,
                        row * meta.frameHeight,
                        meta.frameWidth,
                        meta.frameHeight,
                    ),
                }),
            );
        }
        _spritesheetFrames.set(name, frames);
    });

    await Promise.all([...flatPromises, ...sheetPromises]);
    _loaded = true;
}

/** Get a previously-preloaded flat texture by its image path. */
export function getTexture(path: string): Texture {
    const t = _textures.get(path);
    if (!t) throw new Error(`Texture not preloaded: ${path}. Call preloadAssets() first.`);
    return t;
}

/** Get the array of animation frames for a spritesheet. */
export function getSpritesheetFrames(name: SpritesheetName): Texture[] {
    const frames = _spritesheetFrames.get(name);
    if (!frames) throw new Error(`Spritesheet not preloaded: ${name}. Call preloadAssets() first.`);
    return frames;
}

/** Pick a random zombie variant's frame set. */
export function getRandomZombieFrames(): Texture[] {
    const r = Math.random();
    if (r < 0.33) return getSpritesheetFrames("ZombieBlue");
    if (r < 0.66) return getSpritesheetFrames("ZombieRed");
    return getSpritesheetFrames("ZombieYellow");
}

/** Dev-only reset for HMR. PixiJS v8 handles source cleanup via texture.destroy(). */
export function resetAssetsForHMR(): void {
    _textures.clear();
    _spritesheetFrames.clear();
    _loaded = false;
}
