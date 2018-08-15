/// <reference path="Scripts/Game.ts" />
/// <reference path="Scripts/Actions.ts" />

module UndeadInvasion {
    export module Data {
        export class SpriteSheetData {
            public static Player(): any {
                return {
                    // DEFINING FRAMERATE:
                    // this specifies the framerate that will be set on the SpriteSheet. See Spritesheet.framerate
                    // for more information.
                    framerate: 4,

                    // DEFINING IMAGES:
                    images: ["Images/player_run.png"],

                    // DEFINING FRAMES:
                    frames: { width: 35, height: 30, count: 13, regX: 0, regY: 0 },

                    // DEFINING ANIMATIONS:
                    animations: {
                        // start, end, next, speed
                        run: [0, 12]
                    }
                };
            }

            public static Zombie(variation: string): any {
                return {
                    // DEFINING FRAMERATE:
                    // this specifies the framerate that will be set on the SpriteSheet. See Spritesheet.framerate
                    // for more information.
                    framerate: 4,

                    // DEFINING IMAGES:
                    images: ["Images/zombie_" + variation + ".png"],

                    // DEFINING FRAMES:
                    frames: { width: 35, height: 29, count: 16, regX: 0, regY: 0 },

                    // DEFINING ANIMATIONS:
                    animations: {
                        // start, end, next, speed
                        run: [0, 15]
                    }
                };
            }
        }
        export class SpriteSheets {
            // Totally Random
            private static _zombie: createjs.SpriteSheet; 
            public static Zombie(): createjs.SpriteSheet {
                var r = Math.random();
                if (r < 0.33) {
                    return UndeadInvasion.Data.SpriteSheets.ZombieBlue();
                }
                else if (r < 0.66) {
                    return UndeadInvasion.Data.SpriteSheets.ZombieRed();
                }
                else {
                    return UndeadInvasion.Data.SpriteSheets.ZombieYellow();
                }
            }
            // Variations
            private static _zombieBlue: createjs.SpriteSheet;
            public static ZombieBlue(): createjs.SpriteSheet {
                this._zombieBlue = this._zombieBlue || new createjs.SpriteSheet(SpriteSheetData.Zombie("blue"));
                return this._zombieBlue;
            }
            private static _zombieRed: createjs.SpriteSheet;
            public static ZombieRed(): createjs.SpriteSheet {
                this._zombieRed = this._zombieRed || new createjs.SpriteSheet(SpriteSheetData.Zombie("red"));
                return this._zombieRed;
            }
            private static _zombieYellow: createjs.SpriteSheet;
            public static ZombieYellow(): createjs.SpriteSheet {
                this._zombieYellow = this._zombieYellow || new createjs.SpriteSheet(SpriteSheetData.Zombie("yellow"));
                return this._zombieYellow;
            }



            private static _player: createjs.SpriteSheet;
            public static Player(): createjs.SpriteSheet {
                this._player = this._player || new createjs.SpriteSheet(SpriteSheetData.Player());
                return this._player;
            }
        }
    }
}

module Core {
    export class Rotation {

        constructor(private _angle: number = 0) { }

        public get angle(): number {
            return this._angle;
        }

        public set angle(v: number) {
            this._angle = v >= 360 ? v % 360 : v;
        } 
    }

    export class Position {

        constructor(
            private _x: number = 0,
            private _y: number = 0) {
        }

        public get x(): number {
            return this._x;
        }
        public get y(): number {
            return this._y;
        }

        public set x(v: number) {
            this._x = v;
        }
        public set y(v: number) {
            this._y = v;
        }

        public overLoop(ox: number, oy: number, mx: number, my: number) {
            this._x = Tools.GetOverLoopValue(this._x, ox, -mx, mx);
            this._y = Tools.GetOverLoopValue(this._y, oy, -my, my);
        }

        public crop(maxX: number, maxY: number, minX: number = 0, minY: number = 0): void {
            if (this._x < minX)
                this._x = minX;
            else if (this._x > maxX)
                this._x = maxX;

            if (this._y < minY)
                this._y = minY;
            else if (this._y > maxY)
                this._y = maxY;
        }

        public clone(): Core.Position {
            return new Core.Position(this.x, this.y);
        }

