/**
 * Enemy AI behaviour tree - each Action is a tiny state machine that
 * updates the entity's movement and attack behaviour every tick.
 *
 * Ported from the legacy Scripts/Actions.ts module. Behaviour is unchanged;
 * only the namespace wrapper and global `game` reference are updated for
 * ES module scope. The Entity reference uses `import type` to avoid a
 * circular runtime dependency (Entity instantiates IdleAction in its
 * constructor, while Actions reference Entity only as a type).
 */

import type { IEntityAction } from "./interfaces";
import { Position } from "./Position";
import { game } from "./state";
import { Tools } from "./Tools";

import type { Entity } from "./entities/Entity";

export class BaseAction implements IEntityAction {
    public _entity: Entity;

    constructor(entity: Entity) {
        this._entity = entity;
    }

    public update(_delta: number): void {
        throw new Error("BaseAction used");
    }
}

export class EnemyAction extends BaseAction {
    public _checkMin: number = 1;
    public _checkFactor: number = 1;
    private _checkNext: number = 0.5;
    public state: number = 0;

    private _distanceToPlayer: number | null = null;
    private _angleToPlayer: number | null = null;
    private _angleOffsetToPlayer: number | null = null;

    public get DistanceToPlayer(): number {
        if (!game.Player) return 10000000;
        if (this._distanceToPlayer == null) {
            this._distanceToPlayer = Tools.GetDistance(this._entity.position, game.Player.position);
        }
        return this._distanceToPlayer;
    }

    public get AngleToPlayer(): number {
        if (!game.Player) return 0;
        if (this._angleToPlayer == null) {
            this._angleToPlayer = Tools.GetAngle(this._entity.position, game.Player.position);
        }
        return this._angleToPlayer;
    }

    public get AngleOffsetToPlayer(): number {
        if (!game.Player) return 0;
        if (this._angleOffsetToPlayer == null) {
            this._angleOffsetToPlayer = Tools.GetAngleOffsetByPosition(
                this._entity.position,
                game.Player.position,
                this._entity.rotation,
            );
        }
        return this._angleOffsetToPlayer;
    }

    constructor(entity: Entity) {
        super(entity);
        this.updateState();
        this.resetNextCheck();
    }

    public innerUpdate(delta: number): void {
        // Invalidate cached distance/angle so next access recomputes
        this._distanceToPlayer = null;
        this._angleOffsetToPlayer = null;
        this._angleToPlayer = null;

        this.checkForStateChange(delta);
        this.updateState();
    }

    public resetNextCheck(): void {
        this._checkNext = this._checkMin + Math.random() * this._checkFactor;
    }

    public checkForStateChange(delta: number): void {
        this._checkNext -= delta / 1000;
        if (this._checkNext <= 0) {
            const action = this.tryChangeAction();
            if (action) {
                this._entity.setAction(action);
            } else {
                this.updateState();
                this._checkNext = this._checkMin;
            }
        }
    }

    public tryChangeAction(): IEntityAction | null {
        throw new Error("tryChangeAction used");
    }

    public updateState(_max?: number): void {
        throw new Error("updateState used");
    }
}

export class PlayerControlAction extends BaseAction {
    constructor(entity: Entity) {
        super(entity);
    }

    public override update(_delta: number): void {
        // No-op - player movement handled directly by Player.update()
    }
}

export class IdleAction extends EnemyAction {
    private _turnSpeed: number = 5;
    private _moveSpeed: number = 10;

    constructor(entity: Entity) {
        super(entity);
    }

    public override updateState(max: number = 4): void {
        // 60% chance to change state
        if (Math.random() > 0.4) {
            this.state = Math.floor(Math.random() * max);
        }

        // 40% chance to re-roll speeds (or always if unset)
        if (Math.random() > 0.6 || !this._turnSpeed || !this._moveSpeed) {
            this._turnSpeed =
                game.Difficulty.EnemySpeedFactor *
                ((this._entity.options.angleSpeed ?? 0) * (Math.random() * 0.1 + 0.1));
            this._turnSpeed = Math.random() > 0.5 ? -this._turnSpeed : this._turnSpeed;
            this._moveSpeed =
                game.Difficulty.EnemySpeedFactor *
                ((this._entity.options.moveSpeed ?? 0) * (Math.random() * 0.2 + 0.4));
        }
    }

