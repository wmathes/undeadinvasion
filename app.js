/// <reference path="Scripts/Game.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="Scripts/Actions.ts" />
var UndeadInvasion;
(function (UndeadInvasion) {
    (function (Data) {
        var SpriteSheetData = (function () {
            function SpriteSheetData() {
            }
            SpriteSheetData.Player = function () {
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
            };

            SpriteSheetData.Zombie = function (variation) {
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
            };
            return SpriteSheetData;
        })();
        Data.SpriteSheetData = SpriteSheetData;
        var SpriteSheets = (function () {
            function SpriteSheets() {
            }
            SpriteSheets.Zombie = function () {
                var r = Math.random();
                if (r < 0.33) {
                    return UndeadInvasion.Data.SpriteSheets.ZombieBlue();
                } else if (r < 0.66) {
                    return UndeadInvasion.Data.SpriteSheets.ZombieRed();
                } else {
                    return UndeadInvasion.Data.SpriteSheets.ZombieYellow();
                }
            };

            SpriteSheets.ZombieBlue = function () {
                this._zombieBlue = this._zombieBlue || new createjs.SpriteSheet(SpriteSheetData.Zombie("blue"));
                return this._zombieBlue;
            };

            SpriteSheets.ZombieRed = function () {
                this._zombieRed = this._zombieRed || new createjs.SpriteSheet(SpriteSheetData.Zombie("red"));
                return this._zombieRed;
            };

            SpriteSheets.ZombieYellow = function () {
                this._zombieYellow = this._zombieYellow || new createjs.SpriteSheet(SpriteSheetData.Zombie("yellow"));
                return this._zombieYellow;
            };

            SpriteSheets.Player = function () {
                this._player = this._player || new createjs.SpriteSheet(SpriteSheetData.Player());
                return this._player;
            };
            return SpriteSheets;
        })();
        Data.SpriteSheets = SpriteSheets;
    })(UndeadInvasion.Data || (UndeadInvasion.Data = {}));
    var Data = UndeadInvasion.Data;
})(UndeadInvasion || (UndeadInvasion = {}));

