/**
 * The main Game class - owns the PixiJS application, the entity/bullet/
 * effect arrays, input, and the game loop.
 *
 * Ported from the CreateJS/EaselJS version as Step 1 of the PixiJS
 * modernisation. Game logic (spawn schedules, tick order, scoring
 * formulas, difficulty application, collision) is preserved exactly.
 * Rendering-layer changes:
 *
 *   - createjs.Stage  -> PIXI.Application (owns ticker + renderer)
 *   - createjs.Container -> PIXI.Container
 *   - createjs.Ticker.addEventListener("tick") -> app.ticker.add(...)
 *   - event.delta (ms) -> app.ticker.deltaMS
 *   - stage.update()   -> removed (Pixi renders automatically per frame)
 *   - container.removeAllChildren() -> container.removeChildren()
 */

import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import ko from "knockout";
import { Bullet } from "./Bullet";
import { Config } from "./Config";
import type { DifficultyName } from "./Config";
import type { IBullet, IEntityBase, IGameDifficulty } from "./interfaces";
import { Input } from "./Input";
import { Score } from "./Score";
import { AudioManager, Sound } from "./Sound";
import { setGame } from "./state";
import { VanishingEntity } from "./VanishingEntity";
import { Weapon } from "./weapons/Weapon";
import { Entity } from "./entities/Entity";
import { Player } from "./entities/Player";
import { PowerUp } from "./entities/PowerUp";

export class Game {
    // -------- Global Ref --------
    private static _current: Game | undefined;
    public static get Current(): Game | undefined {
        return this._current;
    }

    // -------- Pixi application + display tree --------
    private _app!: Application;
    private _viewport!: Viewport;
    private _groundContainer!: Container;
    private _entityContainer!: Container;
    private _effectContainer!: Container;

    /** Root container - the Pixi stage itself. */
    public get Stage(): Container {
        return this._app.stage;
    }

    /**
     * The game world camera. Ground/entity/effect containers all live
     * under this viewport, and the viewport transform translates world
     * coordinates to screen coordinates each frame. Exposed for future
     * consumers that need screen<->world conversion (e.g. mobile UI).
     */
    public get Viewport(): Viewport {
        return this._viewport;
    }

    // -------- Observables (Knockout-bound) --------
    private _score: ko.Observable<number> = ko.observable(0);
    public get Score(): ko.Observable<number> {
        return this._score;
    }

    private _weapon: ko.Observable<Weapon | null> = ko.observable(null);
    public get Weapon(): ko.Observable<Weapon | null> {
        return this._weapon;
    }

    private _state: ko.Observable<string> = ko.observable("menu");
    public get State(): ko.Observable<string> {
        return this._state;
    }

    private _paused: ko.Observable<boolean> = ko.observable(false);
    public get Paused(): ko.Observable<boolean> {
        return this._paused;
    }

    public GameScore: ko.Observable<Score | null> = ko.observable(null);
    public HPWidth: ko.Observable<string> = ko.observable("100%");

    // -------- Internal state --------
    private _vanishingEntities: VanishingEntity[] = [];
    private _bullets: Bullet[] = [];
    private _entities: IEntityBase[] = [];
    private _entityQueue: IEntityBase[] = [];
    private _killCount: ko.Observable<number> = ko.observable(0);

    public get Entities(): IEntityBase[] {
        return this._entities;
    }

    private _gameLength: number = 0;
    private _gameSpawnNext: number = 0;
    private _gameSpawnIndex: number = 0;
    private _healLast: number = 0;

    private _player: Player | null = null;
    public get Player(): Player | null {
        return this._player;
    }

    private _difficulty!: IGameDifficulty;
    public get Difficulty(): IGameDifficulty {
        return this._difficulty;
    }

    private _input: Input = new Input();
    public get Input(): Input {
        return this._input;
    }

    private _messageGameOver: HTMLElement | null = null;

