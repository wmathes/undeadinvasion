/**
 * Ground-pickup power-ups (health crates, weapon microchips).
 *
 * Ported from Core.PowerUp, Core.HealPowerUp, Core.RandomWeaponPowerUp
 * in the legacy app.ts.
 */

import "createjs-module";
import { Config } from "../Config";
import type { IEntityBase, IPowerUpOptions } from "../interfaces";
import { Position } from "../Position";
import { game } from "../state";
import { Tools } from "../Tools";

export class PowerUp implements IEntityBase {
    public static GetRandom(
        container: createjs.Container,
        x: number,
        y: number,
        forceWeapon: boolean = false,
    ): PowerUp {
        const options: IPowerUpOptions = {
            x,
            y,
            pointValue: 100,
        };
        const rnd = Math.random();
        if (forceWeapon || rnd < 0.5) {
            return new RandomWeaponPowerUp(container, options);
        } else {
            return new HealPowerUp(container, options);
        }
    }

    private _displayElement: createjs.DisplayObject | undefined;
    public get DisplayObject(): createjs.DisplayObject | undefined {
        return this._displayElement;
    }

    private _lifeTime: number = 0;
    private _lifeTimeMax: number = 0;

    public position: Position = new Position();
    public _spawning: boolean = true;
    public _taken: boolean = false;
    public options: IPowerUpOptions;

    private _container: createjs.Container | undefined;

    constructor(container: createjs.Container, options: IPowerUpOptions, imagePath: string) {
        this._container = container;
        this._lifeTimeMax = game.Difficulty.PowerUpLifetime;
        this.options = options;

        this.position.x = this.options.x ?? Math.random() * Config.Game.Width;
        this.position.y = this.options.y ?? Math.random() * Config.Game.Height;

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
        if (this._displayElement && this._container) {
            this._container.removeChild(this._displayElement);
            this._container = undefined;
            this._displayElement = undefined;
        }
    }

    private createElement(imagePath: string): void {
        if (this._container && !this._displayElement) {
            const d = new createjs.Bitmap("Images/" + imagePath);
            d.alpha = 0;
            d.regX = 24;
            d.regY = 15;
            d.x = this.position.x;
            d.y = this.position.y;
            this._displayElement = d;
            this._container.addChild(d);
        }
    }

    public canBeTaken(position: Position): boolean {
        return !this._taken && Tools.GetDistance(position, this.position) < 28;
    }

    public update(delta: number): void {
        if (game.Player && this.canBeTaken(game.Player.position)) {
            this.baseTake();
        }

        if (this._displayElement) {
            let alpha = 1.0;
            if (this._lifeTime < 200) {
                alpha = this._lifeTime / 200;
            } else if (this._lifeTime > this._lifeTimeMax - 1600) {
                alpha = 1 - (this._lifeTime - (this._lifeTimeMax - 1600)) / 1600;
            }
            this._displayElement.alpha = alpha;
        }

        this._lifeTime += delta;
    }

    public hasDied(): boolean {
        return this._taken || this._lifeTime >= this._lifeTimeMax;
    }
}

export class HealPowerUp extends PowerUp {
    constructor(container: createjs.Container, options: IPowerUpOptions) {
        super(container, options, "health.png");
    }
    public override take(): void {
        game.Player?.addHealth(25, false);
    }
}

export class RandomWeaponPowerUp extends PowerUp {
    constructor(container: createjs.Container, options: IPowerUpOptions) {
        super(container, options, "Microchip.png");
    }
    public override take(): void {
        game.EquipRandomWeapon();
    }
}
