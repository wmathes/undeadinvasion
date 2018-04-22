/// <reference path="../app.ts" />
var Bullet = (function () {
    function Bullet(options, x, y, baseAngle, c) {
        this._hitList = [];
        // Default Values
        options.TrailColor = options.TrailColor || ["#AAAAAA", "#222222"];
        options.Type = options.Type || "default";
        options.FadeFactor = options.FadeFactor || 1;
        options.ScaleFactor = options.ScaleFactor || 1;
        options.SpeedFactor = options.SpeedFactor || 1;
        options.TrailWidth = options.TrailWidth || 2;

        this._settings = options;

        this._lifeTime = this._settings.LifeTime;

        // Ref Container
        this._container = c;

        // Get Random Image
        var path = "Images/bullet_" + this._settings.Type + ".png";

        // Save Rotation
        this._rotation = new Core.Rotation(this._settings.Angle + baseAngle);

        // Save Position
        this._position = new Core.Position(x, y);

        // Move somewhat forward
        this.moveForward(18);

        // Save modified position as origin
        this._origin = new Core.Position(this._position.x, this._position.y);

        // Create Bullet Sprite
        var ent = new createjs.Bitmap(path);
        ent.regX = 8;
        ent.regY = 8;
        ent.x = this._origin.x;
        ent.y = this._origin.y;
        ent.rotation = this._rotation.angle;

        // Save ref and add to stage
        this._displayObject = ent;

        // Create Trail Shape
        var trail = new createjs.Shape();
        trail.x = 400;
        trail.y = 400;
        this._displayObjectTrail = trail;

        // Add to visible Space
        this._container.addChild(ent);
        this._container.addChild(trail);

        // Settings
        this._remainingDamage = this._settings.DamageMax;
        console.log("Remaining Damage", this._remainingDamage);
    }
    Object.defineProperty(Bullet.prototype, "angle", {
        get: function () {
            return this._rotation.angle;
        },
        set: function (a) {
            this._rotation.angle = a;
            if (this._displayObject) {
                this._displayObject.rotation = a;
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Bullet.prototype, "scale", {
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

    Bullet.prototype.update = function (d) {
        // Reduce LifeTIme
        this._lifeTime -= d;

        if (this._displayObject) {
            if (this._lifeTime > 0) {
                if (this._settings.FadeFactor != 1) {
                    this._displayObject.alpha *= 1 - ((d / 1000) * this._settings.FadeFactor);
                }

                if (this._settings.ScaleFactor != 1) {
                    this._displayObject.scaleX *= Math.sqrt(this._settings.ScaleFactor);
                    this._displayObject.scaleY *= Math.sqrt(this._settings.ScaleFactor);
                }

                // Adjust Speed to ... whatever
                this._settings.Speed *= this._settings.SpeedFactor;

                // Calculate Move Distance and move in small steps for collision
                var move = this._settings.Speed / 1000 * d;
                while (move > 0 && this._remainingDamage > 0) {
                    // Move Forward
                    this.moveForward(move > 15 ? 15 : move);

                    // Check Collision
                    this.checkCollision();

                    // Deduct
                    move -= 15;
                }
            }

            // Try removal...
            this.removeIfVanished();
        }

        if (this._displayObjectTrail) {
            /*this._displayObjectTrail.graphics.clear();
            this._displayObjectTrail.graphics.beginLinearGradientStroke(
            ["#FF0000", "#00FF00"],
            [0, 1],
            this._origin.x,
            this._origin.y,
            this._position.x,
            this._position.y);*/
        }
    };

    Bullet.prototype.checkCollision = function () {
        var _this = this;
        game.Entities.each(function (entity) {
            if (_this._remainingDamage > 0 && !entity.hasDied() && _this._hitList.indexOf(entity) == -1) {
                // Get Distance
                var distance = Core.Tools.GetDistance(new Core.Position(_this._displayObject.x, _this._displayObject.y), entity.position);

                if (distance < (_this._settings.Size + (entity.options.size * 0.4))) {
                    // Hit!
                    _this.hitEntity(entity);
                }
            }
            return true;
        });
    };

    Bullet.prototype.hitEntity = function (entity) {
        // Calculate and deal damage
        var dmg = this._remainingDamage < this._settings.Damage ? this._remainingDamage : this._settings.Damage;
        entity.addDamage(dmg);
        this._remainingDamage -= dmg;

        // Add Entity to Hitlist
        this._hitList.push(entity);
    };

    Bullet.prototype.moveForward = function (distance) {
        if (distance) {
            var convertedAngle = (this.angle / 360) * (Math.PI * 2);

            // Update Position
            this._position.y -= distance * Math.sin(convertedAngle);
            this._position.x -= distance * Math.cos(convertedAngle);

            if (this._displayObject) {
                this._displayObject.x = this._position.x;
                this._displayObject.y = this._position.y;
            }
        }
    };

    Bullet.prototype.removeIfVanished = function () {
        if (this._displayObject && (this._displayObject.alpha <= 0 || this._lifeTime <= 0 || this.isOutOfBounds() || this._remainingDamage <= 0)) {
            this.remove();
        }
    };

    Bullet.prototype.remove = function () {
        if (this._displayObject && this._container) {
            this._container.removeChild(this._displayObject);
            this._displayObject = undefined;
        }
        if (this._displayObjectTrail && this._container) {
            this._container.removeChild(this._displayObjectTrail);
            this._displayObjectTrail;
        }
        if (this._container) {
            this._container = undefined;
        }
    };

    Bullet.prototype.isOutOfBounds = function () {
        return (this._displayObject.x < -20 || this._displayObject.y < -20 || this._displayObject.x > Config.Game.Width + 20 || this._displayObject.y > Config.Game.Height + 20);
    };

    Bullet.prototype.isRemoved = function () {
        return !this._displayObject;
    };
    return Bullet;
})();
//# sourceMappingURL=Bullet.js.map
