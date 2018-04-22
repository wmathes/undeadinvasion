

/// <reference path="../app.ts" />


class VanishingEntity {

    private _displayObject: createjs.DisplayObject;
    private _container: createjs.Container;
    private _settings: IVanishingEntitySettings;

    constructor(effectName: string, x: number, y: number, c: createjs.Container) {
        // Get Settings from Config Object
        this._settings = Config.Effects[effectName];

        // Ref Container
        this._container = c;

        // Get Random Image
        var path = "Images/" + this._settings.Image + "_" + Math.floor(this._settings.Variations * Math.random()) + ".png";

        // Create Sprite
        var ent = new createjs.Bitmap(path);
        var scale = (Math.random() * 0.5) + 0.75;
        ent.regX = this._settings.Width / 2;
        ent.regY = this._settings.Height / 2;
        ent.x = x;
        ent.y = y;
        ent.scaleX = scale;
        ent.scaleY = scale;
        ent.rotation = Math.random() * 360;

        // Save ref and add to stage
        this._displayObject = ent;
        this._container.addChild(ent);
    }

    public get angle(): number {
        return this._displayObject.rotation;
    }
    public set angle(a: number) {
        this._displayObject.rotation = a;
    }

    public set scale(s: number) {
        this._displayObject.scaleX = s;
        this._displayObject.scaleY = s;
    }
    public get scale(): number {
        return this._displayObject.scaleX;
    }

    public update(d: number) {
        if (this._displayObject) {
            var alphaReduction = d / this._settings.Duration;
            this._displayObject.alpha -= alphaReduction;
            this.removeIfVanished();
        }
    }

    public fadeByOne() {
        if (this._displayObject) {
            this._displayObject.alpha -= 1 / this._settings.Maximum;
            this.removeIfVanished();
        }
    }

    public removeIfVanished() {
        if (this._displayObject && this._displayObject.alpha <= 0) {
            this.remove();
        }
    }

    public remove() {
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
 