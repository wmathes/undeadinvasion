/**
 * Centralised game configuration.
 *
 * Every tunable gameplay value lives here - HP, speeds, damage, cooldowns,
 * pickup radii, fade durations, camera feel. The aim is that rebalancing or
 * experimenting with level design requires only touching this file and
 * running the game; no module-internal magic numbers to chase down.
 *
 * Values grouped by domain:
 *   Game      - viewport / canvas resolution
 *   World     - gameplay area size (per-level override planned for step 7)
 *   Camera    - smoothing / dead-zone
 *   Player    - player stats & movement
 *   Enemy     - zombie stats & behaviour
 *   Bullet    - projectile defaults
 *   PowerUp   - pickup behaviour
 *   GameOver  - death-screen timing
 *   Respawn   - spawn-rate modulation
 *   Difficulties - per-difficulty multipliers (applied on top of the above)
 *   Effects   - blood / bone splatter visuals
 */

import type { IGameDifficulty, IVanishingEntitySettings } from "./interfaces";

export const Config = {
    // ==================== Renderer / layout ====================

    /**
     * Viewport / canvas resolution - how many pixels the renderer draws
     * per frame. Kept at 900x700 for parity with the 2013 build. Display
     * size on screen is CSS-scaled from here (see src/responsive.ts).
     */
    Game: {
        Width: 900,
        Height: 700,
    },

    /**
     * Gameplay world size - the bounded area entities can spawn and move
     * through. The camera (Viewport) moves over this world following the
     * player; on screens smaller than the world, only a slice is visible.
     * Per-level config (roadmap step 7) will override this per map.
     */
    World: {
        Width: 1800,
        Height: 1400,
    },

    // ==================== Camera ====================

    /**
     * Camera follows a virtual target point that exponentially tweens
     * toward the player each frame. Smoothness is a per-ms rate: the
     * target closes a fraction (1 - exp(-Smoothness * dt)) of the
     * remaining distance each tick. Frame-rate independent.
     *
     * Reference values:
     *   0.002 - very soft / cinematic lag (~1s to catch a sprint)
     *   0.005 - smooth but responsive (default)
     *   0.012 - tight; barely perceptible lag
     *   0.05  - effectively rigid (use if you want no smoothing)
     */
    Camera: {
        Smoothness: 0.005,

        /**
         * Dead zone radius (world pixels): while the player is within this
         * radius of the virtual target, the target stays put. Set to 0 to
         * disable and always chase.
         */
        DeadZoneRadius: 0,
    },

    // ==================== Player ====================

    Player: {
        Size: 36,
        MoveSpeedPxPerMs: 90 / 1000,
        HpMax: 100,
        /** Margin kept from the world edges when the player runs into a wall. */
        CropMargin: 20,
        /** 1/sqrt(2), used to clamp diagonal movement to the same speed as cardinal. */
        DiagonalFactor: 0.707,
        /** Fraction of speed lost when moving directly away from facing direction (0..1). */
        BackwardSpeedPenalty: 0.4,
        /** Sprite pivot (registration point) offset in texture pixels. */
        RegX: 18,
        RegY: 15,
    },

    // ==================== Enemy (Zombie) ====================

    Enemy: {
        /** Hitbox/draw size before per-spawn scale multiplier. */
        SizeBase: 24,
        AngleSpeedPerMs: 60 / 1000,
        MoveSpeedPerMs: 40 / 1000,
        /** Sprite pivot in texture pixels (zombie frames are 35x29). */
        RegX: 15,
        RegY: 13,
        /** Base HP + uniform random 0..HpSpread, then multiplied by difficulty factor. */
        HpBase: 50,
        HpSpread: 100,
        /** Minimum gap between successive bites on the player. */
        AttackCooldownMs: 800,
        /** Per-bite damage = base + uniform random 0..spread, * difficulty factor. */
        AttackDamageBase: 6,
        AttackDamageSpread: 2,
        /** Alpha added per frame while spawning fade-in (frame-rate dependent - legacy). */
        SpawnFadeInPerFrame: 0.025,
        /** Delay between HP reaching 0 and hasDied() returning true, in ms. */
        DeathDelayMs: 60,
        /** One blood splatter per this-many-HP of damage dealt. */
        BloodPerHp: 40,
        /** Fraction of entity size used as blood splatter scatter radius. */
        BloodSpreadFactor: 0.6,
        /** Point value = Base + floor(scale * Scale) on kill, * difficulty factor. */
        PointValueBase: 5,
        PointValueScale: 15,
        /** Uniform random size multiplier applied per spawn. */
        ScaleMin: 0.75,
        ScaleMax: 1.5,
    },

    // ==================== Bullet ====================

    Bullet: {
        /** Default hitbox radius (collision width = bullet.size + enemy.size*0.4). */
        DefaultSize: 12,
        /** Bullet spawns this far in front of the player so it doesn't collide with them. */
        SpawnOffsetForward: 18,
        /** Sprite pivot in texture pixels (bullet images are 16x16). */
        PivotX: 8,
        PivotY: 8,
        /** Default trail gradient stops when a weapon doesn't define its own. */
        DefaultTrailColor: ["#AAAAAA", "#222222"] as [string, string],
        DefaultTrailWidth: 2,
    },

    // ==================== Power-ups ====================

    PowerUp: {
        /** Distance from player centre at which a power-up is picked up. */
        PickupRadius: 28,
        /** Sprite pivot in texture pixels. */
        RegX: 24,
        RegY: 15,
        /** Milliseconds the power-up fades in at spawn. */
        FadeInMs: 200,
        /** Milliseconds the power-up fades out before expiring. */
        FadeOutMs: 1600,
        /** HP restored when picking up a health crate. */
        HealAmount: 25,
        /** Point value awarded if a power-up expires un-taken. */
        PointValue: 100,
    },

    // ==================== UI / flow ====================

    GameOver: {
        /** Opacity transition duration for the "Game Over" overlay. */
        FadeInMs: 2400,
        /** How long the overlay stays fully visible before the game resets. */
        HoldBeforeResetMs: 1600,
    },

    Respawn: {
        /** Extra spawn-credit granted per zombie kill (speeds up the next wave). */
        KillSpeedBonusMs: 100,
        /** Spawn delay shortens by this many ms per spawn-wave index. */
        NextSpawnStepMs: 4,
    },

    // ==================== Difficulties ====================

    Difficulties: {
        Easy: {
            InitialZombies: 6,
            DelayMax: 1800,
            DelayMin: 750,
            AmountStep: 100,
            ScoreFactor: 0.75,
            EnemyHealthFactor: 0.8,
            EnemyDamageFactor: 0.5,
            EnemySpeedFactor: 0.8,
            MaxEnemies: 250,
            HealEvery: 500,
            PowerUpChance: 0.06,
            PowerUpLifetime: 12800,
        },
        Normal: {
            InitialZombies: 12,
            DelayMax: 1400,
            DelayMin: 500,
            AmountStep: 80,
            ScoreFactor: 1,
            EnemyHealthFactor: 1,
            EnemyDamageFactor: 1,
            EnemySpeedFactor: 1,
            MaxEnemies: 400,
            HealEvery: 800,
            PowerUpChance: 0.05,
            PowerUpLifetime: 10400,
        },
        Hard: {
            InitialZombies: 24,
            DelayMax: 1000,
            DelayMin: 375,
            AmountStep: 60,
            ScoreFactor: 1.5,
            EnemyHealthFactor: 1.1,
            EnemyDamageFactor: 1.5,
            EnemySpeedFactor: 1.25,
            MaxEnemies: 650,
            HealEvery: 1200,
            PowerUpChance: 0.04,
            PowerUpLifetime: 8000,
        },
        Ultra: {
            InitialZombies: 48,
            DelayMax: 600,
            DelayMin: 250,
            AmountStep: 50,
            ScoreFactor: 2.0,
            EnemyHealthFactor: 1.2,
            EnemyDamageFactor: 2.0,
            EnemySpeedFactor: 1.5,
            MaxEnemies: 900,
            HealEvery: 1500,
            PowerUpChance: 0.03,
            PowerUpLifetime: 6400,
        },
    } satisfies Record<string, IGameDifficulty>,

    // ==================== Visual effects ====================

    Effects: {
        Blood: {
            Duration: 40000,
            Maximum: 80,
            Image: "bloodSplatter",
            Variations: 1,
            Width: 42,
            Height: 31,
        },
        Bones: {
            Duration: 15000,
            Maximum: 20,
            Image: "bones",
            Variations: 1,
            Width: 30,
            Height: 22,
        },
    } satisfies Record<string, IVanishingEntitySettings>,
};

export type DifficultyName = keyof typeof Config.Difficulties;
