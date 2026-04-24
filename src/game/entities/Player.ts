/**
 * The player entity.
 *
 * Movement maths unchanged from the legacy build; all tunable values now
 * come from Config.Player (size, speed, HP, diagonal factor, backward
 * penalty, sprite pivot, world crop margin).
 */

import type { Container } from "pixi.js";
import { Config } from "../Config";
import { signal } from "../../signals";
import { game } from "../state";
import { Tools } from "../Tools";
import { Entity } from "./Entity";

export class Player extends Entity {
    constructor(container: Container) {
        super(container, {
            size: Config.Player.Size,
            moveSpeed: Config.Player.MoveSpeedPxPerMs,
            name: "Player",
            regX: Config.Player.RegX,
            regY: Config.Player.RegY,
            pointValue: 0,
            scale: 1,
            x: Config.World.Width / 2,
            y: Config.World.Height / 2,
        });

        this.hp = Config.Player.HpMax;
        this.hpMax = Config.Player.HpMax;
        this.HP = signal(Config.Player.HpMax);
        this.HPMax = signal(Config.Player.HpMax);
    }

    public override update(d: number): void {
        // Spawning fade-in (legacy alpha-per-frame, not time-normalised)
        if (this._spawning && this.DisplayObject) {
            this.DisplayObject.alpha += Config.Enemy.SpawnFadeInPerFrame;
            if (this.DisplayObject.alpha >= 1) {
                this._spawning = false;
            }
        }

        // Facing cursor
        this.rotation.angle = Tools.GetAngle(this.position, game.Input.CursorPosition);

        const distance = (this.options.moveSpeed ?? 0) * d;
        const distanceDiagonal = distance * Config.Player.DiagonalFactor;

        // Speed penalty for moving away from facing direction
        const getAngleFactor = (directionAngle: number): number => {
            const angleDistance = Tools.GetAngleOffset(this.rotation.angle, directionAngle, 360);
            return 1 - (Math.abs(angleDistance) / 180) * Config.Player.BackwardSpeedPenalty;
        };
        let runspeedFactor = 1;

        // UP
        if (game.Input.Up.Clicked && !game.Input.Down.Clicked) {
            if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                runspeedFactor = getAngleFactor(45);
                this.position.y -= runspeedFactor * distanceDiagonal;
                this.position.x -= runspeedFactor * distanceDiagonal;
            } else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                runspeedFactor = getAngleFactor(135);
                this.position.y -= runspeedFactor * distanceDiagonal;
                this.position.x += runspeedFactor * distanceDiagonal;
            } else {
                runspeedFactor = getAngleFactor(90);
                this.position.y -= runspeedFactor * distance;
            }
        }
        // DOWN
        else if (!game.Input.Up.Clicked && game.Input.Down.Clicked) {
            if (game.Input.Left.Clicked && !game.Input.Right.Clicked) {
                runspeedFactor = getAngleFactor(315);
                this.position.y += runspeedFactor * distanceDiagonal;
                this.position.x -= runspeedFactor * distanceDiagonal;
            } else if (!game.Input.Left.Clicked && game.Input.Right.Clicked) {
                runspeedFactor = getAngleFactor(-135);
                this.position.y += runspeedFactor * distanceDiagonal;
                this.position.x += runspeedFactor * distanceDiagonal;
            } else {
                runspeedFactor = getAngleFactor(-90);
                this.position.y += runspeedFactor * distance;
            }
        }
        // RIGHT
        else if (game.Input.Right.Clicked && !game.Input.Left.Clicked) {
            runspeedFactor = getAngleFactor(180);
            this.position.x += runspeedFactor * distance;
        }
        // LEFT
        else if (!game.Input.Right.Clicked && game.Input.Left.Clicked) {
            runspeedFactor = getAngleFactor(0);
            this.position.x -= runspeedFactor * distance;
        }

        const m = Config.Player.CropMargin;
        this.position.crop(Config.World.Width - m, Config.World.Height - m, m, m);
        this.updateDisplayElement();
    }
}
