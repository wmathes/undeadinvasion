/**
 * Short-lived sprite (blood splatter, bone pile) that fades out over time.
 *
 * Ported from the legacy Scripts/VanishingEntity.ts. Identical behaviour.
 */

import "createjs-module";
import { Config } from "./Config";
import type { IVanishingEntitySettings } from "./interfaces";

export class VanishingEntity {
    private _displayObject: createjs.DisplayObject | undefined;
    private _container: createjs.Container | undefined;
    private _settings: IVanishingEntitySettings;

    constructor(effectName: "Blood" | "Bones", x: number, y: number, c: createjs.Container) {
        // Settings lookup
        this._settings = Config.Effects[effectName];

        // Keep container
        this._container = c;

        // Pick random variation
        const path =
            "Images/" +
            this._settings.Image +
            "_" +
            Math.floor(this._settings.Variations * Math.random()) +
            ".png";

        // Sprite
        const ent = new createjs.Bitmap(path);
        const scale = Math.random() * 0.5 + 0.75;
        ent.regX = this._settings.Width / 2;
        ent.regY = this._settings.Height / 2;
        ent.x = x;
        ent.y = y;
        ent.scaleX = scale;
        ent.scaleY = scale;
        ent.rotation = Math.random() * 360;

        this._displayObject = ent;
        this._container.addChild(ent);
    }

    public get angle(): number {
        return this._displayObject?.rotation ?? 0;
    }
    public set angle(a: number) {
        if (this._displayObject) this._displayObject.rotation = a;
    }

    public get scale(): number {
        return this._displayObject?.scaleX ?? 0;
    }
    public set scale(s: number) {
        if (this._displayObject) {
            this._displayObject.scaleX = s;
            this._displayObject.scaleY = s;
        }
    }

    public update(d: number): void {
        if (this._displayObject) {
            const alphaReduction = d / this._settings.Duration;
            this._displayObject.alpha -= alphaReduction;
            this.removeIfVanished();
        }
    }

    public fadeByOne(): void {
        if (this._displayObject) {
            this._displayObject.alpha -= 1 / this._settings.Maximum;
            this.removeIfVanished();
        }
    }

    public removeIfVanished(): void {
        if (this._displayObject && this._displayObject.alpha <= 0) {
            this.remove();
        }
    }

    public remove(): void {
        if (this._displayObject && this._container) {
            this._container.removeChild(this._displayObject);
            this._container = undefined;
            this._displayObject = undefined;
        }
    }

    public isRemoved(): boolean {
        return !this._displayObject;
    }
}
