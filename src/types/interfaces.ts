/**
 * Public type re-exports. Kept here so `@types/*` path alias continues to
 * resolve for consumers that prefer importing types from `@types/...`
 * rather than from `@game/...`.
 */

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
} from "../game/interfaces";

export type { IScore } from "../game/Score";
export type { DifficultyName } from "../game/Config";
