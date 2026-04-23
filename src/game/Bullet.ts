/**
 * Projectile - flies forward, checks collision against enemies, deals
 * damage, spawns blood, then despawns when out of bounds / damage / life.
 *
 * Ported from the legacy Scripts/Bullet.ts. Collision logic (small-step
 * movement + distance check) is preserved exactly. `game.Entities.each`
 * becomes `.forEach`; Sugar's each-with-early-return wasn't being used
 * (every callback returned true), so `.forEach` is a direct substitute.
 */

import "createjs-module";
import { Config } from "./Config";
import type { IBullet } from "./interfaces";
import { Position, Rotation } from "./Position";
import { game } from "./state";
import { Tools } from "./Tools";
import type { Entity } from "./entities/Entity";

export class Bullet {
    private _displayObject: createjs.DisplayObject | undefined;
    private _displayObjectTrail: createjs.Shape | undefined;
    private _container: createjs.Container | undefined;
    private _settings: IBullet;
    private _hitList: Entity[] = [];

    private _origin: Position;
    private _position: Position;
    private _rotation: Rotation;
    private _lifeTime: number;

    private _remainingDamage: number;

    constructor(options: IBullet, x: number, y: number, baseAngle: number, c: createjs.Container) {
        // Defaults
        options.TrailColor = options.TrailColor ?? ["#AAAAAA", "#222222"];
        options.Type = options.Type ?? "default";
        options.FadeFactor = options.FadeFactor ?? 1;
        options.ScaleFactor = options.ScaleFactor ?? 1;
        options.SpeedFactor = options.SpeedFactor ?? 1;
        options.TrailWidth = options.TrailWidth ?? 2;

        this._settings = options;
        this._lifeTime = this._settings.LifeTime;
        this._container = c;

        const path = "Images/bullet_" + this._settings.Type + ".png";

        this._rotation = new Rotation(this._settings.Angle + baseAngle);
        this._position = new Position(x, y);

        // Nudge forward so the bullet doesn't spawn inside the player sprite
        this.moveForward(18);

        this._origin = new Position(this._position.x, this._position.y);

        // Bullet sprite
        const ent = new createjs.Bitmap(path);
        ent.regX = 8;
        ent.regY = 8;
        ent.x = this._origin.x;
        ent.y = this._origin.y;
        ent.rotation = this._rotation.angle;
        this._displayObject = ent;

        // Trail shape (currently unused - the original draw call was commented out)
        const trail = new createjs.Shape();
        trail.x = 400;
        trail.y = 400;
        this._displayObjectTrail = trail;

        this._container.addChild(ent);
        this._container.addChild(trail);

        this._remainingDamage = this._settings.DamageMax;
    }

    public get angle(): number {
        return this._rotation.angle;
    }
    public set angle(a: number) {
        this._rotation.angle = a;
        if (this._displayObject) this._displayObject.rotation = a;
    }

    public set scale(s: number) {
        if (this._displayObject) {
            this._displayObject.scaleX = s;
            this._displayObject.scaleY = s;
        }
    }
    public get scale(): number {
        return this._displayObject?.scaleX ?? 0;
    }

    public update(d: number): void {
        this._lifeTime -= d;

        if (this._displayObject) {
            if (this._lifeTime > 0) {
                // Fade?
                if (this._settings.FadeFactor !== 1) {
                    this._displayObject.alpha *= 1 - (d / 1000) * (this._settings.FadeFactor ?? 1);
                }

                // Scale?
                if (this._settings.ScaleFactor !== 1) {
                    const sf = this._settings.ScaleFactor ?? 1;
                    this._displayObject.scaleX *= Math.sqrt(sf);
                    this._displayObject.scaleY *= Math.sqrt(sf);
                }

                // Adjust speed
                this._settings.Speed *= this._settings.SpeedFactor ?? 1;

                // Move in small steps, checking collision each step
                let move = (this._settings.Speed / 1000) * d;
                while (move > 0 && this._remainingDamage > 0) {
                    this.moveForward(move > 15 ? 15 : move);
                    this.checkCollision();
                    move -= 15;
                }
            }
            this.removeIfVanished();
        }
    }

    public checkCollision(): void {
        game.Entities.forEach((entity) => {
            // Bullets only hit Entity (zombies), not PowerUp. Distinguish
            // by feature rather than instanceof to avoid a circular import.
            const enemy = entity as Entity;
            if (
                this._remainingDamage > 0 &&
                !enemy.hasDied() &&
                this._hitList.indexOf(enemy) === -1 &&
                typeof enemy.addDamage === "function" &&
                enemy.options !== undefined &&
                this._displayObject
            ) {
                const distance = Tools.GetDistance(
                    new Position(this._displayObject.x, this._displayObject.y),
                    enemy.position,
                );

                if (distance < this._settings.Size + enemy.options.size * 0.4) {
                    this.hitEntity(enemy);
                }
            }
        });
    }

    public hitEntity(entity: Entity): void {
        const dmg = this._remainingDamage < this._settings.Damage ? this._remainingDamage : this._settings.Damage;
        entity.addDamage(dmg);
        this._remainingDamage -= dmg;
        this._hitList.push(entity);
    }

    public moveForward(distance: number): void {
        if (distance) {
            const convertedAngle = (this.angle / 360) * (Math.PI * 2);
            this._position.y -= distance * Math.sin(convertedAngle);
            this._position.x -= distance * Math.cos(convertedAngle);

            if (this._displayObject) {
                this._displayObject.x = this._position.x;
                this._displayObject.y = this._position.y;
            }
        }
    }

    public removeIfVanished(): void {
        if (
            this._displayObject &&
            (this._displayObject.alpha <= 0 ||
                this._lifeTime <= 0 ||
                this.isOutOfBounds() ||
                this._remainingDamage <= 0)
        ) {
            this.remove();
        }
    }

    public remove(): void {
        if (this._displayObject && this._container) {
            this._container.removeChild(this._displayObject);
            this._displayObject = undefined;
        }
        if (this._displayObjectTrail && this._container) {
            this._container.removeChild(this._displayObjectTrail);
            this._displayObjectTrail = undefined;
        }
        if (this._container) {
            this._container = undefined;
        }
    }

    public isOutOfBounds(): boolean {
        if (!this._displayObject) return true;
        return (
            this._displayObject.x < -20 ||
            this._displayObject.y < -20 ||
            this._displayObject.x > Config.Game.Width + 20 ||
            this._displayObject.y > Config.Game.Height + 20
        );
    }

    public isRemoved(): boolean {
        return !this._displayObject;
    }
}