        public displaceDirection(distance: number, angle: number): Core.Position {
            if (distance && angle) {
                var convertedAngle = (angle / 360) * (Math.PI * 2);
                this.y -= distance * Math.sin(convertedAngle);
                this.x -= distance * Math.cos(convertedAngle);
            }
            return this;
        }
    }

    export interface IScore {
        Points: number;
        Time: number;
    }

    export class Score {
        public Time: KnockoutObservable<string> = ko.observable("n/a");
        public Score: KnockoutObservable<string> = ko.observable("0");
        public ScaleTransform: KnockoutObservable<string> = ko.observable("scale(0,0)");

        private _points: number = 0;
        private _sizeIncrease: number = 0;

        private _countTime: number = 0;
        private _countDelay: number = 0;
        private _countTotal: number = 0;
        private _countInterval: number = 0;

        constructor(s: IScore) {
            this._points = s.Points;
            var seconds: number = Math.floor((s.Time / 1000) % 60);
            var minutes: number = Math.floor(((s.Time / 1000) - seconds) / 60);
            this.Time(minutes + ":" + ((seconds < 10) ? ("0" + seconds) : <string><any>seconds));

            //       100 -> 10
            //    10.000 -> 100
            // 1.000.000 -> 1000
            this._sizeIncrease = (Math.sqrt(s.Points) / 2000);
            this._countTotal = 1000 + (Math.sqrt(s.Points / 2) * 5);
            if (this._countTotal > 10000) this._countTotal = 10000;
            this._countDelay = 50;            
        }

        upload() {
            if (window["kongregate"]) {
                kongregate["stats"].submit("HighScore", Math.round(this._points));
            }
        }

        animate() {
            if (!this._countInterval) {
                this._countTime = 0;
                this._countInterval = setInterval(() => {
                    this.update(this._countDelay);
                }, this._countDelay);
            }
        }

        update(d: number) {
            if (this._countTime >= this._countTotal) {
                clearInterval(this._countInterval);
                this._countInterval = undefined;
            }
            else {
                // IncreaseCrop time
                this._countTime += d;
                if (this._countTime > this._countTotal) this._countTime = this._countTotal;

                // Display Score
                var perc = this._countTime / this._countTotal;
                this.Score(Math.round(this._points * perc).format());

                // Update Scale
                var scale = 1 + (this._sizeIncrease * perc);
                this.ScaleTransform("scale(" + scale + "," + scale + ")"); 
            }

        }

    }

    export class Entity {
        private _displayElement: createjs.DisplayObject;
        public get DisplayObject(): createjs.DisplayObject { return this._displayElement; }

        private _action: IEntityAction;
        public get Action(): IEntityAction { return this._action; }

        public hp: number = 100;
        public hpMax: number = 100;

        public HP: KnockoutObservable<number>;
        public HPMax: KnockoutObservable<number>;

        public guid: string = "";

        public position: Position = new Core.Position();
        public rotation: Rotation = new Core.Rotation();

        private _deathTime: number = 0;
        public _spawning: boolean = true;

        public options: IEnemyOptions;
        
        constructor(private _container: createjs.Container, entityOptions: IEnemyOptions) {
            
            // Create Options
            entityOptions = entityOptions || <any>{};
            this.options = entityOptions;

            // Rotate Randomly
            this.rotation.angle = Math.random() * 360;

            // Position at Option value... or random
            this.position.x = entityOptions.x || Math.random() * Config.Game.Width;
            this.position.y = entityOptions.y || Math.random() * Config.Game.Height;

            // Create and update Sprite
            this.createElement();         
            this.updateDisplayElement();

            // Set Health
            var hp = Math.floor((50 + (Math.random() * 100)) * game.Difficulty.EnemyHealthFactor);
            this.hp = hp;
            this.hpMax = hp;
            
            // Set Basic Action
            this._action = new Actions.IdleAction(this);

        }

        public setAction(action: IEntityAction) {
            this._action = action;
        }

        public addHealth(amount: number, splatterHealth: boolean = false) {
            if (amount > 0 && this.hp < this.hpMax) {
                this.hp = (amount + this.hp > this.hpMax) ? this.hpMax : this.hp + amount;

                // Update Observable if existant
                if (this.HP) {
                    this.HP(this.hp);
                }

                if (splatterHealth) {
                    // TODO: Splatter Health
                }
            }
        }

