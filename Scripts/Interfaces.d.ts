/// <reference path="../Definitions/jquery-1.8.d.ts" />
/// <reference path="../Definitions/sugar-1.3.d.ts" />
/// <reference path="../Definitions/knockout-2.3.0.d.ts" />
/// <reference path="../Definitions/easeljs.d.ts" />
/// <reference path="../Definitions/soundjs.d.ts" />

/// <reference path="Config.ts" />





interface KongregateAPI {

}

interface KongregateAPIStatic {
    loadAPI: (callback) => void;
    getAPI: () => KongregateAPI;
}

declare var kongregateAPI: KongregateAPIStatic;
declare var kongregate: KongregateAPI;


interface IEntityBase {
    update(number): void;
    hasDied(): boolean;
}


interface IGameDifficulty {
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

interface IEntityAction {
    update(delta: number);
}


interface IVanishingEntitySettings {
    Duration: number;
    Maximum: number;
    Image: string;
    Variations: number;
    Width: number;
    Height: number;
}

interface IEntityOptions {

    x?: number;
    y?: number;

    pointValue: number;
}

interface IPowerUpOptions extends IEntityOptions {

}

interface IEnemyOptions extends IEntityOptions {

    angleSpeed?: number;
    moveSpeed?: number;
    name?: string;

    scale: number;

    regX: number;
    regY: number;
    size: number;
} 


interface IWeapon {
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

interface IBullet {
    Damage: number;
    DamageMax: number;
    Speed: number;
    Angle: number;
    Size: number;
    Type: string;
    LifeTime: number;
    TrailColor?: string[];
    TrailWidth?: number;
    FadeFactor?: number;
    ScaleFactor?: number;
    SpeedFactor?: number;
}