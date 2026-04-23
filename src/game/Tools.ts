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

    /**
     * Convert degrees (the game's internal rotation unit) to radians
     * (what PixiJS expects on sprite.rotation).
     */
    public static DegToRad(deg: number): number {
        return (deg * Math.PI) / 180;
    }

    /**
     * Closest distance from the line segment A->B to point P, plus the
     * parameter t (0..1) of the closest point on the segment.
     *
     * Core primitive for swept bullet-vs-entity collision: given a
     * bullet's previous and current position as a segment, and an
     * enemy as a point (with a radius added later), this returns the
     * minimum distance the bullet came to the enemy during the frame.
     * If that distance is less than (bulletRadius + enemyRadius),
     * it's a hit somewhere along the segment.
     */
    public static GetSegmentPointDistance(a: Position, b: Position, p: Position): { distance: number; t: number } {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const apx = p.x - a.x;
        const apy = p.y - a.y;
        const lenSq = abx * abx + aby * aby;

        if (lenSq === 0) {
            // Degenerate segment - bullet didn't move this frame
            const dx = p.x - a.x;
            const dy = p.y - a.y;
            return { distance: Math.sqrt(dx * dx + dy * dy), t: 0 };
        }

        let t = (apx * abx + apy * aby) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const cx = a.x + t * abx;
        const cy = a.y + t * aby;
        const dx = p.x - cx;
        const dy = p.y - cy;
        return { distance: Math.sqrt(dx * dx + dy * dy), t };
    }
}