        public addDamage(amount: number, splatterBlood: boolean = true) {
            
            if (amount > 0) {

                // Crop Amount
                amount = (amount > this.hp) ? this.hp : amount;

                // Still doing damage?
                if (amount > 0) {

                    // Reduce Hitpoints
                    this.hp -= amount;

                    // Splatter Blood if hit...
                    for (var i = 0; i < amount; i += 40) {
                        // Determin Random angle/distance
                        var randomAngle = Math.random() * (Math.PI * 2);
                        var randomDistance = Math.random() * 0.6 * this.options.size;

                        // Calculate Position
                        var y = this.position.y + (randomDistance * Math.sin(randomAngle));
                        var x = this.position.x + (randomDistance * Math.cos(randomAngle));

                        // Issue Splattering!
                        game.splatterBlood(x, y);
                    }

                    // Update Observable if existant
                    if (this.HP) {
                        this.HP(this.hp);
                    }
                }
            }
        }

        public hasDied(): boolean {
            return (this.hp <= 0 && this._deathTime > 60);
        }

        public updateDisplayElement() {

            if (this._displayElement) {

                // Update Rotation
                this._displayElement.rotation = this.rotation.angle % 360;

                // Update Position
                this._displayElement.x = this.position.x;
                this._displayElement.y = this.position.y;
            }
        }

        public removeElement() {
            if (this._displayElement) {
                this._container.removeChild(this._displayElement);
                this._container = undefined;
                this._displayElement = undefined;
            }
        }

        private createElement() {

            if (this._container && !this._displayElement) {

                var d = new createjs.Sprite(UndeadInvasion.Data.SpriteSheets[this.options.name](), "run");
                d.alpha = 0;   
                d.regX = this.options.regX;
                d.regY = this.options.regY;
                d.x = this.position.x;
                d.y = this.position.y;
                this._displayElement = d;
                this._container.addChild(d);
            }
        }

        public canAttack(position: Position): boolean {
            if (Tools.GetDistance(position, this.position) < (this.options.size * 0.8)) {
                return Math.abs(Tools.GetAngleOffsetByPosition(this.position, position, this.rotation)) < 90;
            }
            else return false;
        }

        public isAttacking: boolean = false;
        public lastAttack: number = 0;

        public updateAttack(d: number) {

            this.lastAttack += d;

            if (this.isAttacking && this.lastAttack > 800) {

                this.lastAttack = 0;
                this.attack();

            }
        }

        public attack() {
            if (game.Player) {
                // Change Animation State


                // Change Attack Handle
                var dmg = Math.round((6 + (Math.random() * 2)) * game.Difficulty.EnemyDamageFactor);
                console.log("Dealing ", dmg, " damage to Player!");
                game.Player.addDamage(dmg);

                //game.Effects.showDamage(dmg);
            }
        }

        public update(delta: number) {  

            // Spawning
            if (this._spawning) {

                // Fade in and finishing spawning when fully visible
                this._displayElement.alpha += 0.025;
                if (this._displayElement.alpha >= 1) {
                    this._spawning = false;
                }
            }

            // Alive
            if (this.hp > 0) {

                // Compute Behaviour 
                this._action.update(delta);

                // Attack if attacking
                this.updateAttack(delta);

                // Overloop Map Borders
                this.position.overLoop(Config.Game.Width, Config.Game.Height, 40, 40);

                // Update Display Object
                this.updateDisplayElement();
            }
            // Dieing
            else {

                // Increase Death Timer
                this._deathTime += delta;
            }
        } 

        public face(position: Position, maxAngle: number) {
            
            // Get Angle to Target
            var angle = Tools.GetAngle(this.position, position);

            // Get Angle Offset from Current
            var angleOffset = Core.Tools.GetAngleOffset(angle, this.rotation.angle);

            // Crop?
            if (angleOffset > 0 && angleOffset > maxAngle) {
                angleOffset = maxAngle;
            }
            else if (angleOffset < 0 && angleOffset < -maxAngle) {
                angleOffset = -maxAngle;
            }

            // Apply (remaining) offset
            this.rotation.angle += angleOffset;
        }

