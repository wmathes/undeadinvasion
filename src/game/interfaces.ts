/**
 * Shared game-wide interfaces.
 *
 * Ported from the legacy Scripts/Interfaces.d.ts. Kongregate global stubs
 * were dropped — the modernised build does not load the Kongregate CDN API.
 */

export interface IEntityBase {
    update(delta: number): void;
    hasDied(): boolean;
}

export interface IGameDifficulty {
    DelayMax: number;
    DelayMin: number;
    AmountStep: number;
    ScoreFactor: number;
    EnemyHealthFactor: number;
    EnemyDamageFactor: number;
    EnemySpeedFactor: number;
    PowerUpLifetime: number;
    InitialZombies: number;
    MaxEnemies: number;
    HealEvery: number;
    PowerUpChance: number;
}

export interface IEntityAction {
    update(delta: number): void;
}

export interface IVanishingEntitySettings {
    Duration: number;
    Maximum: number;
    Image: string;
    Variations: number;
    Width: number;
    Height: number;
}

export interface IEntityOptions {
    x?: number;
    y?: number;
    pointValue: number;
}

export type IPowerUpOptions = IEntityOptions;

export interface IEnemyOptions extends IEntityOptions {
    angleSpeed?: number;
    moveSpeed?: number;
    name?: string;
    scale: number;
    regX: number;
    regY: number;
    size: number;
}

export interface IWeapon {
    Name: string;
    Image?: string;
    BulletCount: number;
    IsAutomatic: boolean;
    AmmoMax: number;
    SpeedReload: number;
    SpeedAutomatic: number;
    SpeedManual: number;
    BulletSpread: number;
    BulletSpeed: number;
    BulletSpeedSpread: number;
    BulletLifetime: number;
    BulletType?: string;
    BulletWidth?: string;
    BulletHeight?: string;
    BulletScale?: number;
    BulletFace?: number;
    TrailColor?: string[];
    DamageBase: number;
    DamageSpread: number;
    DamageMax: number;

    BulletSpeedFactor?: number;
    BulletScaleFactor?: number;
    BulletFadeFactor?: number;
    BulletTrailWidth?: number;
}

export interface IBullet {
    Damage: number;
    DamageMax: number;
    Speed: number;
    Angle: number;
    Size: number;
    Type?: string;
    LifeTime: number;
    TrailColor?: string[];
    TrailWidth?: number;
    FadeFactor?: number;
    ScaleFactor?: number;
    SpeedFactor?: number;
}
