/// <reference path="Game.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Actions;
(function (Actions) {
    var BaseAction = (function () {
        function BaseAction(entity) {
            this._entity = entity;
        }
        BaseAction.prototype.update = function (delta) {
            throw new Error("BaseAction used");
        };
        return BaseAction;
    })();
    Actions.BaseAction = BaseAction;

    var EnemyAction = (function (_super) {
        __extends(EnemyAction, _super);
        // Ctor
        function EnemyAction(entity) {
            _super.call(this, entity);
            this._checkMin = 1;
            this._checkFactor = 1;
            this._checkNext = 0.5;
            this.state = 0;
            // Cache Values
            this._distanceToPlayer = null;
            this._angleToPlayer = null;
            this._angleOffsetToPlayer = null;
            this.updateState();
            this.resetNextCheck();
        }
        Object.defineProperty(EnemyAction.prototype, "DistanceToPlayer", {
            get: // Cache Getters
            function () {
                if (!game.Player) {
                    return 10000000;
                }
                if (this._distanceToPlayer == null) {
                    this._distanceToPlayer = Core.Tools.GetDistance(this._entity.position, game.Player.position);
                }
                return this._distanceToPlayer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnemyAction.prototype, "AngleToPlayer", {
            get: function () {
                if (!game.Player) {
                    return 0;
                }
                if (this._angleToPlayer == null) {
                    this._angleToPlayer = Core.Tools.GetAngle(this._entity.position, game.Player.position);
                }
                return this._angleToPlayer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EnemyAction.prototype, "AngleOffsetToPlayer", {
            get: function () {
                if (!game.Player) {
                    return 0;
                }
                if (this._angleOffsetToPlayer == null) {
                    this._angleOffsetToPlayer = Core.Tools.GetAngleOffsetByPosition(this._entity.position, game.Player.position, this._entity.rotation);
                }
                return this._angleOffsetToPlayer;
            },
            enumerable: true,
            configurable: true
        });

        EnemyAction.prototype.innerUpdate = function (delta) {
            // Reset Cached Values
            this._distanceToPlayer = null;
            this._angleOffsetToPlayer = null;
            this._angleToPlayer = null;

            // Every X ticks... try to change action
            this.checkForStateChange(delta);
            this.updateState();
        };

        EnemyAction.prototype.resetNextCheck = function () {
            this._checkNext = this._checkMin + (Math.random() * this._checkFactor);
        };

        EnemyAction.prototype.checkForStateChange = function (delta) {
            this._checkNext -= delta / 1000;
            if (this._checkNext <= 0) {
                // Get the next Action
                // ... and apply it if its not null
                var action = this.tryChangeAction();
                if (action) {
                    this._entity.setAction(action);
                } else {
                    this.updateState();
                    this._checkNext = this._checkMin;
                }
            }
        };

        // Virtuals
        EnemyAction.prototype.tryChangeAction = function () {
            throw new Error("tryChangeAction used");
        };
        EnemyAction.prototype.updateState = function () {
            throw new Error("RandomizeState used");
        };
        return EnemyAction;
    })(BaseAction);
    Actions.EnemyAction = EnemyAction;

    var PlayerControlAction = (function (_super) {
        __extends(PlayerControlAction, _super);
        function PlayerControlAction(entity) {
            _super.call(this, entity);
            this._buttonStates = {
                Up: false,
                Down: false,
                Left: false,
                Right: false,
                Fire: false
            };
        }
        PlayerControlAction.prototype.update = function (delta) {
        };
        return PlayerControlAction;
    })(BaseAction);
    Actions.PlayerControlAction = PlayerControlAction;

    var IdleAction = (function (_super) {
        __extends(IdleAction, _super);
        function IdleAction(entity) {
            _super.call(this, entity);
            this._turnSpeed = 5;
            this._moveSpeed = 10;
            //console.log("IDLE Action");
        }
        IdleAction.prototype.updateState = function (max) {
            if (typeof max === "undefined") { max = 4; }
            if (Math.random() > 0.4) {
                this.state = Math.floor(Math.random() * max);
            }

            if (Math.random() > 0.6 || !this._turnSpeed || !this._moveSpeed) {
                this._turnSpeed = game.Difficulty.EnemySpeedFactor * (this._entity.options.angleSpeed * (Math.random() * 0.1 + 0.1));
                this._turnSpeed = Math.random() > 0.5 ? -this._turnSpeed : this._turnSpeed;
                this._moveSpeed = game.Difficulty.EnemySpeedFactor * (this._entity.options.moveSpeed * (Math.random() * 0.2 + 0.4));
            }
        };

        IdleAction.prototype.update = function (delta) {
            // Call inner
            this.innerUpdate(delta);

            // State 0 = Doing Nothing
            // State 1 = Moving Forward
            // State 2 = Turning somewhere
            // State 3 = Moving Curved
            var a = this._entity.rotation.angle;
            switch (this.state) {
                case 3: {
                    this._entity.rotation.angle = (this._entity.rotation.angle + (this._turnSpeed * delta)) % 360;
                    this._entity.moveForward(this._moveSpeed * delta);
                    break;
                }
                case 2: {
                    this._entity.rotation.angle = (this._entity.rotation.angle + (this._turnSpeed * delta)) % 360;
                    break;
                }
                case 1: {
                    this._entity.moveForward(this._moveSpeed * delta);
                    break;
                }
            }
        };

        IdleAction.prototype.tryChangeAction = function () {
            if (game.Player) {
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
        };
        return IdleAction;
    })(EnemyAction);
    Actions.IdleAction = IdleAction;

    var ApproachAction = (function (_super) {
        __extends(ApproachAction, _super);
        function ApproachAction(entity) {
            _super.call(this, entity);
            this._turnSpeed = 1;
            this._moveSpeed = 20;
            this._distortedTarget = null;
            this._left = false;

            if (Math.random() > 0.5) {
                this._left = true;
            }

            this._checkFactor = 0.8;
            this._checkMin = 0.6;
            // Tell the world!
            //console.log("APPROACH Action");
        }
        ApproachAction.prototype.rerollDistortion = function () {
            if (game.Player) {
                // Get RealDistance to player
                var distance = this.DistanceToPlayer;

                // Calculate distortion distance
                var distortionFactor = 5 + (Math.random() * distance * 0.4);

                //console.log("Left", this._left, "Distance", distance, "Distortion", distortionFactor);
                // Calculate distortion direction
                var distortionAngle = (this._left) ? this.AngleToPlayer - 90 : this.AngleToPlayer + 90;

                // Create distorted Position
                this._distortedTarget = game.Player.position.clone().displaceDirection(distortionFactor, distortionAngle);
            } else {
                // Zero Distortion by default
                this._distortedTarget = new Core.Position(0, 0);
            }
        };

        ApproachAction.prototype.updateState = function (max) {
            if (typeof max === "undefined") { max = 3; }
            if (!this._distortedTarget) {
                this.rerollDistortion();
            }

            if (game.Player) {
                // Get RealDistance to player
                var distance = this.DistanceToPlayer;

                // Get Angle Offset
                var angleOffset = Core.Tools.GetAngleOffsetByPosition(this._entity.position, this._distortedTarget, this._entity.rotation);
                var absAngle = Math.abs(angleOffset);

                if (distance < 60) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.6 + 1.0);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.6);
                } else if (distance < 120) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.4 + 0.6);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.6);
                } else if (Math.abs(angleOffset) > 30) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.4 + 0.6);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.2 + 0.3);
                } else if (distance < 150) {
                    this._turnSpeed = this._entity.options.angleSpeed * (Math.random() * 0.2 + 0.3);
                    this._moveSpeed = this._entity.options.moveSpeed * (Math.random() * 0.4 + 0.8);
                } else {
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
        };

        ApproachAction.prototype.update = function (delta) {
            // Call Inner
            this.innerUpdate(delta);

            // Update Attack State
            this._entity.isAttacking = (game.Player && this._entity.canAttack(game.Player.position));

            // Face
            this._entity.face(this._distortedTarget, this._turnSpeed * delta);

            // Move Forward
            this._entity.moveForward((!this._entity.isAttacking) ? (delta * this._moveSpeed) : (delta * this._moveSpeed * 0.1));
        };

        ApproachAction.prototype.tryChangeAction = function () {
            // Get Distance to Player
            var distance = this.DistanceToPlayer;

            if (distance > 480 && this._entity.hp == this._entity.hpMax) {
                // ... get Idle again
                return new IdleAction(this._entity);
            } else {
                // Reroll Distorion
                this.rerollDistortion();

                // Return nothing
                return null;
            }
        };
        return ApproachAction;
    })(EnemyAction);
    Actions.ApproachAction = ApproachAction;
})(Actions || (Actions = {}));
//# sourceMappingURL=Actions.js.map
