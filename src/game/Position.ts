/**
 * Position and Rotation value objects.
 *
 * Ported from the legacy Core.Position / Core.Rotation classes in app.ts.
 * Behaviour is identical; only the namespace wrapper is gone.
 */

import { Tools } from "./Tools";

export class Rotation {
    constructor(private _angle: number = 0) {}

    public get angle(): number {
        return this._angle;
    }

    public set angle(v: number) {
        this._angle = v >= 360 ? v % 360 : v;
    }
}

export class Position {
    constructor(
        private _x: number = 0,
        private _y: number = 0,
    ) {}

    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }
    public set x(v: number) {
        this._x = v;
    }
    public set y(v: number) {
        this._y = v;
    }

    public overLoop(ox: number, oy: number, mx: number, my: number): void {
        this._x = Tools.GetOverLoopValue(this._x, ox, -mx, mx);
        this._y = Tools.GetOverLoopValue(this._y, oy, -my, my);
    }

    public crop(maxX: number, maxY: number, minX: number = 0, minY: number = 0): void {
        if (this._x < minX) this._x = minX;
        else if (this._x > maxX) this._x = maxX;

        if (this._y < minY) this._y = minY;
        else if (this._y > maxY) this._y = maxY;
    }

    public clone(): Position {
        return new Position(this.x, this.y);
    }

    public displaceDirection(distance: number, angle: number): Position {
        if (distance && angle) {
            const convertedAngle = (angle / 360) * (Math.PI * 2);
            this.y -= distance * Math.sin(convertedAngle);
            this.x -= distance * Math.cos(convertedAngle);
        }
        return this;
    }
}
