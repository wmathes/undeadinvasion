/// <reference path="Interfaces.d.ts" />
/// <reference path="../app.ts" />
var UndeadInvasion;
(function (UndeadInvasion) {
    var Sound = (function () {
        function Sound(_name, _repeat, _volume) {
            if (typeof _repeat === "undefined") { _repeat = false; }
            if (typeof _volume === "undefined") { _volume = 0.5; }
            var _this = this;
            this._name = _name;
            this._repeat = _repeat;
            this._volume = _volume;
            createjs.Sound.addEventListener("fileload", function (event) {
                _this.loadHandler(event);
                return true;
            });

            createjs.Sound.registerSound("Sounds/" + this._name + ".mp3", this._name);
        }
        Object.defineProperty(Sound.prototype, "Instance", {
            get: function () {
                return this._instance;
            },
            enumerable: true,
            configurable: true
        });

        Sound.prototype.loadHandler = function (event) {
            // This is fired for each sound that is registered.
            this._instance = createjs.Sound.play(this._name);
            this._instance.volume = this._volume;
            this._instance.play("none", undefined, undefined, 1);
        };
        return Sound;
    })();
    UndeadInvasion.Sound = Sound;

    var Weapon = (function () {
        function Weapon(settings) {
            // Instance Properties
            this.AmmoMax = ko.observable(0);
            this.AmmoRemaining = ko.observable(0);
            this.ReloadPercentage = ko.observable(0);
            this._lastFire = 999999;
            this._buttonWasReleased = true;
            this._shootQueue = [];
            this._settings = settings;

            this._settings.Image = this._settings.Image || this._settings.Name;
            this._settings.BulletWidth = this._settings.BulletWidth || "3px";
            this._settings.BulletHeight = this._settings.BulletHeight || "10px";

            this.ImageName = "Images/Weapon_" + this._settings.Name + ".png";

            this.AmmoRemaining(this._settings.AmmoMax);
            this.AmmoMax(this._settings.AmmoMax);
        }
        Weapon.Revolver = // Weapons
        function () {
            return new Weapon({
                AmmoMax: 6,
                BulletCount: 1,
                BulletSpeed: 1200,
                BulletSpeedSpread: 0,
                BulletSpread: 2,
                BulletLifetime: 2000,
                DamageMax: 180,
                DamageBase: 140,
                DamageSpread: 80,
                IsAutomatic: false,
                Name: "Revolver",
                SpeedAutomatic: 99999,
                SpeedManual: 200,
                SpeedReload: 1100
            });
        };

        Weapon.Pistol = function () {
            return new Weapon({
                AmmoMax: 15,
                BulletCount: 1,
                BulletSpeed: 1200,
                BulletSpread: 4,
                BulletSpeedSpread: 0,
                BulletLifetime: 2000,
                BulletType: "small",
                DamageMax: 105,
                DamageBase: 80,
                DamageSpread: 45,
                IsAutomatic: true,
                Name: "Pistol",
                SpeedAutomatic: 480,
                SpeedManual: 150,
                SpeedReload: 800
            });
        };

        Weapon.MachineGun = function () {
            return new Weapon({
                AmmoMax: 30,
                BulletCount: 1,
                BulletSpeed: 1100,
                BulletSpread: 9,
                BulletSpeedSpread: 0.1,
                BulletLifetime: 2000,
                BulletType: "small",
                DamageMax: 60,
                DamageBase: 35,
                DamageSpread: 25,
                IsAutomatic: true,
                Name: "MachineGun",
                SpeedAutomatic: 140,
                SpeedManual: 120,
                SpeedReload: 1200
            });
        };

        Weapon.AssaultRifle = function () {
            return new Weapon({
                AmmoMax: 32,
                BulletCount: 1,
                BulletSpeed: 1200,
                BulletSpread: 6,
                BulletSpeedSpread: 0.05,
                BulletLifetime: 1800,
                DamageMax: 90,
                DamageBase: 45,
                DamageSpread: 30,
                IsAutomatic: true,
                Name: "AssaultRifle",
                SpeedAutomatic: 200,
                SpeedManual: 180,
                SpeedReload: 1500
            });
        };

        Weapon.AutoShotgun = function () {
            return new Weapon({
                AmmoMax: 10,
                BulletCount: 12,
                BulletSpeed: 1200,
                BulletSpread: 21,
                BulletSpeedSpread: 0.2,
                BulletLifetime: 800,
                BulletWidth: "5px",
                BulletType: "shrapnel_slim",
                DamageMax: 70,
                DamageBase: 25,
                DamageSpread: 30,
                IsAutomatic: true,
                Name: "AutoShotgun",
                SpeedAutomatic: 420,
                SpeedManual: 350,
                SpeedReload: 2000
            });
        };

        Weapon.Shotgun = function () {
            return new Weapon({
                AmmoMax: 8,
                BulletCount: 15,
                BulletSpeed: 1200,
                BulletSpread: 18,
                BulletSpeedSpread: 0.3,
                BulletLifetime: 800,
                BulletWidth: "5px",
                BulletType: "shrapnel",
                DamageMax: 80,
                DamageBase: 20,
                DamageSpread: 40,
                IsAutomatic: false,
                Name: "Shotgun",
                SpeedAutomatic: 99999,
                SpeedManual: 550,
                SpeedReload: 2600
            });
        };

        Weapon.HuntingRifle = function () {
            return new Weapon({
                AmmoMax: 2,
                BulletCount: 10,
                BulletSpeed: 1200,
                BulletSpread: 11,
                BulletSpeedSpread: 0.35,
                BulletLifetime: 2000,
                BulletWidth: "5px",
                BulletType: "shrapnel",
                DamageMax: 180,
                DamageBase: 55,
                DamageSpread: 90,
                IsAutomatic: false,
                Name: "HuntingRifle",
                SpeedAutomatic: 99999,
                SpeedManual: 80,
                SpeedReload: 1200
            });
        };

        Weapon.Jackhammer = function () {
            return new Weapon({
                AmmoMax: 12,
                BulletCount: 6,
                BulletSpeed: 1200,
                BulletSpread: 18,
                BulletSpeedSpread: 0.2,
                BulletLifetime: 2000,
                BulletWidth: "5px",
                BulletType: "shrapnel_slim",
                DamageMax: 80,
                DamageBase: 30,
                DamageSpread: 30,
                IsAutomatic: true,
                Name: "Jackhammer",
                SpeedAutomatic: 250,
                SpeedManual: 150,
                SpeedReload: 3400
            });
        };

        Weapon.IonMinigun = function () {
            return new Weapon({
                AmmoMax: 168,
                BulletCount: 1,
                BulletSpeed: 1100,
                BulletSpread: 8,
                BulletSpeedSpread: 0.2,
                BulletLifetime: 2000,
                BulletWidth: "2px",
                BulletHeight: "4px",
                DamageMax: 90,
                DamageBase: 30,
                DamageSpread: 50,
                IsAutomatic: true,
                Name: "Ion Minigun",
                Image: "IonMinigun",
                SpeedAutomatic: 100,
                SpeedManual: 100,
                SpeedReload: 1600,
                BulletType: "ion",
                TrailColor: ["#FF0000", "#880000"]
            });
        };

        Weapon.Phaser = function () {
            return new Weapon({
                AmmoMax: 3,
                BulletCount: 1,
                BulletSpeed: 2500,
                BulletSpread: 2,
                BulletSpeedSpread: 0,
                BulletLifetime: 2000,
                BulletWidth: "32%",
                BulletHeight: "4px",
                DamageMax: 300,
                DamageBase: 30,
                DamageSpread: 20,
                IsAutomatic: true,
                Name: "Phaser",
                SpeedAutomatic: 180,
                SpeedManual: 150,
                SpeedReload: 450,
                BulletType: "phaser",
                TrailColor: ["#FF0000", "#880000"]
            });
        };

        Weapon.CannonLauncher = function () {
            return new Weapon({
                AmmoMax: 4,
                BulletCount: 1,
                BulletSpeed: 1200,
                BulletSpread: 6,
                BulletSpeedSpread: 0,
                BulletLifetime: 2000,
                BulletWidth: "26px",
                BulletHeight: "26px",
                DamageMax: 6000,
                DamageBase: 70,
                DamageSpread: 50,
                IsAutomatic: true,
                Image: "CannonLauncher",
                Name: "Cannon Launcher",
                SpeedAutomatic: 650,
                SpeedManual: 400,
                SpeedReload: 4000,
                BulletType: "cannonball",
                TrailColor: ["#FF0000", "#880000"],
                TrailWidth: 18
            });
        };

        Weapon.FlameThrower = function () {
            return new Weapon({
                AmmoMax: 60,
                BulletCount: 1,
                BulletSpeed: 350,
                BulletSpread: 18,
                BulletSpeedSpread: 0.2,
                BulletLifetime: 800,
                DamageMax: 600,
                DamageBase: 12,
                DamageSpread: 8,
                IsAutomatic: true,
                Image: "FlameThrower",
                Name: "Flame Thrower",
                SpeedAutomatic: 60,
                BulletScaleFactor: 1.25,
                BulletSpeedFactor: 0.90,
                BulletFadeFactor: 0.65,
                SpeedManual: 60,
                SpeedReload: 1800,
                BulletType: "flame",
                TrailColor: ["#FF0000", "#880000"],
                TrailWidth: 4
            });
        };

        Weapon.PlasmaCutter = function () {
            return new Weapon({
                AmmoMax: 80,
                BulletCount: 1,
                BulletSpeed: 260,
                BulletSpread: 0.5,
                BulletSpeedSpread: 0,
                BulletLifetime: 400,
                BulletFadeFactor: 0.50,
                DamageMax: 300,
                DamageBase: 20,
                DamageSpread: 20,
                IsAutomatic: true,
                Image: "PlasmaCutter",
                Name: "Plasma Cutter",
                SpeedAutomatic: 60,
                SpeedManual: 60,
                SpeedReload: 1800,
                BulletType: "ray",
                TrailColor: ["#FF0000", "#880000"],
                TrailWidth: 4
            });
        };

        Weapon.Random = // Random Weapon
        function () {
            var list = [
                "Revolver",
                "Pistol",
                "MachineGun",
                "AssaultRifle",
                "Shotgun",
                "HuntingRifle",
                "Jackhammer",
                "Phaser",
                "AutoShotgun",
                "CannonLauncher",
                "IonMinigun",
                "PlasmaCutter",
                "FlameThrower"
            ];

            var target = list[Math.floor(Math.random() * list.length)];

            console.log("RANDOM WEAPON -> ", target);

            return UndeadInvasion.Weapon[target]();
        };

        Weapon.prototype.getQueue = function () {
            return this._shootQueue;
        };

        Weapon.prototype.clearQueue = function () {
            this._shootQueue = [];
        };

        Weapon.prototype.update = function (d, buttonDown) {
            // Increase count since last Fire
            this._lastFire += d;

            if (!this.AmmoRemaining()) {
                // Update Progress Counter
                var perc = this._lastFire / this._settings.SpeedReload;
                if (perc < 0)
                    perc = 0;
                if (perc > 1)
                    perc = 1;
                this.ReloadPercentage(this._lastFire / this._settings.SpeedReload);

                if (this._lastFire > this._settings.SpeedReload) {
                    // Reload
                    this.AmmoRemaining(this.AmmoMax());
                    // SOUND: Reload Click
                    //
                }
            } else if (buttonDown) {
                this._lastFire += d;

                if (this._buttonWasReleased && this._lastFire > this._settings.SpeedManual) {
                    this.shoot();
                } else if (this._settings.IsAutomatic && this._lastFire > this._settings.SpeedAutomatic) {
                    this.shoot();
                } else {
                }
            }

            if (!buttonDown) {
                this._buttonWasReleased = true;
            }
        };

        Weapon.prototype.shoot = function () {
            if (this.AmmoRemaining() > 0) {
                for (var i = 0; i < this._settings.BulletCount; i++) {
                    var d = Math.floor(this._settings.DamageBase + (this._settings.DamageSpread * Math.random()));

                    var b = {
                        Angle: this._settings.BulletSpread * (-1 + (Math.random() * 2)),
                        Damage: d,
                        Speed: this._settings.BulletSpeed * (1 + (Math.random() * this._settings.BulletSpeedSpread)),
                        LifeTime: this._settings.BulletLifetime,
                        DamageMax: this._settings.DamageMax,
                        Type: this._settings.BulletType,
                        TrailColor: this._settings.TrailColor,
                        Size: 12,
                        FadeFactor: this._settings.BulletFadeFactor,
                        ScaleFactor: this._settings.BulletScaleFactor,
                        SpeedFactor: this._settings.BulletSpeedFactor,
                        TrailWidth: this._settings.BulletTrailWidth
                    };
                    this._shootQueue.push(b);
                }

                this.AmmoRemaining(this.AmmoRemaining() - 1);

                this._lastFire = 0;

                this._buttonWasReleased = false;
            }
        };
        return Weapon;
    })();
    UndeadInvasion.Weapon = Weapon;

    var InputKey = (function () {
        function InputKey(keyCodeArray, clickCallback, releaseCallback) {
            this._clicked = false;
            this._clickCallback = clickCallback;
            this._releaseCallback = releaseCallback;
            this._keyCodeArray = keyCodeArray;
        }
        InputKey.prototype.updateOnKey = function (keyCode, value) {
            if (this.hasKey(keyCode) && this._clicked != value) {
                this.Clicked = value;

                //console.log(keyCode, (value) ? "PRESSED" : "RELEASED");
                return true;
            }
        };

        InputKey.prototype.hasKey = function (keyCode) {
            return this._keyCodeArray.indexOf(keyCode) >= 0;
        };


        Object.defineProperty(InputKey.prototype, "Clicked", {
            get: function () {
                return this._clicked;
            },
            set: function (value) {
                if (this._clicked && !value && this._releaseCallback) {
                    this._releaseCallback();
                }
                if (!this._clicked && value && this._clickCallback) {
                    this._clickCallback();
                }
                this._clicked = value;
            },
            enumerable: true,
            configurable: true
        });
        return InputKey;
    })();
    UndeadInvasion.InputKey = InputKey;

    var Input = (function () {
        function Input() {
            this._cursorPosition = new Core.Position();
            this._inputKeyLiteral = {
                up: new InputKey([38, 87]),
                down: new InputKey([40, 83]),
                left: new InputKey([37, 65]),
                right: new InputKey([39, 68]),
                pause: new InputKey([27]),
                fire: new InputKey(["MOUSE_0", 32]),
                cheatRandomWeapon: new InputKey([82], undefined, function () {
                    if (!window["kongregate"]) {
                        game.EquipRandomWeapon();
                    }
                })
            };
        }
        Object.defineProperty(Input.prototype, "Up", {
            get: function () {
                return this._inputKeyLiteral.up;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Input.prototype, "Down", {
            get: function () {
                return this._inputKeyLiteral.down;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Input.prototype, "Left", {
            get: function () {
                return this._inputKeyLiteral.left;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Input.prototype, "Right", {
            get: function () {
                return this._inputKeyLiteral.right;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Input.prototype, "Pause", {
            get: function () {
                return this._inputKeyLiteral.pause;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Input.prototype, "Fire", {
            get: function () {
                return this._inputKeyLiteral.fire;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Input.prototype, "CursorPosition", {
            get: function () {
                return this._cursorPosition;
            },
            enumerable: true,
            configurable: true
        });

        Input.prototype.update = function (keyCode, value) {
            var hadEffect = false;
            for (var inputKey in this._inputKeyLiteral) {
                var effect = (this._inputKeyLiteral[inputKey]).updateOnKey(keyCode, value);
                hadEffect = hadEffect || effect;
            }
            return hadEffect;
        };

        Input.prototype.handleKeyUp = function (event) {
            if (this.update(event.keyCode, false)) {
                this.preventDefault(event);
            }
        };
        Input.prototype.handleKeyDown = function (event) {
            if (this.update(event.keyCode, true)) {
                this.preventDefault(event);
            }
        };

        Input.prototype.handleMouseDown = function (event) {
            if (event.offsetX > 0) {
                this.updateMousePosition(event);
            }
            if (this.update("MOUSE_" + event.button, true)) {
                console.log("ACTIVE", $(document.activeElement)[0]);
                this.preventDefault(event);
            }
        };
        Input.prototype.handleMouseUp = function (event) {
            if (event.offsetX > 0) {
                this.updateMousePosition(event);
            }
            if (this.update("MOUSE_" + event.button, false)) {
                this.preventDefault(event);
            }
        };
        Input.prototype.handleMouseMove = function (event) {
            this.updateMousePosition(event);
        };

        Input.prototype.preventDefault = function (event) {
            if (event.hasOwnProperty("defaultPrevented")) {
                event.defaultPrevented = true;
            } else {
                event.preventDefault();
            }
        };

        Input.prototype.updateMousePosition = function (event) {
            if ($.isNumeric(event.offsetX)) {
                this._cursorPosition.x = event.offsetX;
                this._cursorPosition.y = event.offsetY;
            } else if ($.isNumeric((event).layerX)) {
                this._cursorPosition.x = (event).layerX;
                this._cursorPosition.y = (event).layerY;
            } else if ($.isNumeric(event.clientX)) {
                this._cursorPosition.x = event.clientX - $(event.target).offset().left;
                this._cursorPosition.y = event.clientY - $(event.target).offset().top;
            }
        };
        return Input;
    })();
    UndeadInvasion.Input = Input;

    var Game = (function () {
        function Game(playfieldName) {
            var _this = this;
            // Score
            this._score = ko.observable(0);
            // Weapon
            this._weapon = ko.observable(null);
            // Ground Effects
            this._vanishingEntities = [];
            // Game Stats
            this._gameLength = 0;
            this._gameSpawnNext = 0;
            this._gameSpawnIndex = 0;
            this._state = ko.observable("menu");
            this._paused = ko.observable(false);
            this._bullets = [];
            // Player
            this._player = null;
            // Zombies and shit
            this._entities = [];
            this._killCount = ko.observable(0);
            // Input Manager
            this._input = new Input();
            this.GameScore = ko.observable(null);
            this._healLast = 0;
            this.HPWidth = ko.observable("100%");
            this._entityQueue = [];
            if (UndeadInvasion.Game.Current) {
                // Close
                //UndeadInvasion.Game.Current.exit();
            }

            // Register self
            UndeadInvasion.Game._current = this;

            // Get Playfield Element... or fail horribly
            var playfieldJQuery = $("#" + playfieldName);
            if (!playfieldJQuery.length) {
                console.log("No Playfield found");
                return false;
            }

            // Focus the element
            playfieldJQuery.focus();

            // Add Playfield Class
            playfieldJQuery.addClass("playfield");

            // Get Canvas Element
            var canvasElement = playfieldJQuery.find("canvas")[0];

            if (!canvasElement) {
                console.log("No Canvas found");
                return false;
            }

            // Adjust Sizes
            canvasElement.width = Config.Game.Width;
            canvasElement.height = Config.Game.Height;
            playfieldJQuery.css({ width: Config.Game.Width, height: Config.Game.Height });

            //Create a stage by getting a reference to the canvas
            this._stage = new createjs.Stage(canvasElement);

            // Containers
            this._groundContainer = new createjs.Container();
            this._effectContainer = new createjs.Container();
            this._entityContainer = new createjs.Container();
            this._stage.addChild(this._groundContainer, this._entityContainer, this._effectContainer);

            // Handle Ticks
            createjs.Ticker.addEventListener("tick", function (event) {
                _this.tick(event.delta);
            });

            // Knockout
            ko.cleanNode($("body")[0]);
            ko.applyBindings(this, $("body")[0]);

            // Add Events
            // ... PlayField
            playfieldJQuery.mousedown(function (e) {
                _this.Input.handleMouseDown(e);
            });
            playfieldJQuery.mouseup(function (e) {
                _this.Input.handleMouseUp(e);
            });
            playfieldJQuery.mousemove(function (e) {
                _this.Input.handleMouseMove(e);
            });

            // ... Document
            $(document).bind("keydown", function (e) {
                _this.Input.handleKeyDown(e);
            });
            $(document).bind("keyup", function (e) {
                _this.Input.handleKeyUp(e);
            });
        }
        Object.defineProperty(Game, "Current", {
            get: function () {
                return this._current;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Score", {
            get: function () {
                return this._score;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Weapon", {
            get: function () {
                return this._weapon;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "State", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Paused", {
            get: function () {
                return this._paused;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Player", {
            get: function () {
                return this._player;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Entities", {
            get: function () {
                return this._entities;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Difficulty", {
            get: function () {
                return this._difficulty;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Game.prototype, "Input", {
            get: function () {
                return this._input;
            },
            enumerable: true,
            configurable: true
        });

        Game.prototype.splatterBlood = function (x, y) {
            this._vanishingEntities.push(new VanishingEntity("Blood", x, y, this._groundContainer));
            var s = new Sound("bloodsplash");
        };

        Game.prototype.splatterBones = function (x, y, angle, scale) {
            var ve = new VanishingEntity("Bones", x, y, this._groundContainer);
            if (angle != undefined) {
                ve.angle = angle;
            }
            if (scale != undefined) {
                ve.scale = scale;
            }
            this._vanishingEntities.push(ve);
        };

        Game.prototype.spawnPowerup = function (x, y, forceWeapon) {
            if (typeof forceWeapon === "undefined") { forceWeapon = false; }
            this._entityQueue.push(Core.PowerUp.GetRandom(this._entityContainer, x, y, forceWeapon));
        };

        Game.prototype.spawnEnemy = function (entityName, borderSpawn) {
            if (typeof entityName === "undefined") { entityName = "Zombie"; }
            if (typeof borderSpawn === "undefined") { borderSpawn = true; }
            if (this._entities.length < this._difficulty.MaxEnemies) {
                var x = 0;
                var y = 0;

                if (borderSpawn) {
                    var r = Math.floor(Math.random() * 4);
                    if (r == 0 || r == 2) {
                        x = Math.random() * Config.Game.Width;
                        y = Math.random() * (Config.Game.Height * 0.1);
                        if (r == 2) {
                            y += Config.Game.Height * 0.9;
                        }
                    } else {
                        y = Math.random() * Config.Game.Height;
                        x = Math.random() * (Config.Game.Width * 0.1);
                        if (r == 1) {
                            x += Config.Game.Width * 0.9;
                        }
                    }
                } else {
                    x = Math.random() * Config.Game.Width;
                    y = Math.random() * Config.Game.Height;
                }

                var scale = 0.75 + (Math.random() * 0.75);

                var enemy = new Core.Entity(this._entityContainer, {
                    angleSpeed: 60 / 1000,
                    moveSpeed: 40 / 1000,
                    name: "Zombie",
                    size: 24 * scale,
                    x: x,
                    y: y,
                    scale: scale,
                    pointValue: 5 + Math.floor(scale * 15),
                    regX: 15,
                    regY: 13
                });

                this._entities.push(enemy);
            }
        };

        Game.prototype.spawnPlayer = function () {
            var player = new Core.Player(this._entityContainer);
            this._player = player;

            this.Weapon(UndeadInvasion.Weapon.Pistol());
        };

        Game.prototype.reset = function (difficulty) {
            // Reset Game Variables
            this._gameLength = 0;
            this._gameSpawnNext = 0;
            this._gameSpawnIndex = 0;
            this._killCount(0);
            this._entities = [];
            this.Score(0);

            // Delete Player
            this._player = null;

            // State
            this._state("menu");

            // Set Pause
            this._paused(true);

            // Get Difficulty Variables
            this.SwitchDifficulty(difficulty);

            // Clean Containers
            this._effectContainer.removeAllChildren();
            this._groundContainer.removeAllChildren();
            this._entityContainer.removeAllChildren();
        };

        Game.prototype.start = function (difficulty) {
            this.reset(difficulty);
            this.spawnPlayer();

            this._state("game");
            this._paused(false);

            for (var i = 0; i < this.Difficulty.InitialZombies; i++) {
                this.spawnEnemy("Zombie", true);
            }
        };

        Game.prototype.end = function () {
            var _this = this;
            // Set Score Object
            this.GameScore(new Core.Score({
                Points: this.Score(),
                Time: this._gameLength
            }));

            // Place BonePile
            this.splatterBones(this._player.position.x, this._player.position.y);

            // Remove the Player
            this._player.removeElement();
            this._player = undefined;

            // Fade In LOOSE!
            $("#messageGameOver").fadeIn(2400, function () {
                _this.GameScore().upload();

                // After fade
                setTimeout(function () {
                    $("#messageGameOver").hide();
                    _this.reset();
                    _this.GameScore().animate();
                }, 1600);
            });
        };

        Game.prototype.stop = function () {
            this.reset();
            this._state("menu");
        };

        Game.prototype.togglePause = function () {
            if (this._state() == "game") {
                this._paused(!this._paused());
            }
        };

        Game.prototype.pause = function () {
            if (this._state() == "game") {
                this._paused(true);
            }
        };

        Game.prototype.resume = function () {
            if (this._state() == "game") {
                this._paused(false);
            }
        };

        Game.prototype.tick = function (d) {
            if (!this._paused() && this._state() == "game") {
                // Increase Counter
                this._gameLength += d;

                // Calculate Respawn
                this.tickRespawn(d);

                // Update all Bullets
                this.tickBullets(d);

                // Update Weapon
                this.tickWeapon(d);

                // Update Enemies
                this.tickEntities(d);

                // Update Player
                this.tickPlayer(d);

                // Update Heal
                this.tickHeal(d);

                // Update Health
                this.recalcPlayerHealth();
            }

            // Update Splatters
            this.tickGroundEffects(d);

            // Update Stage
            this._stage.update();
        };

        Game.prototype.tickRespawn = function (d) {
            // Increase Last Spawn (in Seconds)
            this._gameSpawnNext -= d;

            if (game.Player && this._gameSpawnNext <= 0) {
                // Spawn Amount?
                var amount = Math.ceil(this._gameSpawnIndex / this._difficulty.AmountStep);
                if (amount > 3)
                    amount = 3;

                for (var i = 0; i < amount; i++) {
                    this.spawnEnemy("Zombie", true);
                }

                // Calculate next Spawn
                var nextSpawn = this._difficulty.DelayMax - (this._gameSpawnIndex * 4);

                // Crop to Minimum
                nextSpawn = (nextSpawn < this._difficulty.DelayMin) ? this._difficulty.DelayMin : nextSpawn;

                // Update values
                this._gameSpawnNext = nextSpawn;
                this._gameSpawnIndex++;
                //console.log("Spawned ", amount, " Zombies. Next Spawn in ", nextSpawn / 1000, "seconds");
            }
        };

        Game.prototype.tickHeal = function (d) {
            if (this.Player) {
                this._healLast += d;
                if (this._healLast > this.Difficulty.HealEvery) {
                    this._healLast -= this.Difficulty.HealEvery;

                    this.Player.addHealth(1, false);
                }
            }
        };

        Game.prototype.recalcPlayerHealth = function () {
            var v = "0%";
            if (this.Player) {
                v = Math.round(100 * (this.Player.hp / this.Player.hpMax)) + "%";
            }
            this.HPWidth(v);
        };

        Game.prototype.tickPlayer = function (d) {
            if (this._player) {
                this._player.update(d);

                if (this._player.HP() <= 0) {
                    this.end();
                }
            }
        };

        Game.prototype.tickBullets = function (d) {
            this._bullets.each(function (el) {
                el.update(d);
                return true;
            });
        };

        Game.prototype.tickEntities = function (d) {
            var _this = this;
            var newEntities = [];
            this._entityQueue = [];
            var scoreIncrease = 0;
            var scoreTimeFactor = 1;

            this._entities.each(function (ent) {
                ent.update(d);
                if (!ent.hasDied()) {
                    newEntities.push(ent);
                } else {
                    scoreTimeFactor += Math.sqrt(_this._gameLength / 2) / 1000;

                    if (ent.moveForward) {
                        _this._gameSpawnNext -= 100;

                        scoreIncrease += ent.options.pointValue * _this.Difficulty.ScoreFactor;

                        _this.splatterBones(ent.position.x, ent.position.y, ent.rotation.angle, ent.options.scale);
                        if (Math.random() < _this.Difficulty.PowerUpChance || _this._killCount() == 0) {
                            _this.spawnPowerup(ent.position.x, ent.position.y, (_this._killCount() == 0));
                        }
                        _this._killCount(_this._killCount() + 1);
                    } else {
                        var p = ((ent.options.pointValue * _this.Difficulty.ScoreFactor) + (Math.sqrt(_this.Score())));
                        console.log("P");
                        scoreIncrease += p;
                    }

                    ent.removeElement();
                }
                return true;
            });

            this.Score(this.Score() + Math.floor(scoreIncrease * scoreTimeFactor));

            this._entities = newEntities.add(this._entityQueue);
        };

        Game.prototype.tickGroundEffects = function (d) {
            this._vanishingEntities.each(function (el) {
                el.update(d);
                return true;
            });
        };

        Game.prototype.tickWeapon = function (d) {
            var _this = this;
            if (this.Weapon()) {
                // Update the Weapon itself
                this.Weapon().update(d, (this.Input.Fire.Clicked && !!this._player));

                if (this._player) {
                    this.Weapon().getQueue().each(function (bulletData) {
                        var bullet = new Bullet(bulletData, _this.Player.position.x, _this.Player.position.y, _this.Player.rotation.angle, _this._effectContainer);

                        _this._bullets.push(bullet);

                        return true;
                    });
                }

                // Clear the Queue
                this.Weapon().clearQueue();
            }
        };

        Game.prototype.EquipWeapon = function (name) {
            if (UndeadInvasion.Weapon[name]) {
                this.Weapon(UndeadInvasion.Weapon[name]());
            }
        };

        Game.prototype.EquipRandomWeapon = function () {
            this.Weapon(UndeadInvasion.Weapon.Random());
        };

        Game.prototype.SwitchDifficulty = function (difficulty) {
            if (typeof difficulty === "undefined") { difficulty = "Normal"; }
            if (!Config.Difficulties[difficulty]) {
                difficulty = "Normal";
            }
            this._difficulty = Config.Difficulties[difficulty];
        };
        return Game;
    })();
    UndeadInvasion.Game = Game;
})(UndeadInvasion || (UndeadInvasion = {}));
//# sourceMappingURL=Game.js.map
