/**
 * Module-level reference to the active Game instance.
 *
 * The legacy codebase used a single global `var game: UndeadInvasion.Game`
 * in app.ts, consumed from Actions.ts, Bullet.ts, app.ts itself, etc.
 * Preserving that shape — but module-scoped rather than window-scoped —
 * keeps every call site (`game.Player`, `game.Difficulty`, …) working
 * without touching game logic.
 *
 * Typed as the non-null Game with a lie of an initial value, because
 * every consumer runs during the game loop, after the Game constructor
 * has called setGame(). If you read `game` before construction you'll
 * hit runtime errors — that's faithful to the legacy behaviour.
 */

import type { Game } from "./Game";

export let game: Game = undefined as unknown as Game;

export function setGame(g: Game): void {
    game = g;
}
