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

import { Application, Container, TilingSprite } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { getTexture } from "./assets";
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
import { signal, type Signal } from "../signals";
import { Hud } from "../ui/Hud";

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

    // -------- Reactive state (consumed by src/ui/Hud.ts) --------
    private readonly _score: Signal<number> = signal(0);
    public get Score(): Signal<number> {
        return this._score;
    }

    private readonly _weapon: Signal<Weapon | null> = signal<Weapon | null>(null);
    public get Weapon(): Signal<Weapon | null> {
        return this._weapon;
    }

    private readonly _state: Signal<string> = signal("menu");
    public get State(): Signal<string> {
        return this._state;
    }

    private readonly _paused: Signal<boolean> = signal(false);
    public get Paused(): Signal<boolean> {
        return this._paused;
    }

    public readonly GameScore: Signal<Score | null> = signal<Score | null>(null);
    public readonly HPWidth: Signal<string> = signal("100%");

    // -------- Internal state --------
    private _vanishingEntities: VanishingEntity[] = [];
    private _bullets: Bullet[] = [];
    private _entities: IEntityBase[] = [];
    private _entityQueue: IEntityBase[] = [];
    private readonly _killCount: Signal<number> = signal(0);

    /** HUD owner. Holds DOM bindings + unsubscribes. Created in init(). */
    private _hud!: Hud;

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

    /**
     * Virtual camera target. Each frame this point exponentially tweens
     * toward the player's position; the viewport's centre is snapped to
     * it. Gives a smooth, lag-aware camera (configurable via
     * Config.Camera.Smoothness) instead of a rigid drag-behind follow.
     *
     * `null` when there's no player (menu, mid-transition, game over).
     */
    private _cameraTarget: { x: number; y: number } | null = null;

    /** Stashed so init() can find the DOM playfield after construction. */
    private readonly _playfieldName: string;

    // -------- Construction --------

    /**
     * Use `Game.create()` rather than `new Game()` directly - the factory
     * awaits the async PixiJS Application init before returning. Calling
     * the constructor alone leaves Pixi/Viewport/containers uninitialised.
     */
    constructor(playfieldName: string) {
        // Register as current + expose through ./state before any sub-
        // component that reads `game` (Input's key callback, Entity's
        // difficulty lookup) can run.
        Game._current = this;
        setGame(this);

        this._playfieldName = playfieldName;
        this._difficulty = Config.Difficulties.Normal;
    }

    /**
     * Create and fully initialise a Game in one step. Returns only once
     * PixiJS is ready and the ticker is running.
     */
    public static async create(playfieldName: string): Promise<Game> {
        const g = new Game(playfieldName);
        await g.init();
        return g;
    }

    /**
     * Async half of construction: boot PixiJS (v8 Application.init is
     * async), wire the camera viewport, containers, ticker, HTML HUD
     * bindings, pointer + keyboard listeners, and kick off SFX preload.
     *
     * Expects the DOM to be ready and preloadAssets() to have completed.
     */
    public async init(): Promise<void> {
        const playfield = document.getElementById(this._playfieldName);
        if (!playfield) {
            throw new Error(`Game.init: no playfield "${this._playfieldName}" in DOM`);
        }

        playfield.classList.add("playfield");
        if ("focus" in playfield) (playfield as HTMLElement).focus();

        const canvasElement = playfield.querySelector("canvas");
        if (!canvasElement) {
            throw new Error("Game.init: no <canvas> inside playfield");
        }

        // PixiJS v8: Application.init() is async and 'canvas' replaces
        // v7's 'view'. CSS in UndeadInvasion.css scales the canvas
        // responsively via a CSS custom property driven by src/responsive.ts.
        this._app = new Application();
        await this._app.init({
            preference: 'webgl',
            canvas: canvasElement as HTMLCanvasElement,
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
        // translation/scale so the player-centered world region fills the
        // screen.
        this._viewport = new Viewport({
            screenWidth: Config.Game.Width,
            screenHeight: Config.Game.Height,
            worldWidth: Config.World.Width,
            worldHeight: Config.World.Height,
            events: this._app.renderer.events,
        });
        // Don't let the camera scroll past world edges. underflow:'center'
        // centers the world when it's smaller than the viewport (e.g. future
        // tiny levels or very wide monitors).
        this._viewport.clamp({ direction: "all", underflow: "center" });
        this._app.stage.addChild(this._viewport);

        // Tiled background sprite, full world size. Sits below every
        // other layer so ground splatters / entities / bullets render on
        // top of it. Because it lives inside the viewport it scrolls with
        // the camera, unlike the legacy CSS background that was a fixed
        // backdrop on the canvas wrapper.
        const backgroundTexture = getTexture("images/background.png");
        const background = new TilingSprite({
            texture: backgroundTexture,
            width: Config.World.Width,
            height: Config.World.Height,
        });
        this._viewport.addChild(background);

        // Display-tree layers (ground -> entities -> effects) live inside
        // the viewport so they move with the camera.
        this._groundContainer = new Container();
        this._entityContainer = new Container();
        this._effectContainer = new Container();
        this._viewport.addChild(this._groundContainer, this._entityContainer, this._effectContainer);

        // Game loop tick - Pixi ticker delta is in "frames" but .deltaMS
        // carries the real milliseconds the game logic expects.
        this._app.ticker.add(() => {
            const dt = this._app.ticker.deltaMS;
            this.tick(dt);
            this.tickCamera(dt);
        });

        // HUD: wires DOM elements in index.html to the signals on this Game.
        // Replaces the former Knockout applyBindings(this, body) call.
        this._hud = new Hud(this);

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
        document.addEventListener("keydown", (e) => this.Input.handleKeyDown(e));
        document.addEventListener("keyup", (e) => this.Input.handleKeyUp(e));

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

            const scale =
                Config.Enemy.ScaleMin + Math.random() * (Config.Enemy.ScaleMax - Config.Enemy.ScaleMin);

            const enemy = new Entity(this._entityContainer, {
                angleSpeed: Config.Enemy.AngleSpeedPerMs,
                moveSpeed: Config.Enemy.MoveSpeedPerMs,
                name: entityName,
                size: Config.Enemy.SizeBase * scale,
                x,
                y,
                scale,
                pointValue: Config.Enemy.PointValueBase + Math.floor(scale * Config.Enemy.PointValueScale),
                regX: Config.Enemy.RegX,
                regY: Config.Enemy.RegY,
            });

            this._entities.push(enemy);
        }
    }

    public spawnPlayer(): void {
        const player = new Player(this._entityContainer);
        this._player = player;
        this.Weapon.value = Weapon.Pistol();

        // Snap the virtual camera target onto the player so we start
        // centred, not tweening in from wherever the menu camera sat.
        this._cameraTarget = { x: player.position.x, y: player.position.y };
        this._viewport.moveCenter(player.position.x, player.position.y);
    }

    public reset(difficulty?: DifficultyName | string): void {
        this._gameLength = 0;
        this._gameSpawnNext = 0;
        this._gameSpawnIndex = 0;
        this._killCount.value = 0;
        this._entities = [];
        this._bullets = [];
        this.Score.value = 0;

        this._player = null;
        this._state.value = "menu";
        this._paused.value = true;
        this.GameScore.value = null;

        this.SwitchDifficulty(difficulty);

        this._effectContainer.removeChildren();
        this._groundContainer.removeChildren();
        this._entityContainer.removeChildren();

        // Stop the camera tween and park the viewport on world centre
        // until the next player spawn resnaps it.
        this._cameraTarget = null;
        this._viewport.moveCenter(Config.World.Width / 2, Config.World.Height / 2);
    }

    public start(difficulty?: DifficultyName | string): void {
        this.reset(difficulty);
        this.spawnPlayer();

        this._state.value = "game";
        this._paused.value = false;

        for (let i = 0; i < this.Difficulty.InitialZombies; i++) {
            this.spawnEnemy("Zombie", true);
        }
    }

    public end(): void {
        if (!this._player) return;

        this.GameScore.value = new Score({
            Points: this.Score.value,
            Time: this._gameLength,
        });

        this.splatterBones(this._player.position.x, this._player.position.y);

        // Stop tweening and leave the camera parked over the player's
        // last position, so Game Over stays framed on where they died.
        this._cameraTarget = null;
        this._viewport.moveCenter(this._player.position.x, this._player.position.y);

        this._player.removeElement();
        this._player = null;

        this.showGameOverOverlay(() => {
            this.GameScore.value?.upload();
            setTimeout(() => {
                if (this._messageGameOver) {
                    this._messageGameOver.style.display = "none";
                    this._messageGameOver.style.opacity = "";
                }
                // Snapshot the score before reset clears it, so we can
                // still animate the end-of-round display after the reset.
                const finalScore = this.GameScore.value;
                this.reset();
                this.GameScore.value = finalScore;
                finalScore?.animate();
            }, Config.GameOver.HoldBeforeResetMs);
        });
    }

    private showGameOverOverlay(onDone: () => void): void {
        const el = this._messageGameOver;
        if (!el) {
            onDone();
            return;
        }
        const fadeMs = Config.GameOver.FadeInMs;
        el.style.opacity = "0";
        el.style.display = "";
        el.style.transition = `opacity ${fadeMs}ms`;
        void el.offsetWidth;
        el.style.opacity = "1";
        const handler = (): void => {
            el.removeEventListener("transitionend", handler);
            onDone();
        };
        el.addEventListener("transitionend", handler);
        setTimeout(handler, fadeMs + 100);
    }

    public stop(): void {
        this.reset();
        this._state.value = "menu";
    }

    public togglePause(): void {
        if (this._state.value === "game") this._paused.value = !this._paused.value;
    }

    public pause(): void {
        if (this._state.value === "game") this._paused.value = true;
    }

    public resume(): void {
        if (this._state.value === "game") this._paused.value = false;
    }

    // -------- Main tick --------

    public tick(d: number): void {
        if (!this._paused.value && this._state.value === "game") {
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

            let nextSpawn = this._difficulty.DelayMax - this._gameSpawnIndex * Config.Respawn.NextSpawnStepMs;
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
        this.HPWidth.value = v;
    }

    public tickPlayer(d: number): void {
        if (this._player) {
            this._player.update(d);
            if ((this._player.HP?.value ?? 0) <= 0) {
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
                    this._gameSpawnNext -= Config.Respawn.KillSpeedBonusMs;
                    scoreIncrease += ent.options.pointValue * this.Difficulty.ScoreFactor;
                    this.splatterBones(
                        ent.position.x,
                        ent.position.y,
                        ent.rotation.angle,
                        (ent.options as { scale?: number }).scale,
                    );
                    if (Math.random() < this.Difficulty.PowerUpChance || this._killCount.value === 0) {
                        this.spawnPowerup(ent.position.x, ent.position.y, this._killCount.value === 0);
                    }
                    this._killCount.value = this._killCount.value + 1;
                } else {
                    const powerUp = entBase as PowerUp;
                    const p = powerUp.options.pointValue * this.Difficulty.ScoreFactor + Math.sqrt(this.Score.value);
                    scoreIncrease += p;
                }

                (ent as Entity | PowerUp).removeElement();
            }
        });

        this.Score.value = this.Score.value + Math.floor(scoreIncrease * scoreTimeFactor);
        this._entities = [...newEntities, ...this._entityQueue];
    }

    public tickGroundEffects(d: number): void {
        this._vanishingEntities.forEach((el) => el.update(d));
        this._vanishingEntities = this._vanishingEntities.filter((v) => !v.isRemoved());
    }

    /**
     * Exponentially tween the virtual camera target toward the player,
     * then snap the viewport centre to the target. Framerate-independent:
     * the fraction of distance closed per tick is 1 - exp(-s*dt), so a
     * 60Hz and a 120Hz display produce identical camera trajectories.
     *
     * Dead-zone: while the player is within Config.Camera.DeadZoneRadius
     * of the current target, the target stays put (camera doesn't jitter
     * for small movements). Set the radius to 0 to always chase.
     */
    public tickCamera(d: number): void {
        if (!this._cameraTarget || !this._player) return;

        const targetX = this._player.position.x;
        const targetY = this._player.position.y;
        const dx = targetX - this._cameraTarget.x;
        const dy = targetY - this._cameraTarget.y;

        const deadZone = Config.Camera.DeadZoneRadius;
        if (deadZone > 0) {
            const distSq = dx * dx + dy * dy;
            if (distSq < deadZone * deadZone) {
                this._viewport.moveCenter(this._cameraTarget.x, this._cameraTarget.y);
                return;
            }
        }

        const alpha = 1 - Math.exp(-Config.Camera.Smoothness * d);
        this._cameraTarget.x += dx * alpha;
        this._cameraTarget.y += dy * alpha;
        this._viewport.moveCenter(this._cameraTarget.x, this._cameraTarget.y);
    }

    public tickWeapon(d: number): void {
        const weapon = this.Weapon.value;
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
            this.Weapon.value = Weapon.Create(name);
        } catch {
            // Unknown weapon name - ignore, matching legacy behaviour
        }
    }

    public EquipRandomWeapon(): void {
        this.Weapon.value = Weapon.Random();
    }

    public SwitchDifficulty(difficulty: DifficultyName | string = "Normal"): void {
        const difficulties = Config.Difficulties as Record<string, IGameDifficulty>;
        if (!difficulties[difficulty]) {
            difficulty = "Normal";
        }
        this._difficulty = difficulties[difficulty]!;
    }
}