        public moveForward(distance: number) {
            if (distance) {
                var convertedAngle = (this.rotation.angle / 360) * (Math.PI * 2);
                this.position.y -= distance * Math.sin(convertedAngle);
                this.position.x -= distance * Math.cos(convertedAngle);
            }
        }

    }

    export class Tools {
        public static GetAngleOffsetByPosition(from: Core.Position, to: Core.Position, initialRotation: Core.Rotation): number {
            var angleToTarget = this.GetAngle(from, to);
            return this.GetAngleOffset(angleToTarget, initialRotation.angle, 360);
        }

        public static GetAngleOffset(a: number, b: number, base: number = 360): number {

            // Calculate Distance
            var r = (a - b) % base;
            if (r > base / 2) {
                r -= base;
            }
            else if (r < -base / 2) {
                r += base;
            }

            // Return
            return r;
        }

        public static GetAngleDistance(a: number, b: number, base: number = 360): number {
            
            // Crop Values
            a = (a >= base) ? a % base : a;
            b = (b >= base) ? b % base : b;

            // Calculate Distance
            var r = Math.abs(a - b);
            if (r > base / 2) {
                r = base - r;
            }

            // Return Value
            return r;
        }

        // Nach Links    0
        // Nach Oben    90
        // Nach Rechts 180
        // Nach Unten  270
        public static GetAngle(from: Core.Position, to: Core.Position): number {
            var angle = Math.atan2(
                from.y - to.y,
                from.x - to.x);

            angle = (angle * (180 / Math.PI));
              
            if (angle < 0) angle += 360;

            return angle; 
        }

        public static GetDistance(from: Core.Position, to: Core.Position): number {
            var dx = from.x - to.x;
            var dy = from.y - to.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        }

        public static GetOverLoopValue(value: number, max: number, min: number, thresh: number): number {

            if (value > max + thresh) {
                return min;
            }
            else if (value < min - thresh) {
                return max;
            }
            else return value;
        }
    }

    export class Player extends Entity {

        constructor(container: createjs.Container) {
            super(container, {
                size: 36,
                moveSpeed: 90 / 1000,
                name: "Player",
                regX: 18,
                regY: 15,
                pointValue: 0,
                scale: 1,
                x: Config.Game.Width / 2,
                y: Config.Game.Height / 2
            });

            this.hp = 100;
            this.hpMax = 100;
            this.HP = ko.observable(100);
            this.HPMax = ko.observable(100);

            console.log("Player created at", this.position.x, this.position.y);
        }

