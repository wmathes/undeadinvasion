/**
 * Config snapshot tests.
 *
 * These pin down the difficulty and effect tuning from the original 2013
 * build. If someone accidentally changes a spawn rate or damage factor,
 * these tests break and force a deliberate decision.
 */

import { describe, expect, test } from "bun:test";
import { Config } from "../src/game/Config";

describe("Config.Game", () => {
    test("internal resolution matches the canvas + legacy code", () => {
        expect(Config.Game.Width).toBe(900);
        expect(Config.Game.Height).toBe(700);
    });
});

describe("Config.World", () => {
    test("world is at least as large as the viewport", () => {
        expect(Config.World.Width).toBeGreaterThanOrEqual(Config.Game.Width);
        expect(Config.World.Height).toBeGreaterThanOrEqual(Config.Game.Height);
    });

    test("world dimensions are positive numbers", () => {
        expect(Config.World.Width).toBeGreaterThan(0);
        expect(Config.World.Height).toBeGreaterThan(0);
    });
});

describe("Config.Difficulties", () => {
    const expectedKeys = ["Easy", "Normal", "Hard", "Ultra"] as const;

    test("has all four canonical difficulties", () => {
        for (const key of expectedKeys) {
            expect(Config.Difficulties).toHaveProperty(key);
        }
    });

    test("each difficulty exposes the IGameDifficulty contract", () => {
        const required = [
            "DelayMax",
            "DelayMin",
            "AmountStep",
            "ScoreFactor",
            "EnemyHealthFactor",
            "EnemyDamageFactor",
            "EnemySpeedFactor",
            "PowerUpLifetime",
            "InitialZombies",
            "MaxEnemies",
            "HealEvery",
            "PowerUpChance",
        ] as const;

        for (const key of expectedKeys) {
            const diff = Config.Difficulties[key] as Record<string, number>;
            for (const field of required) {
                expect(diff[field]).toBeTypeOf("number");
            }
        }
    });

    test("Normal is the balanced baseline (factors == 1)", () => {
        expect(Config.Difficulties.Normal.ScoreFactor).toBe(1);
        expect(Config.Difficulties.Normal.EnemyHealthFactor).toBe(1);
        expect(Config.Difficulties.Normal.EnemyDamageFactor).toBe(1);
        expect(Config.Difficulties.Normal.EnemySpeedFactor).toBe(1);
    });

    test("DelayMin < DelayMax for every difficulty", () => {
        for (const key of expectedKeys) {
            const d = Config.Difficulties[key];
            expect(d.DelayMin).toBeLessThan(d.DelayMax);
        }
    });

    test("harder difficulties spawn more initial zombies", () => {
        expect(Config.Difficulties.Easy.InitialZombies).toBeLessThan(Config.Difficulties.Normal.InitialZombies);
        expect(Config.Difficulties.Normal.InitialZombies).toBeLessThan(Config.Difficulties.Hard.InitialZombies);
        expect(Config.Difficulties.Hard.InitialZombies).toBeLessThan(Config.Difficulties.Ultra.InitialZombies);
    });

    test("harder difficulties have higher MaxEnemies caps", () => {
        expect(Config.Difficulties.Easy.MaxEnemies).toBeLessThan(Config.Difficulties.Normal.MaxEnemies);
        expect(Config.Difficulties.Normal.MaxEnemies).toBeLessThan(Config.Difficulties.Hard.MaxEnemies);
        expect(Config.Difficulties.Hard.MaxEnemies).toBeLessThan(Config.Difficulties.Ultra.MaxEnemies);
    });

    test("snapshot: exact legacy values", () => {
        // These values pin the 2013 gameplay balance. Change deliberately.
        expect(Config.Difficulties.Easy).toEqual({
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
        });
        expect(Config.Difficulties.Ultra.ScoreFactor).toBe(2.0);
        expect(Config.Difficulties.Ultra.EnemySpeedFactor).toBe(1.5);
    });
});

describe("Config.Effects", () => {
    test("Blood and Bones variants exist", () => {
        expect(Config.Effects.Blood).toBeDefined();
        expect(Config.Effects.Bones).toBeDefined();
    });

    test("Blood lasts longer than Bones (tuned for gameplay feel)", () => {
        expect(Config.Effects.Blood.Duration).toBeGreaterThan(Config.Effects.Bones.Duration);
    });

    test("effect settings expose the IVanishingEntitySettings contract", () => {
        for (const key of ["Blood", "Bones"] as const) {
            const e = Config.Effects[key];
            expect(e.Duration).toBeTypeOf("number");
            expect(e.Maximum).toBeTypeOf("number");
            expect(e.Image).toBeTypeOf("string");
            expect(e.Variations).toBeTypeOf("number");
            expect(e.Width).toBeTypeOf("number");
            expect(e.Height).toBeTypeOf("number");
        }
    });
});
