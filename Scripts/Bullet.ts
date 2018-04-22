

/// <reference path="../app.ts" />


class Bullet {

    private _displayObject: createjs.DisplayObject;
    private _displayObjectTrail: createjs.Shape;
    private _container: createjs.Container;
    private _settings: IBullet;
    private _hitList: Core.Entity[] = [];

    private _origin: Core.Position;
    private _position: Core.Position;
    private _rotation: Core.Rotation;
    private _lifeTime: number;

    private _remainingDamage: number;

    constructor(options: IBullet, x: number, y: number, baseAngle: number, c: createjs.Container) {

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

    public get angle(): number {
        return this._rotation.angle;
    }
    public set angle(a: number) {
        this._rotation.angle = a;
        if (this._displayObject) {
            this._displayObject.rotation = a;
        }
    }

    public set scale(s: number) {
        this._displayObject.scaleX = s;
        this._displayObject.scaleY = s;
    }
    public get scale(): number {
        return this._displayObject.scaleX;
    }
     
    public update(d: number) {

        // Reduce LifeTIme
        this._lifeTime -= d;

        // Bullet
        if (this._displayObject) {

            if (this._lifeTime > 0) {

                // Fade?
                if (this._settings.FadeFactor != 1) {
                    this._displayObject.alpha *= 1 - ((d / 1000) * this._settings.FadeFactor);
                }

                // Scale?
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
    }

    public checkCollision() {
        game.Entities.each((entity: Core.Entity) => {

            // If still damage remaining and target is alive?
            if (this._remainingDamage > 0 && !entity.hasDied() && this._hitList.indexOf(entity) == -1) {

                // Get Distance
                var distance = Core.Tools.GetDistance(new Core.Position(this._displayObject.x, this._displayObject.y), entity.position);
                
                // Close enough?
                if (distance < (this._settings.Size + (entity.options.size * 0.4))) {
                    
                    // Hit!
                    this.hitEntity(entity);            
                }
            }
            return true;
        });
    }

    public hitEntity(entity: Core.Entity) {

        // Calculate and deal damage
        var dmg = this._remainingDamage < this._settings.Damage ? this._remainingDamage : this._settings.Damage;
        entity.addDamage(dmg);
        this._remainingDamage -= dmg;

        // Add Entity to Hitlist
        this._hitList.push(entity);
    }

    public moveForward(distance: number) {
        if (distance) {
            var convertedAngle = (this.angle / 360) * (Math.PI * 2);

            // Update Position
            this._position.y -= distance * Math.sin(convertedAngle);
            this._position.x -= distance * Math.cos(convertedAngle);

            // Update Visuals if existant
            if (this._displayObject) {
                this._displayObject.x = this._position.x;
                this._displayObject.y = this._position.y;
            }
        }
    }

    public removeIfVanished() {
        if (this._displayObject && (this._displayObject.alpha <= 0 || this._lifeTime <= 0 || this.isOutOfBounds() || this._remainingDamage <= 0)) {
            this.remove();
        }
    }

    public remove() {
        if (this._displayObject && this._container) {
            this._container.removeChild(this._displayObject);
            this._displayObject = undefined;
        }
        if (this._displayObjectTrail && this._container) {
            this._container.removeChild(this._displayObjectTrail);
            this._displayObjectTrail
        }
        if (this._container) {
            this._container = undefined;
        }
    }

    public isOutOfBounds(): boolean {
        return (this._displayObject.x < -20 || this._displayObject.y < -20 || this._displayObject.x > Config.Game.Width + 20 || this._displayObject.y > Config.Game.Height + 20);
    }

    public isRemoved(): boolean {
        return !this._displayObject;
    }

}
