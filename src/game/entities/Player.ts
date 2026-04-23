/**
 * The player entity.
 *
 * Ported to PixiJS v7. Movement maths unchanged. Super (Entity) now owns
 * an AnimatedSprite rather than a createjs.Sprite; the spawning fade-in
 * overrides work identically because both expose `.alpha`.
 */

import type { Container } from "pixi.js";
import ko from "knockout";
import { Config } from "../Config";
import { game } from "../state";
import { Tools } from "../Tools";
import { Entity } from "./Entity";

export class Player extends Entity {
    constructor(container: Container) {
        super(container, {
            size: 36,
            moveSpeed: 90 / 1000,
            name: "Player",
            regX: 18,
            regY: 15,
            pointValue: 0,
            scale: 1,
            x: Config.Game.Width / 2,
            y: Config.Game.Height / 2,
        });

        this.hp = 100;
        this.hpMax = 100;
        this.HP = ko.observable(100);
        this.HPMax = ko.observable(100);
    }

    public override update(d: number): void {
        // Spawning
        if (this._spawning && this.DisplayObject) {
            this.DisplayObject.alpha += 0.025;
            if (this.DisplayObject.alpha >= 1) {
                this._spawning = false;
            }
        }

        // Facing cursor
        this.rotation.angle = Tools.GetAngle(this.position, game.Input.CursorPosition);

        const distance = (this.options.moveSpeed ?? 0) * d;
        const distanceDiagonal = distance * 0.707;

        const getAngleFactor = (directionAngle: number): number => {
            const angleDistance = Tools.GetAngleOffset(this.rotation.angle, directionAngle, 360);
            return 1 - (Math.abs(angleDistance) / 180) * 0.4;
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

        this.position.crop(Config.Game.Width - 20, Config.Game.Height - 20, 20, 20);
        this.updateDisplayElement();
    }
}