var Core;
(function (Core) {
    var Rotation = (function () {
        function Rotation(_angle) {
            if (typeof _angle === "undefined") { _angle = 0; }
            this._angle = _angle;
        }
        Object.defineProperty(Rotation.prototype, "angle", {
            get: function () {
                return this._angle;
            },
            set: function (v) {
                this._angle = v >= 360 ? v % 360 : v;
            },
            enumerable: true,
            configurable: true
        });

        return Rotation;
    })();
    Core.Rotation = Rotation;

    var Position = (function () {
        function Position(_x, _y) {
            if (typeof _x === "undefined") { _x = 0; }
            if (typeof _y === "undefined") { _y = 0; }
            this._x = _x;
            this._y = _y;
        }
        Object.defineProperty(Position.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (v) {
                this._x = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Position.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (v) {
                this._y = v;
            },
            enumerable: true,
            configurable: true
        });


        Position.prototype.overLoop = function (ox, oy, mx, my) {
            this._x = Tools.GetOverLoopValue(this._x, ox, -mx, mx);
            this._y = Tools.GetOverLoopValue(this._y, oy, -my, my);
        };

        Position.prototype.crop = function (maxX, maxY, minX, minY) {
            if (typeof minX === "undefined") { minX = 0; }
            if (typeof minY === "undefined") { minY = 0; }
            if (this._x < minX)
                this._x = minX;
else if (this._x > maxX)
                this._x = maxX;

            if (this._y < minY)
                this._y = minY;
else if (this._y > maxY)
                this._y = maxY;
        };

        Position.prototype.clone = function () {
            return new Core.Position(this.x, this.y);
        };

        Position.prototype.displaceDirection = function (distance, angle) {
            if (distance && angle) {
                var convertedAngle = (angle / 360) * (Math.PI * 2);
                this.y -= distance * Math.sin(convertedAngle);
                this.x -= distance * Math.cos(convertedAngle);
            }
            return this;
        };
        return Position;
    })();
    Core.Position = Position;

    var Score = (function () {
        function Score(s) {
            this.Time = ko.observable("n/a");
            this.Score = ko.observable("0");
            this.ScaleTransform = ko.observable("scale(0,0)");
            this._points = 0;
            this._sizeIncrease = 0;
            this._countTime = 0;
            this._countDelay = 0;
            this._countTotal = 0;
            this._countInterval = 0;
            this._points = s.Points;
            var seconds = Math.floor((s.Time / 1000) % 60);
            var minutes = Math.floor(((s.Time / 1000) - seconds) / 60);
            this.Time(minutes + ":" + ((seconds < 10) ? ("0" + seconds) : seconds));

            //       100 -> 10
            //    10.000 -> 100
            // 1.000.000 -> 1000
            this._sizeIncrease = (Math.sqrt(s.Points) / 2000);
            this._countTotal = 1000 + (Math.sqrt(s.Points / 2) * 5);
            if (this._countTotal > 10000)
                this._countTotal = 10000;
            this._countDelay = 50;
        }
        Score.prototype.upload = function () {
            if (window["kongregate"]) {
                kongregate["stats"].submit("HighScore", Math.round(this._points));
            }
        };

        Score.prototype.animate = function () {
            var _this = this;
            if (!this._countInterval) {
                this._countTime = 0;
                this._countInterval = setInterval(function () {
                    _this.update(_this._countDelay);
                }, this._countDelay);
            }
        };

        Score.prototype.update = function (d) {
            if (this._countTime >= this._countTotal) {
                clearInterval(this._countInterval);
                this._countInterval = undefined;
            } else {
                // IncreaseCrop time
                this._countTime += d;
                if (this._countTime > this._countTotal)
                    this._countTime = this._countTotal;

                // Display Score
                var perc = this._countTime / this._countTotal;
                this.Score(Math.round(this._points * perc).format());

                // Update Scale
                var scale = 1 + (this._sizeIncrease * perc);
                this.ScaleTransform("scale(" + scale + "," + scale + ")");
            }
        };
        return Score;
    })();
    Core.Score = Score;

    var Entity = (function () {
        function Entity(_container, entityOptions) {
            this._container = _container;
            this.hp = 100;
            this.hpMax = 100;
            this.guid = "";
            this.position = new Core.Position();
            this.rotation = new Core.Rotation();
            this._deathTime = 0;
            this._spawning = true;
            this.isAttacking = false;
            this.lastAttack = 0;
            // Create Options
            entityOptions = entityOptions || {};
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
        Object.defineProperty(Entity.prototype, "DisplayObject", {
            get: function () {
                return this._displayElement;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Entity.prototype, "Action", {
            get: function () {
                return this._action;
            },
            enumerable: true,
            configurable: true
        });

        Entity.prototype.setAction = function (action) {
            this._action = action;
        };

        Entity.prototype.addHealth = function (amount, splatterHealth) {
            if (typeof splatterHealth === "undefined") { splatterHealth = false; }
            if (amount > 0 && this.hp < this.hpMax) {
                this.hp = (amount + this.hp > this.hpMax) ? this.hpMax : this.hp + amount;

                if (this.HP) {
                    this.HP(this.hp);
                }

                if (splatterHealth) {
                    // TODO: Splatter Health
                }
            }
        };

        Entity.prototype.addDamage = function (amount, splatterBlood) {
            if (typeof splatterBlood === "undefined") { splatterBlood = true; }
            if (amount > 0) {
                // Crop Amount
                amount = (amount > this.hp) ? this.hp : amount;

                if (amount > 0) {
                    // Reduce Hitpoints
                    this.hp -= amount;

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

                    if (this.HP) {
                        this.HP(this.hp);
                    }
                }
            }
        };

        Entity.prototype.hasDied = function () {
            return (this.hp <= 0 && this._deathTime > 60);
        };

        Entity.prototype.updateDisplayElement = function () {
            if (this._displayElement) {
                // Update Rotation
                this._displayElement.rotation = this.rotation.angle % 360;

                // Update Position
                this._displayElement.x = this.position.x;
                this._displayElement.y = this.position.y;
            }
        };

        Entity.prototype.removeElement = function () {
            if (this._displayElement) {
                this._container.removeChild(this._displayElement);
                this._container = undefined;
                this._displayElement = undefined;
            }
        };

        Entity.prototype.createElement = function () {
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
        };

        Entity.prototype.canAttack = function (position) {
            if (Tools.GetDistance(position, this.position) < (this.options.size * 0.8)) {
                return Math.abs(Tools.GetAngleOffsetByPosition(this.position, position, this.rotation)) < 90;
            } else
                return false;
        };

        Entity.prototype.updateAttack = function (d) {
            this.lastAttack += d;

            if (this.isAttacking && this.lastAttack > 800) {
                this.lastAttack = 0;
                this.attack();
            }
        };

        Entity.prototype.attack = function () {
            if (game.Player) {
                // Change Animation State
                // Change Attack Handle
                var dmg = Math.round((6 + (Math.random() * 2)) * game.Difficulty.EnemyDamageFactor);
                console.log("Dealing ", dmg, " damage to Player!");
                game.Player.addDamage(dmg);
                //game.Effects.showDamage(dmg);
            }
        };

        Entity.prototype.update = function (delta) {
            if (this._spawning) {
                // Fade in and finishing spawning when fully visible
                this._displayElement.alpha += 0.025;
                if (this._displayElement.alpha >= 1) {
                    this._spawning = false;
                }
            }

            if (this.hp > 0) {
                // Compute Behaviour
                this._action.update(delta);

                // Attack if attacking
                this.updateAttack(delta);

                // Overloop Map Borders
                this.position.overLoop(Config.Game.Width, Config.Game.Height, 40, 40);

                // Update Display Object
                this.updateDisplayElement();
            } else {
                // Increase Death Timer
                this._deathTime += delta;
            }
        };

        Entity.prototype.face = function (position, maxAngle) {
            // Get Angle to Target
            var angle = Tools.GetAngle(this.position, position);

            // Get Angle Offset from Current
            var angleOffset = Core.Tools.GetAngleOffset(angle, this.rotation.angle);

            if (angleOffset > 0 && angleOffset > maxAngle) {
                angleOffset = maxAngle;
            } else if (angleOffset < 0 && angleOffset < -maxAngle) {
                angleOffset = -maxAngle;
            }

            // Apply (remaining) offset
            this.rotation.angle += angleOffset;
        };

        Entity.prototype.moveForward = function (distance) {
            if (distance) {
                var convertedAngle = (this.rotation.angle / 360) * (Math.PI * 2);
                this.position.y -= distance * Math.sin(convertedAngle);
                this.position.x -= distance * Math.cos(convertedAngle);
            }
        };
        return Entity;
    })();
    Core.Entity = Entity;

    var Tools = (function () {
        function Tools() {
        }
        Tools.GetAngleOffsetByPosition = function (from, to, initialRotation) {
            var angleToTarget = this.GetAngle(from, to);
            return this.GetAngleOffset(angleToTarget, initialRotation.angle, 360);
        };

        Tools.GetAngleOffset = function (a, b, base) {
            if (typeof base === "undefined") { base = 360; }
            // Calculate Distance
            var r = (a - b) % base;
            if (r > base / 2) {
                r -= base;
            } else if (r < -base / 2) {
                r += base;
            }

            // Return
            return r;
        };

        Tools.GetAngleDistance = function (a, b, base) {
            if (typeof base === "undefined") { base = 360; }
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
        };

        Tools.GetAngle = // Nach Links    0
        // Nach Oben    90
        // Nach Rechts 180
        // Nach Unten  270
        function (from, to) {
            var angle = Math.atan2(from.y - to.y, from.x - to.x);

            angle = (angle * (180 / Math.PI));

            if (angle < 0)
                angle += 360;

            return angle;
        };

        Tools.GetDistance = function (from, to) {
            var dx = from.x - to.x;
            var dy = from.y - to.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        };

        Tools.GetOverLoopValue = function (value, max, min, thresh) {
            if (value > max + thresh) {
                return min;
            } else if (value < min - thresh) {
                return max;
            } else
                return value;
        };
        return Tools;
    })();
    Core.Tools = Tools;

    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(container) {
            _super.call(this, container, {
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
        Player.prototype.update = function (d) {
            var _this = this;
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
            var getAngleFactor = function (directionAngle) {
                var angleDistance = Core.Tools.GetAngleOffset(_this.rotation.angle, directionAngle, 360);
                var angleFactor = 1 - ((Math.abs(angleDistance) / 180) * 0.4);
                return angleFactor;
            };
            var runspeedFactor = 1;

            if (game.Input.Up.Clicked && !game.Input.Down.Clicked) {
                if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(45);
                    this.position.y -= (runspeedFactor * distanceDiagonal);
                    this.position.x -= (runspeedFactor * distanceDiagonal);
                } else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(135);
                    this.position.y -= (runspeedFactor * distanceDiagonal);
                    this.position.x += (runspeedFactor * distanceDiagonal);
                } else {
                    runspeedFactor = getAngleFactor(90);
                    this.position.y -= (runspeedFactor * distance);
                }
            } else if (!game.Input.Up.Clicked && game.Input.Down.Clicked) {
                if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(315);
                    this.position.y += (runspeedFactor * distanceDiagonal);
                    this.position.x -= (runspeedFactor * distanceDiagonal);
                } else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                    runspeedFactor = getAngleFactor(-135);
                    this.position.y += (runspeedFactor * distanceDiagonal);
                    this.position.x += (runspeedFactor * distanceDiagonal);
                } else {
                    runspeedFactor = getAngleFactor(-90);
                    this.position.y += (runspeedFactor * distance);
                }
            } else if (game.Input.Right.Clicked && !game.Input.Left.Clicked) {
                runspeedFactor = getAngleFactor(180);
                this.position.x += (runspeedFactor * distance);
            } else if (!game.Input.Right.Clicked && game.Input.Left.Clicked) {
                runspeedFactor = getAngleFactor(0);
                this.position.x -= (runspeedFactor * distance);
            }

            // Crop
            this.position.crop(Config.Game.Width - 20, Config.Game.Height - 20, 20, 20);

            // Update Visuals
            this.updateDisplayElement();
        };
        return Player;
    })(Entity);
    Core.Player = Player;

    var PowerUp = (function () {
        function PowerUp(_container, options, imagePath) {
            this._container = _container;
            this._lifeTime = 0;
            this._lifeTimeMax = 0;
            this.position = new Core.Position();
            this._spawning = true;
            this._taken = false;
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
        PowerUp.GetRandom = function (container, x, y, forceWeapon) {
            if (typeof forceWeapon === "undefined") { forceWeapon = false; }
            var options = {
                x: x,
                y: y,
                pointValue: 100
            };
            var rnd = Math.random();
            if (forceWeapon || rnd < 0.5) {
                return new Core.RandomWeaponPowerUp(container, options);
            } else {
                return new Core.HealPowerUp(container, options);
            }
        };

        Object.defineProperty(PowerUp.prototype, "DisplayObject", {
            get: function () {
                return this._displayElement;
            },
            enumerable: true,
            configurable: true
        });

        PowerUp.prototype.baseTake = function () {
            if (!this._taken) {
                console.log("Power up TAKEN");
                this._taken = true;

                this.take();
            }
        };

        PowerUp.prototype.take = function () {
            console.log("OVERWRITE ME");
        };

        PowerUp.prototype.removeElement = function () {
            if (this._displayElement) {
                this._container.removeChild(this._displayElement);
                this._container = undefined;
                this._displayElement = undefined;
            }
        };

        PowerUp.prototype.createElement = function (imagePath) {
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
        };

        PowerUp.prototype.canBeTaken = function (position) {
            return !this._taken && (Tools.GetDistance(position, this.position) < 28);
        };

        PowerUp.prototype.update = function (delta) {
            if (game.Player && this.canBeTaken(game.Player.position)) {
                this.baseTake();
            }

            if (this._displayElement) {
                var alpha = 1.0;
                if (this._lifeTime < 200) {
                    alpha = this._lifeTime / 200;
                } else if (this._lifeTime > this._lifeTimeMax - 1600) {
                    alpha = 1 - ((this._lifeTime - (this._lifeTimeMax - 1600)) / 1600);
                }
                this._displayElement.alpha = alpha;
            }

            // Increase lifetime
            this._lifeTime += delta;
        };

        PowerUp.prototype.hasDied = function () {
            return this._taken || this._lifeTime >= this._lifeTimeMax;
        };
        return PowerUp;
    })();
    Core.PowerUp = PowerUp;

    var HealPowerUp = (function (_super) {
        __extends(HealPowerUp, _super);
        function HealPowerUp(container, options) {
            _super.call(this, container, options, "health.png");
        }
        HealPowerUp.prototype.take = function () {
            game.Player.addHealth(25, false);
        };
        return HealPowerUp;
    })(PowerUp);
    Core.HealPowerUp = HealPowerUp;
    var RandomWeaponPowerUp = (function (_super) {
        __extends(RandomWeaponPowerUp, _super);
        function RandomWeaponPowerUp(container, options) {
            _super.call(this, container, options, "Microchip.png");
        }
        RandomWeaponPowerUp.prototype.take = function () {
            game.EquipRandomWeapon();
        };
        return RandomWeaponPowerUp;
    })(PowerUp);
    Core.RandomWeaponPowerUp = RandomWeaponPowerUp;
})(Core || (Core = {}));

var game;

// Load the API
kongregateAPI.loadAPI(onComplete);

// Callback function
function onComplete() {
    // Set the global kongregate API object
    kongregate = kongregateAPI.getAPI();

    console.log("kongregate", kongregate);
    console.log("STATS", kongregate["stats"]());
    console.log("parent.kongregate", parent["kongregate"]);
}

$(function () {
    // Instantiate Game!
    game = new UndeadInvasion.Game("gameDiv");
});
//# sourceMappingURL=app.js.map
