/**
 * Weapon definitions and runtime state.
 *
 * Ported from UndeadInvasion.Weapon in Scripts/Game.ts. All thirteen
 * factory methods retain their exact stats (ammo, fire rate, damage,
 * spread) so gameplay feel is preserved.
 */

import { Config } from "../Config";
import type { IBullet, IWeapon } from "../interfaces";
import { signal, type Signal } from "../../signals";

export class Weapon {
    // -------- Weapon factories (13 weapons, values unchanged) --------

    public static Revolver(): Weapon {
        return new Weapon({
            AmmoMax: 6,
            BulletCount: 1,
            BulletSpeed: 1200,
            BulletSpeedSpread: 0,
            BulletSpread: 2,
            BulletLifetime: 2000,
            DamageMax: 180,
            DamageBase: 140,
            DamageSpread: 80,
            IsAutomatic: false,
            Name: "Revolver",
            SpeedAutomatic: 99999,
            SpeedManual: 200,
            SpeedReload: 1100,
        });
    }

    public static Pistol(): Weapon {
        return new Weapon({
            AmmoMax: 15,
            BulletCount: 1,
            BulletSpeed: 1200,
            BulletSpread: 4,
            BulletSpeedSpread: 0,
            BulletLifetime: 2000,
            BulletType: "small",
            DamageMax: 105,
            DamageBase: 80,
            DamageSpread: 45,
            IsAutomatic: true,
            Name: "Pistol",
            SpeedAutomatic: 480,
            SpeedManual: 150,
            SpeedReload: 800,
        });
    }

    public static MachineGun(): Weapon {
        return new Weapon({
            AmmoMax: 30,
            BulletCount: 1,
            BulletSpeed: 1100,
            BulletSpread: 9,
            BulletSpeedSpread: 0.1,
            BulletLifetime: 2000,
            BulletType: "small",
            DamageMax: 60,
            DamageBase: 35,
            DamageSpread: 25,
            IsAutomatic: true,
            Name: "MachineGun",
            SpeedAutomatic: 140,
            SpeedManual: 120,
            SpeedReload: 1200,
        });
    }

    public static AssaultRifle(): Weapon {
        return new Weapon({
            AmmoMax: 32,
            BulletCount: 1,
            BulletSpeed: 1200,
            BulletSpread: 6,
            BulletSpeedSpread: 0.05,
            BulletLifetime: 1800,
            DamageMax: 90,
            DamageBase: 45,
            DamageSpread: 30,
            IsAutomatic: true,
            Name: "AssaultRifle",
            SpeedAutomatic: 200,
            SpeedManual: 180,
            SpeedReload: 1500,
        });
    }

    public static AutoShotgun(): Weapon {
        return new Weapon({
            AmmoMax: 10,
            BulletCount: 12,
            BulletSpeed: 1200,
            BulletSpread: 21,
            BulletSpeedSpread: 0.2,
            BulletLifetime: 800,
            BulletWidth: "5px",
            BulletType: "shrapnel_slim",
            DamageMax: 70,
            DamageBase: 25,
            DamageSpread: 30,
            IsAutomatic: true,
            Name: "AutoShotgun",
            SpeedAutomatic: 420,
            SpeedManual: 350,
            SpeedReload: 2000,
        });
    }

    public static Shotgun(): Weapon {
        return new Weapon({
            AmmoMax: 8,
            BulletCount: 15,
            BulletSpeed: 1200,
            BulletSpread: 18,
            BulletSpeedSpread: 0.3,
            BulletLifetime: 800,
            BulletWidth: "5px",
            BulletType: "shrapnel",
            DamageMax: 80,
            DamageBase: 20,
            DamageSpread: 40,
            IsAutomatic: false,
            Name: "Shotgun",
            SpeedAutomatic: 99999,
            SpeedManual: 550,
            SpeedReload: 2600,
        });
    }

    public static HuntingRifle(): Weapon {
        return new Weapon({
            AmmoMax: 2,
            BulletCount: 10,
            BulletSpeed: 1200,
            BulletSpread: 11,
            BulletSpeedSpread: 0.35,
            BulletLifetime: 2000,
            BulletWidth: "5px",
            BulletType: "shrapnel",
            DamageMax: 180,
            DamageBase: 55,
            DamageSpread: 90,
            IsAutomatic: false,
            Name: "HuntingRifle",
            SpeedAutomatic: 99999,
            SpeedManual: 80,
            SpeedReload: 1200,
        });
    }

