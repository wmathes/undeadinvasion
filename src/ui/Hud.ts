/**
 * HTML HUD binder.
 *
 * Wires the static DOM in index.html to the signals on the Game instance.
 * Replaces the former Knockout template/data-bind layer.
 *
 * Two binding patterns are used:
 *   - `bind(signal, fn)` for state that changes occasionally (menu
 *     visibility, weapon pickup, game-over overlay, ...). `fn` runs once
 *     with the current value, then on every subsequent change.
 *   - Nested subscriptions for sub-signals that live inside another
 *     signal's value (e.g. the current weapon's AmmoRemaining). When the
 *     outer signal changes, the inner subscriptions are torn down and
 *     new ones spun up.
 *
 * No per-frame polling: every DOM write is driven by a signal change,
 * so the HUD idles at zero cost when nothing's happening.
 */

import { bind } from "../signals";
import type { Game } from "../game/Game";
import type { Weapon } from "../game/weapons/Weapon";

type Unsubscribe = () => void;

/** Lookup helper with a loud failure mode when an expected id is missing. */
function $<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`[Hud] required element #${id} not found in index.html`);
    }
    return el as T;
}

export class Hud {
    /** Top-level subscriptions; live for the lifetime of this Hud. */
    private readonly _subs: Unsubscribe[] = [];

    /**
     * Subscriptions that hang off the currently-equipped weapon. Torn
     * down and rebuilt each time the player picks up a new weapon.
     */
    private _weaponSubs: Unsubscribe[] = [];

    /** The per-bullet dots inside the magazine display. Rebuilt on weapon change. */
    private _bulletEls: HTMLElement[] = [];

    /** Per-score subscriptions for the end-of-round display. */
    private _gameScoreSubs: Unsubscribe[] = [];

    constructor(private readonly _game: Game) {
        this.wireDifficultyButtons();
        this.wireStateVisibility();
        this.wireHud();
        this.wireWeaponDisplay();
        this.wireEndOfRoundScore();
    }

    // -------- Menu buttons --------

    private wireDifficultyButtons(): void {
        const difficulties: [id: string, level: "Easy" | "Normal" | "Hard" | "Ultra"][] = [
            ["btn-easy", "Easy"],
            ["btn-normal", "Normal"],
            ["btn-hard", "Hard"],
            ["btn-ultra", "Ultra"],
        ];
        for (const [id, level] of difficulties) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this._game.start(level);
                });
            }
        }
    }

    // -------- Top-level menu / HUD visibility --------

    private wireStateVisibility(): void {
        const menu = $("menu");
        const hud = $("hud");
        this._subs.push(
            bind(this._game.State, (state) => {
                menu.hidden = state !== "menu";
                hud.hidden = state !== "game";
            }),
        );
    }

    // -------- In-game HUD (score + health) --------

    private wireHud(): void {
        const scoreEl = $("hud-score");
        this._subs.push(
            bind(this._game.Score, (v) => {
                scoreEl.textContent = String(v);
            }),
        );

        const healthbarEl = $("hud-healthbar");
        this._subs.push(
            bind(this._game.HPWidth, (w) => {
                healthbarEl.style.width = w;
            }),
        );
    }

    // -------- Weapon display --------

    private wireWeaponDisplay(): void {
        this._subs.push(
            bind(this._game.Weapon, (weapon) => {
                this.rebuildWeaponUi(weapon);
            }),
        );
    }

    /**
     * Tear down the old weapon's signal subscriptions, rebuild the magazine
     * DOM to match the new weapon's AmmoMax, then subscribe to the new
     * weapon's AmmoRemaining + ReloadPercentage signals.
     */
    private rebuildWeaponUi(weapon: Weapon | null): void {
        // 1. Unplug old subscriptions
        for (const off of this._weaponSubs) off();
        this._weaponSubs = [];

        const iconEl = $("hud-weapon-icon");
        const magazineEl = $("hud-magazine");
        const reloadEl = $("hud-reload");
        const reloadProgressEl = $("hud-reload-progress");

        if (!weapon) {
            iconEl.style.backgroundImage = "";
            magazineEl.innerHTML = "";
            reloadEl.hidden = true;
            this._bulletEls = [];
            return;
        }

        // 2. Weapon icon - uses the asset name embedded in the settings
        const imageName = weapon._settings.Image ?? weapon._settings.Name;
        iconEl.style.backgroundImage = `url(images/weapon_${imageName}.png)`;

        // 3. Rebuild the magazine's ammo dots to match AmmoMax
        magazineEl.innerHTML = "";
        this._bulletEls = [];
        const max = weapon.AmmoMax.value;
        const bulletW = weapon._settings.BulletWidth ?? "3px";
        const bulletH = weapon._settings.BulletHeight ?? "10px";
        for (let i = 0; i < max; i++) {
            const bullet = document.createElement("div");
            bullet.className = "bullet";
            bullet.style.width = bulletW;
            bullet.style.height = bulletH;
            magazineEl.appendChild(bullet);
            this._bulletEls.push(bullet);
        }

        // 4. Subscribe to AmmoRemaining - toggles .empty on bullet dots,
        //    shows/hides reload progress bar.
        this._weaponSubs.push(
            bind(weapon.AmmoRemaining, (remaining) => {
                const reloading = remaining === 0;
                reloadEl.hidden = !reloading;
                for (let i = 0; i < this._bulletEls.length; i++) {
                    this._bulletEls[i]!.classList.toggle("empty", i >= remaining);
                }
            }),
        );

        // 5. Subscribe to ReloadPercentage - fills the reload progress bar.
        this._weaponSubs.push(
            bind(weapon.ReloadPercentage, (p) => {
                reloadProgressEl.style.width = `${p * 100}%`;
            }),
        );
    }

    // -------- End-of-round score display --------

    private wireEndOfRoundScore(): void {
        const rootEl = $("game-score");
        const timeEl = $("game-score-time");
        const pointsEl = $("game-score-points");

        this._subs.push(
            bind(this._game.GameScore, (gs) => {
                // Tear down any subscriptions from the previous round
                for (const off of this._gameScoreSubs) off();
                this._gameScoreSubs = [];

                if (!gs) {
                    rootEl.hidden = true;
                    return;
                }

                rootEl.hidden = false;
                this._gameScoreSubs.push(
                    bind(gs.Time, (v) => {
                        timeEl.textContent = v;
                    }),
                );
                this._gameScoreSubs.push(
                    bind(gs.Score, (v) => {
                        pointsEl.textContent = v;
                    }),
                );
            }),
        );
    }

    // -------- Lifecycle --------

    /** Tear down every subscription. Call when the game is being disposed. */
    public destroy(): void {
        for (const off of this._subs) off();
        for (const off of this._weaponSubs) off();
        for (const off of this._gameScoreSubs) off();
    }
}
