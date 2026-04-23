/**
 * Base entity class - shared by zombies, the player, and anything else
 * that owns a sprite on the EaselJS display tree.
 *
 * Ported from Core.Entity in the legacy app.ts. Game behaviour is identical.
 */

import "createjs-module";
import ko from "knockout";
import { Config } from "../Config";
import type { IEnemyOptions, IEntityAction, IEntityBase } from "../interfaces";
import { Position, Rotation } from "../Position";
import { SpriteSheets } from "../SpriteSheetData";
import { game } from "../state";
import { Tools } from "../Tools";
import { IdleAction } from "../Actions";

export class Entity implements IEntityBase {
    private _displayElement: createjs.DisplayObject | undefined;
    public get DisplayObject(): createjs.DisplayObject | undefined {
        return this._displayElement;
    }

    private _action: IEntityAction;
    public get Action(): IEntityAction {
        return this._action;
    }

    public hp: number = 100;
    public hpMax: number = 100;

    public HP: ko.Observable<number> | undefined;
    public HPMax: ko.Observable<number> | undefined;

    public guid: string = "";

    public position: Position = new Position();
    public rotation: Rotation = new Rotation();

    private _deathTime: number = 0;
    public _spawning: boolean = true;

    public options: IEnemyOptions;

    public isAttacking: boolean = false;
    public lastAttack: number = 0;

    private _container: createjs.Container | undefined;

    constructor(container: createjs.Container, entityOptions: IEnemyOptions) {
        this._container = container;

        // Options
        this.options = entityOptions;

        // Random facing
        this.rotation.angle = Math.random() * 360;

        // Positioned via options or random
        this.position.x = entityOptions.x ?? Math.random() * Config.Game.Width;
        this.position.y = entityOptions.y ?? Math.random() * Config.Game.Height;

        // Sprite
        this.createElement();
        this.updateDisplayElement();

        // Health (scaled by difficulty)
        const hp = Math.floor((50 + Math.random() * 100) * game.Difficulty.EnemyHealthFactor);
        this.hp = hp;
        this.hpMax = hp;

        // Default behaviour
        this._action = new IdleAction(this);
    }

    public setAction(action: IEntityAction): void {
        this._action = action;
    }

    public addHealth(amount: number, splatterHealth: boolean = false): void {
        if (amount > 0 && this.hp < this.hpMax) {
            this.hp = amount + this.hp > this.hpMax ? this.hpMax : this.hp + amount;

            if (this.HP) this.HP(this.hp);

            if (splatterHealth) {
                // TODO: splatter health effect
            }
        }
    }

    public addDamage(amount: number, _splatterBlood: boolean = true): void {
        if (amount > 0) {
            // Cap by remaining HP
            amount = amount > this.hp ? this.hp : amount;

            if (amount > 0) {
                this.hp -= amount;

                // Splatter blood in a small random ring
                for (let i = 0; i < amount; i += 40) {
                    const randomAngle = Math.random() * (Math.PI * 2);
                    const randomDistance = Math.random() * 0.6 * this.options.size;

                    const y = this.position.y + randomDistance * Math.sin(randomAngle);
                    const x = this.position.x + randomDistance * Math.cos(randomAngle);

                    game.splatterBlood(x, y);
                }

                if (this.HP) this.HP(this.hp);
            }
        }
    }

    public hasDied(): boolean {
        return this.hp <= 0 && this._deathTime > 60;
    }

    public updateDisplayElement(): void {
        if (this._displayElement) {
            this._displayElement.rotation = this.rotation.angle % 360;
            this._displayElement.x = this.position.x;
            this._displayElement.y = this.position.y;
        }
    }

    public removeElement(): void {
        if (this._displayElement && this._container) {
            this._container.removeChild(this._displayElement);
            this._container = undefined;
            this._displayElement = undefined;
        }
    }

    private createElement(): void {
        if (this._container && !this._displayElement) {
            // SpriteSheet lookup by name - preserves the legacy dispatch
            // through UndeadInvasion.Data.SpriteSheets[name]()
            const name = this.options.name ?? "Zombie";
            const sheetFactory = (SpriteSheets as unknown as Record<string, () => createjs.SpriteSheet>)[name];
            if (typeof sheetFactory !== "function") {
                throw new Error(`Unknown sprite sheet: ${name}`);
            }
            const sheet = sheetFactory.call(SpriteSheets);

            const d = new createjs.Sprite(sheet, "run");
            d.alpha = 0;
            d.regX = this.options.regX;
            d.regY = this.options.regY;
            d.x = this.position.x;
            d.y = this.position.y;
            this._displayElement = d;
            this._container.addChild(d);
        }
    }

    public canAttack(position: Position): boolean {
        if (Tools.GetDistance(position, this.position) < this.options.size * 0.8) {
            return Math.abs(Tools.GetAngleOffsetByPosition(this.position, position, this.rotation)) < 90;
        } else {
            return false;
        }
    }

    public updateAttack(d: number): void {
        this.lastAttack += d;
        if (this.isAttacking && this.lastAttack > 800) {
            this.lastAttack = 0;
            this.attack();
        }
    }

    public attack(): void {
        if (game.Player) {
            const dmg = Math.round((6 + Math.random() * 2) * game.Difficulty.EnemyDamageFactor);
            game.Player.addDamage(dmg);
        }
    }

    public update(delta: number): void {
        // Spawning fade-in
        if (this._spawning && this._displayElement) {
            this._displayElement.alpha += 0.025;
            if (this._displayElement.alpha >= 1) {
                this._spawning = false;
            }
        }

        if (this.hp > 0) {
            this._action.update(delta);
            this.updateAttack(delta);
            this.position.overLoop(Config.Game.Width, Config.Game.Height, 40, 40);
            this.updateDisplayElement();
        } else {
            this._deathTime += delta;
        }
    }

    public face(position: Position, maxAngle: number): void {
        const angle = Tools.GetAngle(this.position, position);
        let angleOffset = Tools.GetAngleOffset(angle, this.rotation.angle);

        if (angleOffset > 0 && angleOffset > maxAngle) {
            angleOffset = maxAngle;
        } else if (angleOffset < 0 && angleOffset < -maxAngle) {
            angleOffset = -maxAngle;
        }

        this.rotation.angle += angleOffset;
    }

    public moveForward(distance: number): void {
        if (distance) {
            const convertedAngle = (this.rotation.angle / 360) * (Math.PI * 2);
            this.position.y -= distance * Math.sin(convertedAngle);
            this.position.x -= distance * Math.cos(convertedAngle);
        }
    }
}