    public static Jackhammer(): Weapon {
        return new Weapon({
            AmmoMax: 12,
            BulletCount: 6,
            BulletSpeed: 1200,
            BulletSpread: 18,
            BulletSpeedSpread: 0.2,
            BulletLifetime: 2000,
            BulletWidth: "5px",
            BulletType: "shrapnel_slim",
            DamageMax: 80,
            DamageBase: 30,
            DamageSpread: 30,
            IsAutomatic: true,
            Name: "Jackhammer",
            SpeedAutomatic: 250,
            SpeedManual: 150,
            SpeedReload: 3400,
        });
    }

    public static IonMinigun(): Weapon {
        return new Weapon({
            AmmoMax: 168,
            BulletCount: 1,
            BulletSpeed: 1100,
            BulletSpread: 8,
            BulletSpeedSpread: 0.2,
            BulletLifetime: 2000,
            BulletWidth: "2px",
            BulletHeight: "4px",
            DamageMax: 90,
            DamageBase: 30,
            DamageSpread: 50,
            IsAutomatic: true,
            Name: "Ion Minigun",
            Image: "IonMinigun",
            SpeedAutomatic: 100,
            SpeedManual: 100,
            SpeedReload: 1600,
            BulletType: "ion",
            TrailColor: ["#FF0000", "#880000"],
        });
    }

    public static Phaser(): Weapon {
        return new Weapon({
            AmmoMax: 3,
            BulletCount: 1,
            BulletSpeed: 2500,
            BulletSpread: 2,
            BulletSpeedSpread: 0,
            BulletLifetime: 2000,
            BulletWidth: "32%",
            BulletHeight: "4px",
            DamageMax: 300,
            DamageBase: 30,
            DamageSpread: 20,
            IsAutomatic: true,
            Name: "Phaser",
            SpeedAutomatic: 180,
            SpeedManual: 150,
            SpeedReload: 450,
            BulletType: "phaser",
            TrailColor: ["#FF0000", "#880000"],
        });
    }

    public static CannonLauncher(): Weapon {
        return new Weapon({
            AmmoMax: 4,
            BulletCount: 1,
            BulletSpeed: 1200,
            BulletSpread: 6,
            BulletSpeedSpread: 0,
            BulletLifetime: 2000,
            BulletWidth: "26px",
            BulletHeight: "26px",
            DamageMax: 6000,
            DamageBase: 70,
            DamageSpread: 50,
            IsAutomatic: true,
            Image: "CannonLauncher",
            Name: "Cannon Launcher",
            SpeedAutomatic: 650,
            SpeedManual: 400,
            SpeedReload: 4000,
            BulletType: "cannonball",
            TrailColor: ["#FF0000", "#880000"],
            BulletTrailWidth: 18,
        });
    }

    public static FlameThrower(): Weapon {
        return new Weapon({
            AmmoMax: 60,
            BulletCount: 1,
            BulletSpeed: 350,
            BulletSpread: 18,
            BulletSpeedSpread: 0.2,
            BulletLifetime: 800,
            DamageMax: 600,
            DamageBase: 12,
            DamageSpread: 8,
            IsAutomatic: true,
            Image: "FlameThrower",
            Name: "Flame Thrower",
            SpeedAutomatic: 60,
            BulletScaleFactor: 1.25,
            BulletSpeedFactor: 0.9,
            BulletFadeFactor: 0.65,
            SpeedManual: 60,
            SpeedReload: 1800,
            BulletType: "flame",
            TrailColor: ["#FF0000", "#880000"],
            BulletTrailWidth: 4,
        });
    }

    public static PlasmaCutter(): Weapon {
        return new Weapon({
            AmmoMax: 80,
            BulletCount: 1,
            BulletSpeed: 260,
            BulletSpread: 0.5,
            BulletSpeedSpread: 0,
            BulletLifetime: 400,
            BulletFadeFactor: 0.5,
            DamageMax: 300,
            DamageBase: 20,
            DamageSpread: 20,
            IsAutomatic: true,
            Image: "PlasmaCutter",
            Name: "Plasma Cutter",
            SpeedAutomatic: 60,
            SpeedManual: 60,
            SpeedReload: 1800,
            BulletType: "ray",
            TrailColor: ["#FF0000", "#880000"],
            BulletTrailWidth: 4,
        });
    }

