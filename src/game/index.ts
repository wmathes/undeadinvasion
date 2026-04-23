/**
 * Barrel export for the game module.
 *
 *   import { Game } from "@game";
 */

export { Game } from "./Game";
export { Bullet } from "./Bullet";
export { Config } from "./Config";
export type { DifficultyName } from "./Config";
export { Input, InputKey } from "./Input";
export { Position, Rotation } from "./Position";
export { Score } from "./Score";
export type { IScore } from "./Score";
export { AudioManager, Sound } from "./Sound";
export { Tools } from "./Tools";
export { VanishingEntity } from "./VanishingEntity";
export { Weapon } from "./weapons/Weapon";
export { Entity } from "./entities/Entity";
export { Player } from "./entities/Player";
export { PowerUp, HealPowerUp, RandomWeaponPowerUp } from "./entities/PowerUp";
export { BaseAction, EnemyAction, PlayerControlAction, IdleAction, ApproachAction } from "./Actions";
export { preloadAssets, getTexture, getSpritesheetFrames, getRandomZombieFrames } from "./assets";
export type { SpritesheetName } from "./assets";
export type {
    IBullet,
    IEntityAction,
    IEntityBase,
    IEntityOptions,
    IEnemyOptions,
    IGameDifficulty,
    IPowerUpOptions,
    IVanishingEntitySettings,
    IWeapon,
} from "./interfaces";