    public override update(delta: number): void {
        this.innerUpdate(delta);

        // State 0 - do nothing
        // State 1 - move forward
        // State 2 - rotate
        // State 3 - curve
        switch (this.state) {
            case 3: {
                this._entity.rotation.angle = (this._entity.rotation.angle + this._turnSpeed * delta) % 360;
                this._entity.moveForward(this._moveSpeed * delta);
                break;
            }
            case 2: {
                this._entity.rotation.angle = (this._entity.rotation.angle + this._turnSpeed * delta) % 360;
                break;
            }
            case 1: {
                this._entity.moveForward(this._moveSpeed * delta);
                break;
            }
        }
    }

    public override tryChangeAction(): IEntityAction | null {
        if (game.Player) {
            // Took damage -> approach
            if (this._entity.hp < this._entity.hpMax) {
                return new ApproachAction(this._entity);
            }

            // Player close enough -> maybe approach
            const distance = this.DistanceToPlayer;
            const distanceThreshold = 420;

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
    private _distortedTarget: Position | null = null;
    private _left: boolean = false;

    constructor(entity: Entity) {
        super(entity);

        if (Math.random() > 0.5) {
            this._left = true;
        }

        this._checkFactor = 0.8;
        this._checkMin = 0.6;
    }

    public rerollDistortion(): void {
        if (game.Player) {
            const distance = this.DistanceToPlayer;
            const distortionFactor = 5 + Math.random() * distance * 0.4;
            const distortionAngle = this._left ? this.AngleToPlayer - 90 : this.AngleToPlayer + 90;

            this._distortedTarget = game.Player.position.clone().displaceDirection(distortionFactor, distortionAngle);
        } else {
            this._distortedTarget = new Position(0, 0);
        }
    }

    public override updateState(_max: number = 3): void {
        if (!this._distortedTarget) {
            this.rerollDistortion();
        }

        if (game.Player && this._distortedTarget) {
            const distance = this.DistanceToPlayer;
            const angleOffset = Tools.GetAngleOffsetByPosition(
                this._entity.position,
                this._distortedTarget,
                this._entity.rotation,
            );

            const angleSpeed = this._entity.options.angleSpeed ?? 0;
            const moveSpeed = this._entity.options.moveSpeed ?? 0;

            // REALLY close - turn fast, move normal
            if (distance < 60) {
                this._turnSpeed = angleSpeed * (Math.random() * 0.6 + 1.0);
                this._moveSpeed = moveSpeed * (Math.random() * 0.4 + 0.6);
            } else if (distance < 120) {
                this._turnSpeed = angleSpeed * (Math.random() * 0.4 + 0.6);
                this._moveSpeed = moveSpeed * (Math.random() * 0.4 + 0.6);
            }
            // Wrong facing - turn quick, move slow
            else if (Math.abs(angleOffset) > 30) {
                this._turnSpeed = angleSpeed * (Math.random() * 0.4 + 0.6);
                this._moveSpeed = moveSpeed * (Math.random() * 0.2 + 0.3);
            }
            // Close-ish - slow turn, quick move (so player can evade)
            else if (distance < 150) {
                this._turnSpeed = angleSpeed * (Math.random() * 0.2 + 0.3);
                this._moveSpeed = moveSpeed * (Math.random() * 0.4 + 0.8);
            }
            // Otherwise - normal
            else {
                this._turnSpeed = angleSpeed * (Math.random() * 0.3 + 0.4);
                this._moveSpeed = moveSpeed * (Math.random() * 0.4 + 0.6);
            }

            // Invert turn direction if the other way is shorter
            this._turnSpeed = angleOffset - 180 > 0 ? -this._turnSpeed : this._turnSpeed;

            this._turnSpeed *= game.Difficulty.EnemySpeedFactor;
            this._moveSpeed *= game.Difficulty.EnemySpeedFactor;
        }
    }

    public override update(delta: number): void {
        this.innerUpdate(delta);

        this._entity.isAttacking = !!(game.Player && this._entity.canAttack(game.Player.position));

        if (this._distortedTarget) {
            this._entity.face(this._distortedTarget, this._turnSpeed * delta);
        }

        this._entity.moveForward(
            !this._entity.isAttacking ? delta * this._moveSpeed : delta * this._moveSpeed * 0.1,
        );
    }

    public override tryChangeAction(): IEntityAction | null {
        const distance = this.DistanceToPlayer;

        if (distance > 480 && this._entity.hp === this._entity.hpMax) {
            return new IdleAction(this._entity);
        } else {
            this.rerollDistortion();
            return null;
        }
    }
}
