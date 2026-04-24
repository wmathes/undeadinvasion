/**
 * Short-lived sprite (blood splatter, bone pile) that fades out over time.
 *
 * Ported to PixiJS v7. Semantics are unchanged from the CreateJS version;
 * only the display object API and rotation unit differ (Pixi uses radians,
 * the game's internal rotation stays in degrees and is converted at the
 * sprite boundary via Tools.DegToRad).
 */

import { Container, Sprite } from "pixi.js";
import { getTexture } from "./assets";
import { Config } from "./Config";
import type { IVanishingEntitySettings } from "./interfaces";
import { Tools } from "./Tools";

export class VanishingEntity {
    private _sprite: Sprite | undefined;
    private _container: Container | undefined;
    private _settings: IVanishingEntitySettings;
    private _rotationDeg: number = 0;

    constructor(effectName: "Blood" | "Bones", x: number, y: number, c: Container) {
        this._settings = Config.Effects[effectName];
        this._container = c;

        // Pick a random variation image
        const variation = Math.floor(this._settings.Variations * Math.random());
        const path = `Images/${this._settings.Image}_${variation}.png`;
        const texture = getTexture(path);

        const sprite = new Sprite(texture);
        const scale = Math.random() * 0.5 + 0.75;
        sprite.pivot.set(this._settings.Width / 2, this._settings.Height / 2);
        sprite.x = x;
        sprite.y = y;
        sprite.scale.set(scale, scale);
        this._rotationDeg = Math.random() * 360;
        sprite.rotation = Tools.DegToRad(this._rotationDeg);

        this._sprite = sprite;
        this._container.addChild(sprite);
    }

    public get angle(): number {
        return this._rotationDeg;
    }
    public set angle(a: number) {
        this._rotationDeg = a;
        if (this._sprite) this._sprite.rotation = Tools.DegToRad(a);
    }

    public get scale(): number {
        return this._sprite?.scale.x ?? 0;
    }
    public set scale(s: number) {
        if (this._sprite) this._sprite.scale.set(s, s);
    }

    public update(d: number): void {
        if (this._sprite) {
            this._sprite.alpha -= d / this._settings.Duration;
            this.removeIfVanished();
        }
    }

    public fadeByOne(): void {
        if (this._sprite) {
            this._sprite.alpha -= 1 / this._settings.Maximum;
            this.removeIfVanished();
        }
    }

    public removeIfVanished(): void {
        if (this._sprite && this._sprite.alpha <= 0) {
            this.remove();
        }
    }

    public remove(): void {
        if (this._sprite && this._container) {
            this._container.removeChild(this._sprite);
            this._sprite.destroy();
            this._container = undefined;
            this._sprite = undefined;
        }
    }

    public isRemoved(): boolean {
        return !this._sprite;
    }
}
