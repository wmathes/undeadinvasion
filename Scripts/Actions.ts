/// <reference path="Game.ts" />


module Actions {
    export class BaseAction implements IEntityAction {
        public _entity: Core.Entity;

        constructor(entity: Core.Entity) {
            this._entity = entity;
        }
        public update(delta: number) {
            throw new Error("BaseAction used");
        }
    }

    export class EnemyAction extends BaseAction {

        public _checkMin: number = 1;
        public _checkFactor: number = 1;
        private _checkNext: number = 0.5;
        public state: number = 0;

        // Cache Values
        private _distanceToPlayer: number = null;
        private _angleToPlayer: number = null;
        private _angleOffsetToPlayer: number = null;

        // Cache Getters 
        public get DistanceToPlayer(): number {
            if (!game.Player) {
                return 10000000;
            }
            if (this._distanceToPlayer == null) {
                this._distanceToPlayer = Core.Tools.GetDistance(this._entity.position, game.Player.position);
            }
            return this._distanceToPlayer;
        }
        public get AngleToPlayer(): number {
            if (!game.Player) {
                return 0;
            }
            if (this._angleToPlayer == null) {
                this._angleToPlayer = Core.Tools.GetAngle(this._entity.position, game.Player.position);
            }
            return this._angleToPlayer;
        }
        public get AngleOffsetToPlayer(): number {
            if (!game.Player) {
                return 0;
            }
            if (this._angleOffsetToPlayer == null) {
                this._angleOffsetToPlayer = Core.Tools.GetAngleOffsetByPosition(this._entity.position, game.Player.position, this._entity.rotation);
            }
            return this._angleOffsetToPlayer;
        }

        // Ctor
        constructor(entity: Core.Entity) {
            super(entity);
            this.updateState();
            this.resetNextCheck();
        }

        public innerUpdate(delta: number) {

            // Reset Cached Values
            this._distanceToPlayer = null;
            this._angleOffsetToPlayer = null;
            this._angleToPlayer = null;

            // Every X ticks... try to change action
            this.checkForStateChange(delta);
            this.updateState();
        }

        public resetNextCheck() {
            this._checkNext = this._checkMin + (Math.random() * this._checkFactor);
        }

        public checkForStateChange(delta: number) {
            this._checkNext -= delta / 1000;
            if (this._checkNext <= 0) {
                
                // Get the next Action
                // ... and apply it if its not null
                var action = this.tryChangeAction();
                if (action) {
                    this._entity.setAction(action);
                }
                else {
                    this.updateState();
                    this._checkNext = this._checkMin;
                }
            }
        }


        // Virtuals
        public tryChangeAction(): IEntityAction {
            throw new Error("tryChangeAction used");
        }
        public updateState() {
            throw new Error("RandomizeState used");
        }
    }

    export class PlayerControlAction extends BaseAction {


        private _buttonStates = {
            Up: false,
            Down: false,
            Left: false,
            Right: false,
            Fire: false
        };

        constructor(entity: Core.Entity) {
            super(entity);
        }

        public update(delta: number) {

        }
    }

    export class IdleAction extends EnemyAction {

        private _nextCheck: number;

        private _turnSpeed: number = 5;
        private _moveSpeed: number = 10;

        constructor(entity: Core.Entity) {
            super(entity);
            //console.log("IDLE Action");
        }

        public updateState(max: number = 4) {

            // 60% Chance to Change States
            if (Math.random() > 0.4) {
                this.state = Math.floor(Math.random() * max);
            }

            // 40% Chance to change Values
            if (Math.random() > 0.6 || !this._turnSpeed || !this._moveSpeed) {
                this._turnSpeed = game.Difficulty.EnemySpeedFactor * (this._entity.options.angleSpeed * (Math.random() * 0.1 + 0.1));
                this._turnSpeed = Math.random() > 0.5 ? -this._turnSpeed : this._turnSpeed;
                this._moveSpeed = game.Difficulty.EnemySpeedFactor * (this._entity.options.moveSpeed * (Math.random() * 0.2 + 0.4));
            }
        }

        public update(delta: number) {

            // Call inner
            this.innerUpdate(delta);

            // State 0 = Doing Nothing 
            // State 1 = Moving Forward
            // State 2 = Turning somewhere
            // State 3 = Moving Curved
            var a = this._entity.rotation.angle;
            switch (this.state) {
                case 3: { // Rotate and Move
                    this._entity.rotation.angle = (this._entity.rotation.angle + (this._turnSpeed * delta)) % 360;
                    this._entity.moveForward(this._moveSpeed * delta);
                    break;
                }
                case 2: { // Rotate
                    this._entity.rotation.angle = (this._entity.rotation.angle + (this._turnSpeed * delta)) % 360;
                    break;
                }
                case 1: { // Move
                    this._entity.moveForward(this._moveSpeed * delta);
                    break;
                }
            }
        }

