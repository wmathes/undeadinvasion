/**
 * Geometry helpers.
 *
 * Ported verbatim from Core.Tools in the legacy app.ts. Pure functions;
 * no external dependencies beyond Position/Rotation.
 */

import type { Position, Rotation } from "./Position";

export class Tools {
    public static GetAngleOffsetByPosition(from: Position, to: Position, initialRotation: Rotation): number {
        const angleToTarget = this.GetAngle(from, to);
        return this.GetAngleOffset(angleToTarget, initialRotation.angle, 360);
    }

    public static GetAngleOffset(a: number, b: number, base: number = 360): number {
        let r = (a - b) % base;
        if (r > base / 2) {
            r -= base;
        } else if (r < -base / 2) {
            r += base;
        }
        return r;
    }

    public static GetAngleDistance(a: number, b: number, base: number = 360): number {
        a = a >= base ? a % base : a;
        b = b >= base ? b % base : b;

        let r = Math.abs(a - b);
        if (r > base / 2) {
            r = base - r;
        }
        return r;
    }

    // Nach Links    0
    // Nach Oben    90
    // Nach Rechts 180
    // Nach Unten  270
    public static GetAngle(from: Position, to: Position): number {
        let angle = Math.atan2(from.y - to.y, from.x - to.x);
        angle = angle * (180 / Math.PI);
        if (angle < 0) angle += 360;
        return angle;
    }

    public static GetDistance(from: Position, to: Position): number {
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static GetOverLoopValue(value: number, max: number, min: number, thresh: number): number {
        if (value > max + thresh) {
            return min;
        } else if (value < min - thresh) {
            return max;
        } else {
            return value;
        }
    }
}
