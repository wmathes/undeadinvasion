/// <reference path="Interfaces.d.ts" />
/// <reference path="../app.ts" />

module UndeadInvasion {

    export class Sound {
        private _instance: createjs.SoundInstance;

        public get Instance(): createjs.SoundInstance {
            return this._instance;
        }

        constructor(private _name: string, private _repeat: boolean = false, private _volume: number = 0.5) {            
            createjs.Sound.addEventListener("fileload", (event): boolean => { this.loadHandler(event); return true; });
            
            createjs.Sound.registerSound("Sounds/"+ this._name +".mp3", this._name);
        }
        private loadHandler(event) {
            // This is fired for each sound that is registered.
            this._instance = createjs.Sound.play(this._name);
            this._instance.volume = this._volume;
            this._instance.play("none", undefined, undefined, 1);
        }
    }

    export class Weapon {

        // Weapons
        public static Revolver(): Weapon {
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
        }

        public static Pistol(): Weapon {
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
        }

        public static MachineGun(): Weapon {
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
        }

        public static AssaultRifle(): Weapon {
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
        }

        public static AutoShotgun(): Weapon {
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
        }

        public static Shotgun(): Weapon {
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
        }

        public static HuntingRifle(): Weapon {
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
        }

        public static Jackhammer(): Weapon {
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
        }

        public static IonMinigun(): Weapon {
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
        }

        public static Phaser(): Weapon {
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
        }

        public static CannonLauncher(): Weapon {
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
        }

        public static FlameThrower(): Weapon {
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
        }

        public static PlasmaCutter(): Weapon {
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
        }

        // Random Weapon
        public static Random(): Weapon {

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

            return <Weapon>UndeadInvasion.Weapon[target]();
        }

        // Instance Properties
        public AmmoMax: KnockoutObservable<number> = ko.observable(0);
        public AmmoRemaining: KnockoutObservable<number> = ko.observable(0);
        public ReloadPercentage: KnockoutObservable<number> = ko.observable(0);
        public ImageName: string;

        private _lastFire: number = 999999;
        private _buttonWasReleased: boolean = true;

        private _settings: IWeapon;

        private _shootQueue: IBullet[] = [];

        constructor(settings: IWeapon) {
            this._settings = settings;

            this._settings.Image = this._settings.Image || this._settings.Name;
            this._settings.BulletWidth = this._settings.BulletWidth || "3px";
            this._settings.BulletHeight = this._settings.BulletHeight || "10px";

            this.ImageName = "Images/Weapon_" + this._settings.Name + ".png";

            this.AmmoRemaining(this._settings.AmmoMax);
            this.AmmoMax(this._settings.AmmoMax);
        }

        public getQueue(): IBullet[]{
            return this._shootQueue;
        }

        public clearQueue() {
            this._shootQueue = [];
        }

        public update(d: number, buttonDown: boolean) {

            // Increase count since last Fire
            this._lastFire += d;
            
            // Nachladen
            if (!this.AmmoRemaining()) {

                // Update Progress Counter
                var perc = this._lastFire / this._settings.SpeedReload;
                if (perc < 0) perc = 0;
                if (perc > 1) perc = 1;
                this.ReloadPercentage(this._lastFire / this._settings.SpeedReload);
                
                if (this._lastFire > this._settings.SpeedReload) {
                    // Reload
                    this.AmmoRemaining(this.AmmoMax());

                    // SOUND: Reload Click
                    // 
                }
            }
            // Schuss Versuch
            else if (buttonDown) {

                this._lastFire += d;

                // Manual?
                if (this._buttonWasReleased && this._lastFire > this._settings.SpeedManual) {
                    this.shoot();
                }
                // Automatic
                else if (this._settings.IsAutomatic && this._lastFire > this._settings.SpeedAutomatic) {
                    this.shoot();
                }
                else {

                }
            }

            if (!buttonDown) {
                this._buttonWasReleased = true;
            }
        }

