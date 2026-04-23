/**
 * Projectile - flies forward, checks collision against enemies, deals
 * damage, spawns blood, then despawns when out of bounds / damage / life.
 *
 * Step 2 of the PixiJS modernisation replaces the former 15px substep
 * collision loop with a single per-frame swept segment-vs-point test.
 * The segment (previous position -> current position) is checked against
 * every entity using Tools.GetSegmentPointDistance, hits are sorted by
 * their t-parameter (travel order), and damage is applied until the
 * bullet's remaining damage depletes - at which point the bullet is
 * clipped to the hit position. This fixes the known "fast bullets pass
 * through thin targets" bug: previously a Phaser bullet (2500 px/s,
 * ~42px per frame) could walk past a 24px zombie between its substep
 * samples. Now any intersection anywhere along the travel segment is
 * caught.
 */

import { Container, Sprite } from "pixi.js";
import { getTexture } from "./assets";
import { Config } from "./Config";
import type { IBullet } from "./interfaces";
import { Position, Rotation } from "./Position";
import { game } from "./state";
import { Tools } from "./Tools";
import type { Entity } from "./entities/Entity";

export class Bullet {
    private _sprite: Sprite | undefined;
    private _container: Container | undefined;
    private _settings: IBullet;
    private _hitList: Entity[] = [];

    private _origin: Position;
    private _position: Position;
    private _rotation: Rotation;
    private _lifeTime: number;

    private _remainingDamage: number;

    constructor(options: IBullet, x: number, y: number, baseAngle: number, c: Container) {
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

        this._rotation = new Rotation(this._settings.Angle + baseAngle);
        this._position = new Position(x, y);

        // Nudge forward so the bullet doesn't spawn inside the player sprite
        this.moveForward(18);

        this._origin = new Position(this._position.x, this._position.y);

        // Bullet sprite
        const texture = getTexture(`Images/bullet_${this._settings.Type}.png`);
        const sprite = new Sprite(texture);
        sprite.pivot.set(8, 8);
        sprite.x = this._origin.x;
        sprite.y = this._origin.y;
        sprite.rotation = Tools.DegToRad(this._rotation.angle);
        this._sprite = sprite;
        this._container.addChild(sprite);

        this._remainingDamage = this._settings.DamageMax;
    }

    public get angle(): number {
        return this._rotation.angle;
    }
    public set angle(a: number) {
        this._rotation.angle = a;
        if (this._sprite) this._sprite.rotation = Tools.DegToRad(a);
    }

    public set scale(s: number) {
        if (this._sprite) this._sprite.scale.set(s, s);
    }
    public get scale(): number {
        return this._sprite?.scale.x ?? 0;
    }

    public update(d: number): void {
        this._lifeTime -= d;

        if (!this._sprite) return;

        if (this._lifeTime > 0) {
            // Fade
            if (this._settings.FadeFactor !== 1) {
                this._sprite.alpha *= 1 - (d / 1000) * (this._settings.FadeFactor ?? 1);
            }

            // Scale
            if (this._settings.ScaleFactor !== 1) {
                const sf = this._settings.ScaleFactor ?? 1;
                this._sprite.scale.x *= Math.sqrt(sf);
                this._sprite.scale.y *= Math.sqrt(sf);
            }

            // Adjust speed
            this._settings.Speed *= this._settings.SpeedFactor ?? 1;

            // Swept collision: take the full frame's travel as one segment,
            // test every entity, process hits in travel order.
            const prevPos = new Position(this._position.x, this._position.y);
            const moveDistance = (this._settings.Speed / 1000) * d;
            this.moveForward(moveDistance);
            const curPos = new Position(this._position.x, this._position.y);

            this.sweptCollision(prevPos, curPos);
        }
        this.removeIfVanished();
    }

    /**
     * Check the line segment (a -> b) against every entity, accumulate
     * hits sorted by distance along the segment, apply damage in order
     * until remaining damage reaches zero. If the bullet stops on a hit,
     * clip its visual position to that point so it doesn't overshoot.
     */
    private sweptCollision(a: Position, b: Position): void {
        const hits: Array<{ entity: Entity; t: number }> = [];

        for (const entityBase of game.Entities) {
            const enemy = entityBase as Entity;

            // Gatekeeping: only Entity instances with live HP and not already hit
            if (
                enemy.hasDied() ||
                this._hitList.indexOf(enemy) !== -1 ||
                typeof enemy.addDamage !== "function" ||
                enemy.options === undefined
            ) {
                continue;
            }

            const { distance, t } = Tools.GetSegmentPointDistance(a, b, enemy.position);
            const hitRadius = this._settings.Size + enemy.options.size * 0.4;
            if (distance < hitRadius) {
                hits.push({ entity: enemy, t });
            }
        }

        // Process in travel order (closer hits first)
        hits.sort((h1, h2) => h1.t - h2.t);

        for (const { entity, t } of hits) {
            if (this._remainingDamage <= 0) break;
            this.hitEntity(entity);

            if (this._remainingDamage <= 0) {
                // Bullet depleted mid-flight - clip visual position to the
                // hit point so high-damage projectiles don't overshoot the
                // kill when they're supposed to be absorbed.
                const clipX = a.x + t * (b.x - a.x);
                const clipY = a.y + t * (b.y - a.y);
                this._position.x = clipX;
                this._position.y = clipY;
                if (this._sprite) {
                    this._sprite.x = clipX;
                    this._sprite.y = clipY;
                }
                break;
            }
        }
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

            if (this._sprite) {
                this._sprite.x = this._position.x;
                this._sprite.y = this._position.y;
            }
        }
    }

    public removeIfVanished(): void {
        if (
            this._sprite &&
            (this._sprite.alpha <= 0 || this._lifeTime <= 0 || this.isOutOfBounds() || this._remainingDamage <= 0)
        ) {
            this.remove();
        }
    }

    public remove(): void {
        if (this._sprite && this._container) {
            this._container.removeChild(this._sprite);
            this._sprite.destroy();
            this._sprite = undefined;
        }
        if (this._container) {
            this._container = undefined;
        }
    }

    public isOutOfBounds(): boolean {
        if (!this._sprite) return true;
        return (
            this._sprite.x < -20 ||
            this._sprite.y < -20 ||
            this._sprite.x > Config.Game.Width + 20 ||
            this._sprite.y > Config.Game.Height + 20
        );
    }

    public isRemoved(): boolean {
        return !this._sprite;
    }

    // Expose origin/position for future trail rendering (step 10) and
    // for the swept-collision code in step 2.
    public get position(): Position {
        return this._position;
    }
    public get origin(): Position {
        return this._origin;
    }
}
