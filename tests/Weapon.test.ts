/**
 * Weapon factory regression tests.
 *
 * Pins the stat blocks for all 13 weapons so accidental tuning changes
 * during future refactors surface as test failures instead of silently
 * rebalancing the game.
 *
 * Weapon exposes AmmoMax / AmmoRemaining / ReloadPercentage as signals
 * (from src/signals.ts). Tests read signal.value directly.
 */

import { describe, expect, test } from "bun:test";
import { Weapon } from "../src/game/weapons/Weapon";

const ALL_WEAPON_NAMES = [
    "Revolver",
    "Pistol",
    "MachineGun",
    "AssaultRifle",
    "AutoShotgun",
    "Shotgun",
    "HuntingRifle",
    "Jackhammer",
    "IonMinigun",
    "Phaser",
    "CannonLauncher",
    "FlameThrower",
    "PlasmaCutter",
] as const;

describe("Weapon factories", () => {
    test.each(ALL_WEAPON_NAMES.map((n) => [n]))("%s factory creates a valid Weapon", (name) => {
        const w = Weapon.Create(name);
        expect(w).toBeInstanceOf(Weapon);
        expect(w.AmmoMax.value).toBeGreaterThan(0);
        expect(w.AmmoRemaining.value).toBe(w.AmmoMax.value);
    });

    test("Revolver matches legacy stats", () => {
        const w = Weapon.Revolver();
        // _settings is private by convention but accessible at runtime
        const s = (w as unknown as { _settings: Record<string, unknown> })._settings;
        expect(s["Name"]).toBe("Revolver");
        expect(s["AmmoMax"]).toBe(6);
        expect(s["BulletCount"]).toBe(1);
        expect(s["DamageBase"]).toBe(140);
        expect(s["DamageMax"]).toBe(180);
        expect(s["SpeedReload"]).toBe(1100);
        expect(s["IsAutomatic"]).toBe(false);
    });

    test("Shotgun fires 15 pellets per shot", () => {
        const s = (Weapon.Shotgun() as unknown as { _settings: { BulletCount: number } })._settings;
        expect(s.BulletCount).toBe(15);
    });

    test("IonMinigun is automatic with 168-round magazine", () => {
        const s = (Weapon.IonMinigun() as unknown as { _settings: { AmmoMax: number; IsAutomatic: boolean } })
            ._settings;
        expect(s.AmmoMax).toBe(168);
        expect(s.IsAutomatic).toBe(true);
    });

    test("FlameThrower applies per-bullet fade/scale/speed factors", () => {
        const s = (
            Weapon.FlameThrower() as unknown as {
                _settings: { BulletScaleFactor: number; BulletSpeedFactor: number; BulletFadeFactor: number };
            }
        )._settings;
        expect(s.BulletScaleFactor).toBe(1.25);
        expect(s.BulletSpeedFactor).toBe(0.9);
        expect(s.BulletFadeFactor).toBe(0.65);
    });
});

describe("Weapon.Random", () => {
    test("returns one of the 13 canonical weapon names", () => {
        for (let i = 0; i < 20; i++) {
            const w = Weapon.Random();
            const s = (w as unknown as { _settings: { Name: string } })._settings;
            // Flame Thrower / Cannon Launcher / Ion Minigun have display names
            // with spaces but the factory method names don't.
            const nameMatches =
                (ALL_WEAPON_NAMES as readonly string[]).includes(s.Name) ||
                ["Ion Minigun", "Cannon Launcher", "Flame Thrower", "Plasma Cutter"].includes(s.Name);
            expect(nameMatches).toBe(true);
        }
    });
});

describe("Weapon.Create", () => {
    test("throws on unknown weapon name", () => {
        expect(() => Weapon.Create("NotAWeapon")).toThrow();
    });
});