        public shoot() {
            if (this.AmmoRemaining() > 0) {

                for (var i = 0; i < this._settings.BulletCount; i++) {
                    var d = Math.floor(this._settings.DamageBase + (this._settings.DamageSpread * Math.random()));

                    var b: IBullet = {
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
        }
    }

    export class InputKey {
        private _clicked: boolean = false;
        private _keyCodeArray: any[];

        private _clickCallback: any;
        private _releaseCallback: any;

        constructor(keyCodeArray: any[], clickCallback?: any, releaseCallback?: any) {
            this._clickCallback = clickCallback;
            this._releaseCallback = releaseCallback;
            this._keyCodeArray = keyCodeArray;
        }

        public updateOnKey(keyCode: any, value: boolean):boolean {
            if (this.hasKey(keyCode) && this._clicked != value) {
                this.Clicked = value;
                //console.log(keyCode, (value) ? "PRESSED" : "RELEASED");
                return true;
            }
        }

        public hasKey(keyCode: any): boolean {
            return this._keyCodeArray.indexOf(keyCode) >= 0;
        }

        public set Clicked(value: boolean) {
            if (this._clicked && !value && this._releaseCallback) {
                this._releaseCallback();
            }
            if (!this._clicked && value && this._clickCallback) {
                this._clickCallback();
            }
            this._clicked = value;
        }

        public get Clicked(): boolean {
            return this._clicked;
        }

    }

    export class Input {
        private _inputKeyLiteral: any;

        public get Up(): InputKey { return this._inputKeyLiteral.up; }
        public get Down(): InputKey { return this._inputKeyLiteral.down; }
        public get Left(): InputKey { return this._inputKeyLiteral.left; }
        public get Right(): InputKey { return this._inputKeyLiteral.right; }

        public get Pause(): InputKey { return this._inputKeyLiteral.pause; }
        public get Fire(): InputKey { return this._inputKeyLiteral.fire; }

        private _cursorPosition: Core.Position = new Core.Position();
        public get CursorPosition(): Core.Position { return this._cursorPosition; }

        constructor() {
            this._inputKeyLiteral = {
                up: new InputKey([38, 87]),
                down: new InputKey([40, 83]),
                left: new InputKey([37, 65]),
                right: new InputKey([39, 68]),
                pause: new InputKey([27]), // Escape
                fire: new InputKey(["MOUSE_0", 32]), // Space, MouseLeft
                cheatRandomWeapon: new InputKey([82], undefined, () => {
                    if (!window["kongregate"]) {
                        game.EquipRandomWeapon();
                    }
                })            
            };
        }

        public update(keyCode: any, value: boolean): boolean {
            var hadEffect: boolean = false;
            for (var inputKey in this._inputKeyLiteral) {
                var effect = (<InputKey>this._inputKeyLiteral[inputKey]).updateOnKey(keyCode, value);
                hadEffect = hadEffect || effect;
            }
            return hadEffect;
        }

        public handleKeyUp(event: JQueryKeyEventObject) {
            if (this.update(event.keyCode, false)) {
                this.preventDefault(event);
            }
        }
        public handleKeyDown(event: JQueryKeyEventObject) {
            if (this.update(event.keyCode, true)) {                
                this.preventDefault(event);
            }
        }

        public handleMouseDown(event: JQueryMouseEventObject) {
            if (event.offsetX > 0) {
                this.updateMousePosition(event);
            }
            if (this.update("MOUSE_" + event.button, true)) {
                console.log("ACTIVE", $(document.activeElement)[0]);
                this.preventDefault(event);
            }
        }
        public handleMouseUp(event: JQueryMouseEventObject) {

            if (event.offsetX > 0) {
                this.updateMousePosition(event);
            }
            if (this.update("MOUSE_" + event.button, false)) {
                this.preventDefault(event);
            }
        }
        public handleMouseMove(event: JQueryMouseEventObject) {
            this.updateMousePosition(event);
        }

        private preventDefault(event) {
            if (event.hasOwnProperty("defaultPrevented")) {
                event.defaultPrevented = true;
            }
            else {
                event.preventDefault();
            }
        }

        private updateMousePosition(event: JQueryMouseEventObject) {
            // Chrome
            if ($.isNumeric(event.offsetX)) {
                this._cursorPosition.x = event.offsetX;
                this._cursorPosition.y = event.offsetY;
            }
            // Explorer
            else if ($.isNumeric((<any>event).layerX)) {
                this._cursorPosition.x = (<any>event).layerX;
                this._cursorPosition.y = (<any>event).layerY;
            }
            // FF
            else if ($.isNumeric(event.clientX)) {
                this._cursorPosition.x = event.clientX - $(event.target).offset().left;
                this._cursorPosition.y = event.clientY - $(event.target).offset().top;
            }
        }
    }

    export class Game {

        // Global Ref
        private static _current: Game;
        public static get Current(): Game { return this._current; }

        // Canvas References
        private _stage: createjs.Stage;
        private _groundContainer: createjs.Container;
        private _entityContainer: createjs.Container;
        private _effectContainer: createjs.Container;

        // Score
        private _score: KnockoutObservable<number> = ko.observable(0);
        public get Score(): KnockoutObservable<number> { return this._score; }

        // Weapon
        private _weapon: KnockoutObservable<Weapon> = ko.observable(null);
        public get Weapon(): KnockoutObservable<Weapon> { return this._weapon; }

        // Ground Effects
        private _vanishingEntities: VanishingEntity[] = [];

        // Game Stats
        private _gameLength: number = 0;
        private _gameSpawnNext: number = 0;
        private _gameSpawnIndex: number = 0;

        private _state: KnockoutObservable<string> = ko.observable("menu");
        public get State(): KnockoutObservable<string> { return this._state; }
        private _paused: KnockoutObservable<boolean> = ko.observable(false);
        public get Paused(): KnockoutObservable<boolean> { return this._paused; }

        private _bullets: Bullet[] = [];

        // Player
        private _player: Core.Player = null;
        public get Player(): Core.Player {
            return this._player;
        } 

        // Zombies and shit
        private _entities: IEntityBase[] = [];
        public get Entities(): IEntityBase[]{ return this._entities; }
        private _killCount: KnockoutObservable<number> = ko.observable(0);

        // Difficulty
        private _difficulty: IGameDifficulty;
        public get Difficulty(): IGameDifficulty { return this._difficulty; }

        // Input Manager
        private _input: Input = new Input();
        public get Input(): Input {
            return this._input;
        }

        constructor(playfieldName: string) {
            // Already running?
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
            var canvasElement: HTMLCanvasElement = <HTMLCanvasElement>playfieldJQuery.find("canvas")[0];

            // Opt Out or create
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
            createjs.Ticker.addEventListener("tick", (event: { delta: number }) => {
                this.tick(event.delta);
            });

            // Knockout 
            ko.cleanNode($("body")[0]);
            ko.applyBindings(this, $("body")[0]);

            // Add Events
            // ... PlayField
            playfieldJQuery.mousedown((e) => {
                this.Input.handleMouseDown(e);
            });
            playfieldJQuery.mouseup((e) => {
                this.Input.handleMouseUp(e);
            });
            playfieldJQuery.mousemove((e) => {
                this.Input.handleMouseMove(e);
            });
            // ... Document
            $(document).bind("keydown", (e) => {
                this.Input.handleKeyDown(e);
            });
            $(document).bind("keyup", (e) => {
                this.Input.handleKeyUp(e);
            });
        }

        public splatterBlood(x: number, y: number): void {
            this._vanishingEntities.push(new VanishingEntity("Blood", x, y, this._groundContainer));
            var s = new Sound("bloodsplash");
        }

        public splatterBones(x: number, y: number, angle?: number, scale?: number): void {
            var ve = new VanishingEntity("Bones", x, y, this._groundContainer);
            if (angle != undefined) {
                ve.angle = angle;
            }
            if (scale != undefined) {
                ve.scale = scale; 
            }
            this._vanishingEntities.push(ve);
        }

        public spawnPowerup(x: number, y: number, forceWeapon: boolean = false): void {            
            this._entityQueue.push(Core.PowerUp.GetRandom(this._entityContainer, x, y, forceWeapon));
        }

        public spawnEnemy(entityName: string = "Zombie", borderSpawn: boolean = true): void {

            if (this._entities.length < this._difficulty.MaxEnemies) {

                var x = 0;
                var y = 0;

                // Completely Random
                if (borderSpawn) {

                    var r = Math.floor(Math.random() * 4);
                    if (r == 0 || r == 2) { // 0-Top or 2-Bottom
                        x = Math.random() * Config.Game.Width;
                        y = Math.random() * (Config.Game.Height * 0.1);
                        if (r == 2) { // Bottom
                            y += Config.Game.Height * 0.9;
                        }
                    }
                    else { // 3-Left or 1-Right
                        y = Math.random() * Config.Game.Height;
                        x = Math.random() * (Config.Game.Width * 0.1);
                        if (r == 1) { // Right
                            x += Config.Game.Width * 0.9;
                        }
                    }
                }
                else {
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
        }

        public spawnPlayer(): void {
            var player = new Core.Player(this._entityContainer);
            this._player = player;

            this.Weapon(UndeadInvasion.Weapon.Pistol());
        }



        public reset(difficulty?: string): void {

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
        }

        public start(difficulty?: string): void {
            this.reset(difficulty);
            this.spawnPlayer();

            this._state("game");
            this._paused(false);

            // Spawn Initial Zombies
            for (var i = 0; i < this.Difficulty.InitialZombies; i++) {
                this.spawnEnemy("Zombie", true);
            }
        }

        public GameScore: KnockoutObservable<Core.Score> = ko.observable(null);

        public end(): void {

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
            $("#messageGameOver").fadeIn(2400, () => {
                this.GameScore().upload();
                // After fade 
                setTimeout(() => {
                    $("#messageGameOver").hide();
                    this.reset();
                    this.GameScore().animate();
                }, 1600);
            });
        }

        public stop(): void {
            this.reset();
            this._state("menu");
        }

        public togglePause(): void {
            if (this._state() == "game") {
                this._paused(!this._paused());
            }
        }

        public pause(): void {
            if (this._state() == "game") {
                this._paused(true);
            }
        }

        public resume(): void {
            if (this._state() == "game") {
                this._paused(false);
            }
        }

        public tick(d: number): void {

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
        }

        public tickRespawn(d: number) {

            // Increase Last Spawn (in Seconds)
            this._gameSpawnNext -= d;

            // Spawn?
            if (game.Player && this._gameSpawnNext <= 0) {

                // Spawn Amount?
                var amount = Math.ceil(this._gameSpawnIndex / this._difficulty.AmountStep);
                if (amount > 3) amount = 3;

                // Spawn!!!
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
        }

        private _healLast: number = 0;
        public HPWidth: KnockoutObservable<string> = ko.observable("100%");

        public tickHeal(d: number) {
            if (this.Player) {
                this._healLast += d;
                if (this._healLast > this.Difficulty.HealEvery) {
                    this._healLast -= this.Difficulty.HealEvery;

                    this.Player.addHealth(1, false);
                }
            }
        }

        public recalcPlayerHealth() {
            var v: string = "0%";
            if (this.Player) {
                v = Math.round(100 * (this.Player.hp / this.Player.hpMax)) + "%";
            }
            this.HPWidth(v);
        }

        public tickPlayer(d: number) {      

            if (this._player) {                
                this._player.update(d);

                if (this._player.HP() <= 0) {
                    this.end();
                }
            }
        }

        public tickBullets(d: number) {
            this._bullets.each((el: Bullet) => {
                el.update(d);
                return true;
            });
        }

        private _entityQueue: IEntityBase[] = [];

        public tickEntities(d: number) {
            var newEntities: IEntityBase[] = [];
            this._entityQueue = [];
            var scoreIncrease = 0;
            var scoreTimeFactor = 1;

            this._entities.each((ent: Core.Entity) => {
                ent.update(d);
                if  (!ent.hasDied()) {
                    newEntities.push(ent);
                }
                else {
                    scoreTimeFactor += Math.sqrt(this._gameLength / 2) / 1000;
                    

                    if (ent.moveForward) {

                        this._gameSpawnNext -= 100;

                        scoreIncrease += ent.options.pointValue * this.Difficulty.ScoreFactor;

                        this.splatterBones(ent.position.x, ent.position.y, ent.rotation.angle, ent.options.scale);
                        if (Math.random() < this.Difficulty.PowerUpChance || this._killCount() == 0) {
                            this.spawnPowerup(ent.position.x, ent.position.y, (this._killCount() == 0));
                        }
                        this._killCount(this._killCount() + 1);
                    }
                    else {
                        var p = ((ent.options.pointValue * this.Difficulty.ScoreFactor) + (Math.sqrt(this.Score())));
                        console.log("P");
                        scoreIncrease += p;
                    }

                    ent.removeElement();
                }
                return true;
            });

            this.Score(this.Score() + Math.floor(scoreIncrease * scoreTimeFactor));

            this._entities = newEntities.add(this._entityQueue);
        }

        public tickGroundEffects(d: number) {
            this._vanishingEntities.each((el: VanishingEntity) => {
                el.update(d);
                return true;
            });
        }

        public tickWeapon(d: number) {
            // Weapon
            if (this.Weapon()) {

                // Update the Weapon itself
                this.Weapon().update(d, (this.Input.Fire.Clicked && !!this._player));

                // Grab all Bullets from queue and spawn them
                if (this._player) {
                    this.Weapon().getQueue().each((bulletData: IBullet) => {
                        var bullet = new Bullet(
                            bulletData,
                            this.Player.position.x,
                            this.Player.position.y,
                            this.Player.rotation.angle,
                            this._effectContainer);

                        this._bullets.push(bullet);

                        return true;
                    });
                }

                // Clear the Queue
                this.Weapon().clearQueue();
            }
        }

        public EquipWeapon(name: string) {
            if (UndeadInvasion.Weapon[name]) {
                this.Weapon(UndeadInvasion.Weapon[name]());
            }
        }

        public EquipRandomWeapon() {
            this.Weapon(UndeadInvasion.Weapon.Random());
        }

        public SwitchDifficulty(difficulty: string = "Normal") {
            if(!Config.Difficulties[difficulty]) {
                difficulty = "Normal";
            }
            this._difficulty = <IGameDifficulty>Config.Difficulties[difficulty];       
        }
    }
}