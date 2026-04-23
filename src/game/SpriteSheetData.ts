/**
 * Sprite sheet definitions and cached SpriteSheet instances.
 *
 * Ported from the UndeadInvasion.Data.SpriteSheetData and
 * UndeadInvasion.Data.SpriteSheets classes in the legacy app.ts.
 * Behaviour is identical: frame counts, sizes, and framerates are
 * unchanged.
 */

// Side-effect import populates the global `createjs` namespace.
// Types come from @types/createjs.
import "createjs-module";

export class SpriteSheetData {
    public static Player(): createjs.SpriteSheetOptions {
        return {
            framerate: 4,
            images: ["Images/player_run.png"],
            frames: { width: 35, height: 30, count: 13, regX: 0, regY: 0 },
            animations: {
                run: [0, 12],
            },
        };
    }

    public static Zombie(variation: string): createjs.SpriteSheetOptions {
        return {
            framerate: 4,
            images: ["Images/zombie_" + variation + ".png"],
            frames: { width: 35, height: 29, count: 16, regX: 0, regY: 0 },
            animations: {
                run: [0, 15],
            },
        };
    }
}

export class SpriteSheets {
    // Totally random - picks one of the three variants at call time
    public static Zombie(): createjs.SpriteSheet {
        const r = Math.random();
        if (r < 0.33) return SpriteSheets.ZombieBlue();
        else if (r < 0.66) return SpriteSheets.ZombieRed();
        else return SpriteSheets.ZombieYellow();
    }

    // Variations (cached)
    private static _zombieBlue: createjs.SpriteSheet | undefined;
    public static ZombieBlue(): createjs.SpriteSheet {
        this._zombieBlue ??= new createjs.SpriteSheet(SpriteSheetData.Zombie("blue"));
        return this._zombieBlue;
    }
    private static _zombieRed: createjs.SpriteSheet | undefined;
    public static ZombieRed(): createjs.SpriteSheet {
        this._zombieRed ??= new createjs.SpriteSheet(SpriteSheetData.Zombie("red"));
        return this._zombieRed;
    }
    private static _zombieYellow: createjs.SpriteSheet | undefined;
    public static ZombieYellow(): createjs.SpriteSheet {
        this._zombieYellow ??= new createjs.SpriteSheet(SpriteSheetData.Zombie("yellow"));
        return this._zombieYellow;
    }

    private static _player: createjs.SpriteSheet | undefined;
    public static Player(): createjs.SpriteSheet {
        this._player ??= new createjs.SpriteSheet(SpriteSheetData.Player());
        return this._player;
    }
}