        public update(d: number) {

            // Spawning
            if (this._spawning) {

                // Fade in and finishing spawning when fully visible
                this.DisplayObject.alpha += 0.025;
                if (this.DisplayObject.alpha >= 1) {
                    this._spawning = false;
                }
            }

            // Update Facing
            this.rotation.angle = Core.Tools.GetAngle(this.position, game.Input.CursorPosition);

            // Calc Max Run Distance by Time
            var distance = this.options.moveSpeed * d;
            var distanceDiagonal = distance * 0.707;

            // HelperFunc
            var getAngleFactor = (directionAngle: number): number => {
                var angleDistance = Core.Tools.GetAngleOffset(this.rotation.angle, directionAngle, 360);
                var angleFactor = 1 - ((Math.abs(angleDistance) / 180) * 0.4);
                return angleFactor;
            };
            var runspeedFactor: number = 1;

            // Move UPish...
            if (game.Input.Up.Clicked && !game.Input.Down.Clicked) {
                // UP-LEFT
                if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(45);
                    this.position.y -= (runspeedFactor * distanceDiagonal);
                    this.position.x -= (runspeedFactor * distanceDiagonal);
                }
                // UP-RIGHT
                else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(135);
                    this.position.y -= (runspeedFactor * distanceDiagonal);
                    this.position.x += (runspeedFactor * distanceDiagonal);
                }
                // UP
                else {
                    runspeedFactor = getAngleFactor(90);
                    this.position.y -= (runspeedFactor * distance);
                }
            }
            // Move DOWNish...
            else if (!game.Input.Up.Clicked && game.Input.Down.Clicked) {
                // DOWN-LEFT
                if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(315);
                    this.position.y += (runspeedFactor * distanceDiagonal);
                    this.position.x -= (runspeedFactor * distanceDiagonal);
                }
                // DOWN-RIGHT
                else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(-135);
                    this.position.y += (runspeedFactor * distanceDiagonal);
                    this.position.x += (runspeedFactor * distanceDiagonal);
                }
                // DOWN
                else {
                    runspeedFactor = getAngleFactor(-90);
                    this.position.y += (runspeedFactor * distance);
                }
            }
            // RIGHT
            else if (game.Input.Right.Clicked && !game.Input.Left.Clicked) {
                runspeedFactor = getAngleFactor(180);
                this.position.x += (runspeedFactor * distance);
            }
            // LEFT
            else if (!game.Input.Right.Clicked && game.Input.Left.Clicked) {
                runspeedFactor = getAngleFactor(0);
                this.position.x -= (runspeedFactor * distance);
            }

            // Crop
            this.position.crop(Config.Game.Width - 20, Config.Game.Height - 20, 20, 20);

            // Update Visuals
            this.updateDisplayElement();
        } 
    }



    export class PowerUp {

        public static GetRandom(container: any, x: number, y: number, forceWeapon: boolean = false): Core.PowerUp {

            var options: IPowerUpOptions = {
                x: x,
                y: y,
                pointValue: 100
            };
            var rnd = Math.random();
            if (forceWeapon || rnd < 0.5) {
                return new Core.RandomWeaponPowerUp(container, options);
            }
            else {
                return new Core.HealPowerUp(container, options);
            }
        }


        private _displayElement: createjs.DisplayObject;
        public get DisplayObject(): createjs.DisplayObject { return this._displayElement; }

        private _lifeTime: number = 0;
        private _lifeTimeMax: number = 0;

        public position: Position = new Core.Position();

        public _spawning: boolean = true;

        public _taken: boolean = false;

        public options: IPowerUpOptions;

        constructor(private _container: createjs.Container, options: IPowerUpOptions, imagePath: string) {

            // LifeTime
            this._lifeTimeMax = game.Difficulty.PowerUpLifetime;

            // Create Options
            this.options = options;

            // Position at Option value... or random
            this.position.x = this.options.x || Math.random() * Config.Game.Width;
            this.position.y = this.options.y || Math.random() * Config.Game.Height;

            // Create and update Sprite
            this.createElement(imagePath);

            console.log("POWER UP AT ", this.position.x, this.position.y);
        }

        public baseTake() {
            if (!this._taken) {
                console.log("Power up TAKEN");
                this._taken = true;

                this.take();
            }
        }

        public take() {
            console.log("OVERWRITE ME");
        }

        public removeElement() {
            if (this._displayElement) {
                this._container.removeChild(this._displayElement);
                this._container = undefined;
                this._displayElement = undefined;
            }
        }

        private createElement(imagePath: string) {

            if (this._container && !this._displayElement) {

                var d = new createjs.Bitmap("Images/" + imagePath);
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
            return !this._taken && (Tools.GetDistance(position, this.position) < 28);
        }

        public update(delta: number) {

            // Take if takeable!
            if (game.Player && this.canBeTaken(game.Player.position)) {
                this.baseTake();
            }

            // Update Alpha
            if (this._displayElement) {
                var alpha: number = 1.0;
                if (this._lifeTime < 200) {
                    alpha = this._lifeTime / 200;
                }
                else if (this._lifeTime > this._lifeTimeMax - 1600) {
                    alpha = 1 - ((this._lifeTime - (this._lifeTimeMax - 1600)) / 1600);
                }
                this._displayElement.alpha = alpha;
            }

            // Increase lifetime
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
        public take() {
            game.Player.addHealth(25, false);
        }
    }
    export class RandomWeaponPowerUp extends PowerUp {

        constructor(container: createjs.Container, options: IPowerUpOptions) {
            super(container, options, "Microchip.png");
        }
        public take() {
            game.EquipRandomWeapon();
        }
    }
}

let game: UndeadInvasion.Game;

$(() => {
    // Instantiate Game!
    game = new UndeadInvasion.Game("gameDiv");
});