        public tryChangeAction(): IEntityAction {

            // There is a player?
            if (game.Player) {

                // Took Damage?
                if (this._entity.hp < this._entity.hpMax) {
                    return new ApproachAction(this._entity);
                }

                // Get Distance to Player
                var distance = this.DistanceToPlayer;
                var distanceThreshold = 420;

                if (distance < distanceThreshold && Math.random() + 0.2 > distance / distanceThreshold) {
                    return new ApproachAction(this._entity);
                }
            }
            return null;
        }
    }

    export class ApproachAction extends EnemyAction {

        private _turnSpeed: number = 1;
        private _moveSpeed: number = 20;
        private _distortedTarget: Core.Position = null;
        private _left: boolean = false;

        constructor(entity: Core.Entity) {
            super(entity);

            if (Math.random() > 0.5) {
                this._left = true;
            }

            this._checkFactor = 0.8;
            this._checkMin = 0.6;

            // Tell the world!
            //console.log("APPROACH Action");
        }

        public rerollDistortion() {

            if (game.Player) {

                // Get RealDistance to player
                var distance = this.DistanceToPlayer;

                // Calculate distortion distance
                var distortionFactor = 5 + (Math.random() * distance * 0.4);
                //console.log("Left", this._left, "Distance", distance, "Distortion", distortionFactor);

                // Calculate distortion direction
                var distortionAngle = (this._left) ? this.AngleToPlayer - 90 : this.AngleToPlayer + 90;

                // Create distorted Position
                this._distortedTarget = game.Player.position.clone().displaceDirection(
                    distortionFactor,
                    distortionAngle);
            }
            else {

                // Zero Distortion by default
                this._distortedTarget = new Core.Position(0, 0);
            }
        }

        public updateState(max: number = 3) {

            if (!this._distortedTarget) {
                this.rerollDistortion();
            }

            if (game.Player) {

                // Get RealDistance to player
                var distance = this.DistanceToPlayer;

                // Get Angle Offset
                var angleOffset = Core.Tools.GetAngleOffsetByPosition(this._entity.position, this._distortedTarget, this._entity.rotation);                
                var absAngle = Math.abs(angleOffset);

                // REALLY Close?
                // Turn fast, move normal
                if (distance < 60) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.6 + 1.0);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.6);
                }
                else if (distance < 120) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.4 + 0.6);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.6);
                }
                // WRONG Facing
                // Turn Quick, move slow
                else if (Math.abs(angleOffset) > 30) {                    
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.4 + 0.6);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.2 + 0.3);
                }
                // Somewhat Close
                // Turn slowly, to offer evade chances, but move quick
                else if (distance < 150) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.2 + 0.3);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.8);
                }                
                // Everything else...
                else {
                    // Turn normal
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.3 + 0.4);

                    // Move normal
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.6);
                }

                // Invert TurnAngle?
                this._turnSpeed = (angleOffset - 180 > 0) ? -this._turnSpeed : this._turnSpeed;

                // Apply Difficulty
                this._turnSpeed *= game.Difficulty.EnemySpeedFactor;
                this._moveSpeed *= game.Difficulty.EnemySpeedFactor;
            }
        }

        public update(delta: number) {

            // Call Inner
            this.innerUpdate(delta);

            // Update Attack State
            this._entity.isAttacking = (game.Player && this._entity.canAttack(game.Player.position));

            // Face 
            this._entity.face(this._distortedTarget, this._turnSpeed * delta);

            // Move Forward
            this._entity.moveForward((!this._entity.isAttacking) ? (delta * this._moveSpeed) : (delta * this._moveSpeed * 0.1));
        }

        public tryChangeAction(): IEntityAction {

            // Get Distance to Player
            var distance = this.DistanceToPlayer;

            // Distance too high...
            if (distance > 480 && this._entity.hp == this._entity.hpMax) {

                // ... get Idle again
                return new IdleAction(this._entity);
            }
            // Keep on Chasing!
            else {
                // Reroll Distorion
                this.rerollDistortion();

                // Return nothing
                return null;
            }
        }
    }
}
