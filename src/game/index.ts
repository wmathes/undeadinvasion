/**
 * Barrel export for the game module. Import from here for convenience:
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
export { Sound } from "./Sound";
export { SpriteSheetData, SpriteSheets } from "./SpriteSheetData";
export { Tools } from "./Tools";
export { VanishingEntity } from "./VanishingEntity";
export { Weapon } from "./weapons/Weapon";
export { Entity } from "./entities/Entity";
export { Player } from "./entities/Player";
export { PowerUp, HealPowerUp, RandomWeaponPowerUp } from "./entities/PowerUp";
export { BaseAction, EnemyAction, PlayerControlAction, IdleAction, ApproachAction } from "./Actions";
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