    // -------- Random picker --------

    private static readonly _allWeapons = [
        "Revolver",
        "Pistol",
        "MachineGun",
        "AssaultRifle",
        "Shotgun",
        "HuntingRifle",
        "Jackhammer",
        "Phaser",
        "AutoShotgun",
        "CannonLauncher",
        "IonMinigun",
        "PlasmaCutter",
        "FlameThrower",
    ] as const;

    public static Random(): Weapon {
        const name = this._allWeapons[Math.floor(Math.random() * this._allWeapons.length)]!;
        return Weapon.Create(name);
    }

    /**
     * Lookup a weapon factory by name. Returns undefined for unknown names.
     * Used by EquipWeapon and the random picker.
     */
    public static Create(name: string): Weapon {
        const fn = (Weapon as unknown as Record<string, () => Weapon>)[name];
        if (typeof fn !== "function") {
            throw new Error(`Unknown weapon: ${name}`);
        }
        return fn.call(Weapon);
    }

    // -------- Instance state --------

    public readonly AmmoMax: Signal<number> = signal(0);
    public readonly AmmoRemaining: Signal<number> = signal(0);
    public readonly ReloadPercentage: Signal<number> = signal(0);
    public ImageName: string;

    private _lastFire: number = 999999;
    private _buttonWasReleased: boolean = true;

    public _settings: IWeapon;

    private _shootQueue: IBullet[] = [];

    constructor(settings: IWeapon) {
        this._settings = settings;

        this._settings.Image ??= this._settings.Name;
        this._settings.BulletWidth ??= "3px";
        this._settings.BulletHeight ??= "10px";

        this.ImageName = "images/Weapon_" + this._settings.Name + ".png";

        this.AmmoRemaining.value = this._settings.AmmoMax;
        this.AmmoMax.value = this._settings.AmmoMax;
    }

    public getQueue(): IBullet[] {
        return this._shootQueue;
    }

    public clearQueue(): void {
        this._shootQueue = [];
    }

    public update(d: number, buttonDown: boolean): void {
        // Tick since last fire
        this._lastFire += d;

        // Reloading?
        if (!this.AmmoRemaining.value) {
            let perc = this._lastFire / this._settings.SpeedReload;
            if (perc < 0) perc = 0;
            if (perc > 1) perc = 1;
            this.ReloadPercentage.value = perc;

            if (this._lastFire > this._settings.SpeedReload) {
                this.AmmoRemaining.value = this.AmmoMax.value;
            }
        }
        // Attempt to fire
        else if (buttonDown) {
            this._lastFire += d;

            // Manual
            if (this._buttonWasReleased && this._lastFire > this._settings.SpeedManual) {
                this.shoot();
            }
            // Automatic
            else if (this._settings.IsAutomatic && this._lastFire > this._settings.SpeedAutomatic) {
                this.shoot();
            }
        }

        if (!buttonDown) {
            this._buttonWasReleased = true;
        }
    }

    public shoot(): void {
        if (this.AmmoRemaining.value > 0) {
            for (let i = 0; i < this._settings.BulletCount; i++) {
                const d = Math.floor(this._settings.DamageBase + this._settings.DamageSpread * Math.random());

                const b: IBullet = {
                    Angle: this._settings.BulletSpread * (-1 + Math.random() * 2),
                    Damage: d,
                    Speed: this._settings.BulletSpeed * (1 + Math.random() * this._settings.BulletSpeedSpread),
                    LifeTime: this._settings.BulletLifetime,
                    DamageMax: this._settings.DamageMax,
                    Type: this._settings.BulletType,
                    TrailColor: this._settings.TrailColor,
                    Size: Config.Bullet.DefaultSize,
                    FadeFactor: this._settings.BulletFadeFactor,
                    ScaleFactor: this._settings.BulletScaleFactor,
                    SpeedFactor: this._settings.BulletSpeedFactor,
                    TrailWidth: this._settings.BulletTrailWidth,
                };
                this._shootQueue.push(b);
            }

            this.AmmoRemaining.value = this.AmmoRemaining.value - 1;
            this._lastFire = 0;
            this._buttonWasReleased = false;
        }
    }
}
