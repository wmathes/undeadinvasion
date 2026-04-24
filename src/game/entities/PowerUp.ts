/**
 * Ground-pickup power-ups (health crates, weapon microchips).
 *
 * Ported to PixiJS v7. The Bitmap -> Sprite swap is straightforward; the
 * spawn fade, pickup radius, and expiry logic are unchanged.
 */

import { Container, Sprite } from "pixi.js";
import { getTexture } from "../assets";
import { Config } from "../Config";
import type { IEntityBase, IPowerUpOptions } from "../interfaces";
import { Position } from "../Position";
import { game } from "../state";
import { Tools } from "../Tools";

export class PowerUp implements IEntityBase {
    public static GetRandom(container: Container, x: number, y: number, forceWeapon: boolean = false): PowerUp {
        const options: IPowerUpOptions = { x, y, pointValue: Config.PowerUp.PointValue };
        const rnd = Math.random();
        if (forceWeapon || rnd < 0.5) {
            return new RandomWeaponPowerUp(container, options);
        } else {
            return new HealPowerUp(container, options);
        }
    }

    private _sprite: Sprite | undefined;
    public get DisplayObject(): Sprite | undefined {
        return this._sprite;
    }

    private _lifeTime: number = 0;
    private _lifeTimeMax: number = 0;

    public position: Position = new Position();
    public _spawning: boolean = true;
    public _taken: boolean = false;
    public options: IPowerUpOptions;

    private _container: Container | undefined;

    constructor(container: Container, options: IPowerUpOptions, imagePath: string) {
        this._container = container;
        this._lifeTimeMax = game.Difficulty.PowerUpLifetime;
        this.options = options;

        this.position.x = this.options.x ?? Math.random() * Config.World.Width;
        this.position.y = this.options.y ?? Math.random() * Config.World.Height;

        this.createElement(imagePath);
    }

    public baseTake(): void {
        if (!this._taken) {
            this._taken = true;
            this.take();
        }
    }

    public take(): void {
        // Overridden by subclasses
    }

    public removeElement(): void {
        if (this._sprite && this._container) {
            this._container.removeChild(this._sprite);
            this._sprite.destroy();
            this._container = undefined;
            this._sprite = undefined;
        }
    }

    private createElement(imagePath: string): void {
        if (this._container && !this._sprite) {
            const texture = getTexture(`Images/${imagePath}`);
            const sprite = new Sprite(texture);
            sprite.alpha = 0;
            sprite.pivot.set(Config.PowerUp.RegX, Config.PowerUp.RegY);
            sprite.x = this.position.x;
            sprite.y = this.position.y;
            this._sprite = sprite;
            this._container.addChild(sprite);
        }
    }

    public canBeTaken(position: Position): boolean {
        return !this._taken && Tools.GetDistance(position, this.position) < Config.PowerUp.PickupRadius;
    }

    public update(delta: number): void {
        if (game.Player && this.canBeTaken(game.Player.position)) {
            this.baseTake();
        }

        if (this._sprite) {
            let alpha = 1.0;
            const fadeIn = Config.PowerUp.FadeInMs;
            const fadeOut = Config.PowerUp.FadeOutMs;
            if (this._lifeTime < fadeIn) {
                alpha = this._lifeTime / fadeIn;
            } else if (this._lifeTime > this._lifeTimeMax - fadeOut) {
                alpha = 1 - (this._lifeTime - (this._lifeTimeMax - fadeOut)) / fadeOut;
            }
            this._sprite.alpha = alpha;
        }

        this._lifeTime += delta;
    }

    public hasDied(): boolean {
        return this._taken || this._lifeTime >= this._lifeTimeMax;
    }
}

export class HealPowerUp extends PowerUp {
    constructor(container: Container, options: IPowerUpOptions) {
        super(container, options, "health.png");
    }
    public override take(): void {
        game.Player?.addHealth(Config.PowerUp.HealAmount, false);
    }
}

export class RandomWeaponPowerUp extends PowerUp {
    constructor(container: Container, options: IPowerUpOptions) {
        super(container, options, "Microchip.png");
    }
    public override take(): void {
        game.EquipRandomWeapon();
    }
}