    // -------- Construction --------
    constructor(playfieldName: string) {
        // Register as current + expose through ./state before any sub-
        // component that reads `game` (Input's key callback, Entity's
        // difficulty lookup) can run.
        Game._current = this;
        setGame(this);

        const playfield = document.getElementById(playfieldName);
        if (!playfield) {
            console.error(`No playfield "${playfieldName}" found in DOM`);
            return;
        }

        playfield.classList.add("playfield");
        if ("focus" in playfield) (playfield as HTMLElement).focus();

        const canvasElement = playfield.querySelector("canvas");
        if (!canvasElement) {
            console.error("No <canvas> inside playfield");
            return;
        }

        // Pixi application bound to the existing <canvas>. Fixed internal
        // resolution - CSS in UndeadInvasion.css scales the canvas
        // responsively via a CSS custom property driven by src/responsive.ts.
        this._app = new Application({
            view: canvasElement as HTMLCanvasElement,
            width: Config.Game.Width,
            height: Config.Game.Height,
            backgroundAlpha: 0, // transparent so the CSS background shows through
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // Camera. Viewport is a PIXI.Container subclass that transforms
        // everything inside it per-frame. World coordinates are preserved
        // on all entities/bullets/effects; the viewport handles the
        // translation/scale so that the player-centered region of the
        // world fills the screen.
        this._viewport = new Viewport({
            screenWidth: Config.Game.Width,
            screenHeight: Config.Game.Height,
            worldWidth: Config.World.Width,
            worldHeight: Config.World.Height,
            events: this._app.renderer.events,
        });
        // Don't let the camera scroll past the world edges. underflow:'center'
        // centers the world when it's smaller than the viewport (e.g. future
        // tiny levels or very wide monitors).
        this._viewport.clamp({ direction: "all", underflow: "center" });
        this._app.stage.addChild(this._viewport);

        // Display-tree layers (ground -> entities -> effects) live inside
        // the viewport so they move with the camera.
        this._groundContainer = new Container();
        this._entityContainer = new Container();
        this._effectContainer = new Container();
        this._viewport.addChild(this._groundContainer, this._entityContainer, this._effectContainer);

        // Game loop tick - Pixi ticker delta is in "frames" but .deltaMS
        // carries the real milliseconds the game logic expects. The
        // viewport needs its own update call for follow/easing plugins.
        this._app.ticker.add(() => {
            const dt = this._app.ticker.deltaMS;
            this.tick(dt);
            this._viewport.update(dt);
        });

        // Default difficulty so SwitchDifficulty() has something to fall back on
        this._difficulty = Config.Difficulties.Normal;

        // Knockout bindings on <body>
        const body = document.body;
        ko.cleanNode(body);
        ko.applyBindings(this, body);

        // Pointer events (unified mouse + touch). We feed two things into
        // the Input system:
        //   1. Button-press state (left mouse / touch down) for firing
        //   2. Cursor position in WORLD coordinates (not screen), so that
        //      the player's aim calculation compares world-vs-world.
        // The screen->world conversion uses the viewport's current
        // transform, so aim stays correct as the camera scrolls.
        const toWorld = (screenX: number, screenY: number): { x: number; y: number } => {
            const p = this._viewport.toWorld(screenX, screenY);
            return { x: p.x, y: p.y };
        };
        canvasElement.addEventListener("pointerdown", (e) => {
            canvasElement.setPointerCapture(e.pointerId);
            const w = toWorld(e.offsetX, e.offsetY);
            this.Input.setCursorWorld(w.x, w.y);
            this.Input.handlePointerDown(e);
        });
        canvasElement.addEventListener("pointerup", (e) => {
            const w = toWorld(e.offsetX, e.offsetY);
            this.Input.setCursorWorld(w.x, w.y);
            this.Input.handlePointerUp(e);
        });
        canvasElement.addEventListener("pointermove", (e) => {
            const w = toWorld(e.offsetX, e.offsetY);
            this.Input.setCursorWorld(w.x, w.y);
            this.Input.handlePointerMove(e);
        });
        canvasElement.style.touchAction = "none";

        // Keyboard
        document.addEventListener("keydown", (e) => {
            this.Input.handleKeyDown(e);
        });
        document.addEventListener("keyup", (e) => {
            this.Input.handleKeyUp(e);
        });

        // Cache the game-over overlay element
        this._messageGameOver = document.getElementById("messageGameOver");
        if (this._messageGameOver) {
            this._messageGameOver.style.display = "none";
        }

        // Preload SFX so the first splatter / death sound doesn't race the
        // file load. BGM files exist too (bgm_game.mp3, bgm_menu.mp3) but
        // the original never played them - tracked in IDEAS.md.
        void AudioManager.preloadAll(["bloodsplash", "zombie_die", "weapon_Phaser"]);
    }

    // -------- Public API --------

    public splatterBlood(x: number, y: number): void {
        this._vanishingEntities.push(new VanishingEntity("Blood", x, y, this._groundContainer));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _s = new Sound("bloodsplash");
    }

    public splatterBones(x: number, y: number, angle?: number, scale?: number): void {
        const ve = new VanishingEntity("Bones", x, y, this._groundContainer);
        if (angle !== undefined) ve.angle = angle;
        if (scale !== undefined) ve.scale = scale;
        this._vanishingEntities.push(ve);
    }

    public spawnPowerup(x: number, y: number, forceWeapon: boolean = false): void {
        this._entityQueue.push(PowerUp.GetRandom(this._entityContainer, x, y, forceWeapon));
    }

    public spawnEnemy(entityName: string = "Zombie", borderSpawn: boolean = true): void {
        if (this._entities.length < this._difficulty.MaxEnemies) {
            let x = 0;
            let y = 0;

            if (borderSpawn) {
                // Spawn at the VIEWPORT edges (where the player can almost
                // see), not the world edges. This keeps combat density
                // comparable to the pre-camera game regardless of how
                // large the current level's world gets. Clamp to world
                // bounds so we never spawn outside walkable area on tiny
                // maps or near the world corners.
                const vw = Config.Game.Width;
                const vh = Config.Game.Height;
                const cx = this._viewport.center.x;
                const cy = this._viewport.center.y;

                const r = Math.floor(Math.random() * 4);
                if (r === 0 || r === 2) {
                    x = cx - vw / 2 + Math.random() * vw;
                    y = cy - vh / 2 + Math.random() * (vh * 0.1);
                    if (r === 2) y += vh * 0.9;
                } else {
                    y = cy - vh / 2 + Math.random() * vh;
                    x = cx - vw / 2 + Math.random() * (vw * 0.1);
                    if (r === 1) x += vw * 0.9;
                }
                x = Math.max(0, Math.min(Config.World.Width, x));
                y = Math.max(0, Math.min(Config.World.Height, y));
            } else {
                x = Math.random() * Config.World.Width;
                y = Math.random() * Config.World.Height;
            }

            const scale = 0.75 + Math.random() * 0.75;

            const enemy = new Entity(this._entityContainer, {
                angleSpeed: 60 / 1000,
                moveSpeed: 40 / 1000,
                name: entityName,
                size: 24 * scale,
                x,
                y,
                scale,
                pointValue: 5 + Math.floor(scale * 15),
                regX: 15,
                regY: 13,
            });

            this._entities.push(enemy);
        }
    }

    public spawnPlayer(): void {
        const player = new Player(this._entityContainer);
        this._player = player;
        this.Weapon(Weapon.Pistol());

        // Camera tracks the player. `radius` gives rubber-band feel:
        // the camera only chases once the player steps outside this pixel
        // radius from the current camera centre, producing a dead-zone
        // around the player's immediate movement.
        const playerSprite = player.DisplayObject;
        if (playerSprite) {
            this._viewport.follow(playerSprite, {
                speed: 0, // 0 = snappy; raise (e.g. 8) for more inertia
                acceleration: null,
                radius: 80,
            });
        } else {
            // Fallback: jump camera to player position once without follow
            this._viewport.moveCenter(player.position.x, player.position.y);
        }
    }

    public reset(difficulty?: DifficultyName | string): void {
        this._gameLength = 0;
        this._gameSpawnNext = 0;
        this._gameSpawnIndex = 0;
        this._killCount(0);
        this._entities = [];
        this._bullets = [];
        this.Score(0);

        this._player = null;
        this._state("menu");
        this._paused(true);

        this.SwitchDifficulty(difficulty);

        this._effectContainer.removeChildren();
        this._groundContainer.removeChildren();
        this._entityContainer.removeChildren();

        // Detach the camera follow so the viewport doesn't chase a freed sprite.
        this._viewport.plugins.remove("follow");
        this._viewport.moveCenter(Config.World.Width / 2, Config.World.Height / 2);
    }

    public start(difficulty?: DifficultyName | string): void {
        this.reset(difficulty);
        this.spawnPlayer();

        this._state("game");
        this._paused(false);

        for (let i = 0; i < this.Difficulty.InitialZombies; i++) {
            this.spawnEnemy("Zombie", true);
        }
    }

    public end(): void {
        if (!this._player) return;

        this.GameScore(
            new Score({
                Points: this.Score(),
                Time: this._gameLength,
            }),
        );

        this.splatterBones(this._player.position.x, this._player.position.y);

        this._player.removeElement();
        this._player = null;

        this.showGameOverOverlay(() => {
            this.GameScore()?.upload();
            setTimeout(() => {
                if (this._messageGameOver) {
                    this._messageGameOver.style.display = "none";
                    this._messageGameOver.style.opacity = "";
                }
                this.reset();
                this.GameScore()?.animate();
            }, 1600);
        });
    }

    private showGameOverOverlay(onDone: () => void): void {
        const el = this._messageGameOver;
        if (!el) {
            onDone();
            return;
        }
        el.style.opacity = "0";
        el.style.display = "";
        el.style.transition = "opacity 2.4s";
        void el.offsetWidth;
        el.style.opacity = "1";
        const handler = (): void => {
            el.removeEventListener("transitionend", handler);
            onDone();
        };
        el.addEventListener("transitionend", handler);
        setTimeout(handler, 2500);
    }

    public stop(): void {
        this.reset();
        this._state("menu");
    }

    public togglePause(): void {
        if (this._state() === "game") this._paused(!this._paused());
    }

    public pause(): void {
        if (this._state() === "game") this._paused(true);
    }

    public resume(): void {
        if (this._state() === "game") this._paused(false);
    }

    // -------- Main tick --------

    public tick(d: number): void {
        if (!this._paused() && this._state() === "game") {
            this._gameLength += d;
            this.tickRespawn(d);
            this.tickBullets(d);
            this.tickWeapon(d);
            this.tickEntities(d);
            this.tickPlayer(d);
            this.tickHeal(d);
            this.recalcPlayerHealth();
        }

        this.tickGroundEffects(d);
        // Pixi's renderer auto-draws each frame - no explicit stage.update()
    }

    public tickRespawn(d: number): void {
        this._gameSpawnNext -= d;

        if (this._player && this._gameSpawnNext <= 0) {
            let amount = Math.ceil(this._gameSpawnIndex / this._difficulty.AmountStep);
            if (amount > 3) amount = 3;

            for (let i = 0; i < amount; i++) {
                this.spawnEnemy("Zombie", true);
            }

            let nextSpawn = this._difficulty.DelayMax - this._gameSpawnIndex * 4;
            if (nextSpawn < this._difficulty.DelayMin) nextSpawn = this._difficulty.DelayMin;

            this._gameSpawnNext = nextSpawn;
            this._gameSpawnIndex++;
        }
    }

    public tickHeal(d: number): void {
        if (this._player) {
            this._healLast += d;
            if (this._healLast > this.Difficulty.HealEvery) {
                this._healLast -= this.Difficulty.HealEvery;
                this._player.addHealth(1, false);
            }
        }
    }

    public recalcPlayerHealth(): void {
        let v = "0%";
        if (this._player) {
            v = Math.round(100 * (this._player.hp / this._player.hpMax)) + "%";
        }
        this.HPWidth(v);
    }

    public tickPlayer(d: number): void {
        if (this._player) {
            this._player.update(d);
            if ((this._player.HP?.() ?? 0) <= 0) {
                this.end();
            }
        }
    }

    public tickBullets(d: number): void {
        this._bullets.forEach((el) => el.update(d));
        this._bullets = this._bullets.filter((b) => !b.isRemoved());
    }

    public tickEntities(d: number): void {
        const newEntities: IEntityBase[] = [];
        this._entityQueue = [];
        let scoreIncrease = 0;
        let scoreTimeFactor = 1;

        this._entities.forEach((entBase) => {
            const ent = entBase as Entity;
            ent.update(d);
            if (!ent.hasDied()) {
                newEntities.push(ent);
            } else {
                scoreTimeFactor += Math.sqrt(this._gameLength / 2) / 1000;

                // Distinguish Entity (has moveForward) from PowerUp (doesn't)
                if (typeof ent.moveForward === "function" && ent.options) {
                    this._gameSpawnNext -= 100;
                    scoreIncrease += ent.options.pointValue * this.Difficulty.ScoreFactor;
                    this.splatterBones(
                        ent.position.x,
                        ent.position.y,
                        ent.rotation.angle,
                        (ent.options as { scale?: number }).scale,
                    );
                    if (Math.random() < this.Difficulty.PowerUpChance || this._killCount() === 0) {
                        this.spawnPowerup(ent.position.x, ent.position.y, this._killCount() === 0);
                    }
                    this._killCount(this._killCount() + 1);
                } else {
                    const powerUp = entBase as PowerUp;
                    const p = powerUp.options.pointValue * this.Difficulty.ScoreFactor + Math.sqrt(this.Score());
                    scoreIncrease += p;
                }

                (ent as Entity | PowerUp).removeElement();
            }
        });

        this.Score(this.Score() + Math.floor(scoreIncrease * scoreTimeFactor));
        this._entities = [...newEntities, ...this._entityQueue];
    }

    public tickGroundEffects(d: number): void {
        this._vanishingEntities.forEach((el) => el.update(d));
        this._vanishingEntities = this._vanishingEntities.filter((v) => !v.isRemoved());
    }

    public tickWeapon(d: number): void {
        const weapon = this.Weapon();
        if (weapon) {
            weapon.update(d, this.Input.Fire.Clicked && !!this._player);

            if (this._player) {
                weapon.getQueue().forEach((bulletData: IBullet) => {
                    const bullet = new Bullet(
                        bulletData,
                        this._player!.position.x,
                        this._player!.position.y,
                        this._player!.rotation.angle,
                        this._effectContainer,
                    );
                    this._bullets.push(bullet);
                });
            }

            weapon.clearQueue();
        }
    }

    public EquipWeapon(name: string): void {
        try {
            this.Weapon(Weapon.Create(name));
        } catch {
            // Unknown weapon name - ignore, matching legacy behaviour
        }
    }

    public EquipRandomWeapon(): void {
        this.Weapon(Weapon.Random());
    }

    public SwitchDifficulty(difficulty: DifficultyName | string = "Normal"): void {
        const difficulties = Config.Difficulties as Record<string, IGameDifficulty>;
        if (!difficulties[difficulty]) {
            difficulty = "Normal";
        }
        this._difficulty = difficulties[difficulty]!;
    }
}
