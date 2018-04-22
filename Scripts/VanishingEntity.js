/// <reference path="../app.ts" />
var VanishingEntity = (function () {
    function VanishingEntity(effectName, x, y, c) {
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
    Object.defineProperty(VanishingEntity.prototype, "angle", {
        get: function () {
            return this._displayObject.rotation;
        },
        set: function (a) {
            this._displayObject.rotation = a;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(VanishingEntity.prototype, "scale", {
        get: function () {
            return this._displayObject.scaleX;
        },
        set: function (s) {
            this._displayObject.scaleX = s;
            this._displayObject.scaleY = s;
        },
        enumerable: true,
        configurable: true
    });

    VanishingEntity.prototype.update = function (d) {
        if (this._displayObject) {
            var alphaReduction = d / this._settings.Duration;
            this._displayObject.alpha -= alphaReduction;
            this.removeIfVanished();
        }
    };

    VanishingEntity.prototype.fadeByOne = function () {
        if (this._displayObject) {
            this._displayObject.alpha -= 1 / this._settings.Maximum;
            this.removeIfVanished();
        }
    };

    VanishingEntity.prototype.removeIfVanished = function () {
        if (this._displayObject && this._displayObject.alpha <= 0) {
            this.remove();
        }
    };

    VanishingEntity.prototype.remove = function () {
        if (this._displayObject && this._container) {
            this._container.removeChild(this._displayObject);
            this._container = undefined;
            this._displayObject = undefined;
        }
    };

    VanishingEntity.prototype.isRemoved = function () {
        return !this._displayObject;
    };
    return VanishingEntity;
})();
//# sourceMappingURL=VanishingEntity.js.map
