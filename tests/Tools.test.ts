/**
 * Pure geometry regression tests.
 *
 * These exercise the functions the bullet/AI code relies on most. They're
 * deliberately narrow: the goal is to catch accidental drift during the
 * Phase 2 module conversion and any future refactor, not to verify every
 * corner case of the math.
 */

import { describe, expect, test } from "bun:test";
import { Tools } from "../src/game/Tools";
import { Position, Rotation } from "../src/game/Position";

describe("Tools.GetDistance", () => {
    test("zero distance for same point", () => {
        const a = new Position(10, 20);
        const b = new Position(10, 20);
        expect(Tools.GetDistance(a, b)).toBe(0);
    });

    test("3-4-5 triangle", () => {
        const a = new Position(0, 0);
        const b = new Position(3, 4);
        expect(Tools.GetDistance(a, b)).toBe(5);
    });

    test("is symmetric", () => {
        const a = new Position(-7, 11);
        const b = new Position(5, -3);
        expect(Tools.GetDistance(a, b)).toBe(Tools.GetDistance(b, a));
    });
});

describe("Tools.GetAngle", () => {
    // The legacy comment in Tools.ts documents the expected directions:
    //   Nach Links    0        (to the left)
    //   Nach Oben    90        (upward)
    //   Nach Rechts 180        (to the right)
    //   Nach Unten  270        (downward)
    test("target to the left of origin -> 0 deg", () => {
        const from = new Position(100, 100);
        const to = new Position(0, 100);
        expect(Tools.GetAngle(from, to)).toBeCloseTo(0, 5);
    });

    test("target above origin -> 90 deg", () => {
        const from = new Position(100, 100);
        const to = new Position(100, 0);
        expect(Tools.GetAngle(from, to)).toBeCloseTo(90, 5);
    });

    test("target to the right of origin -> 180 deg", () => {
        const from = new Position(100, 100);
        const to = new Position(200, 100);
        expect(Tools.GetAngle(from, to)).toBeCloseTo(180, 5);
    });

    test("target below origin -> 270 deg", () => {
        const from = new Position(100, 100);
        const to = new Position(100, 200);
        expect(Tools.GetAngle(from, to)).toBeCloseTo(270, 5);
    });

    test("result is always in [0, 360)", () => {
        for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -5; dy <= 5; dy++) {
                if (dx === 0 && dy === 0) continue;
                const a = Tools.GetAngle(new Position(0, 0), new Position(dx, dy));
                expect(a).toBeGreaterThanOrEqual(0);
                expect(a).toBeLessThan(360);
            }
        }
    });
});

describe("Tools.GetAngleOffset", () => {
    test("zero when equal", () => {
        expect(Tools.GetAngleOffset(90, 90)).toBe(0);
    });

    test("10 deg clockwise", () => {
        expect(Tools.GetAngleOffset(100, 90)).toBe(10);
    });

    test("10 deg counter-clockwise", () => {
        expect(Tools.GetAngleOffset(80, 90)).toBe(-10);
    });

    test("wraps across 0/360 boundary (shortest path)", () => {
        // 350 -> 10 should be +20, not -340
        expect(Tools.GetAngleOffset(10, 350)).toBe(20);
        expect(Tools.GetAngleOffset(350, 10)).toBe(-20);
    });
});

describe("Tools.GetAngleDistance", () => {
    test("unsigned shortest-path distance", () => {
        expect(Tools.GetAngleDistance(10, 350)).toBe(20);
        expect(Tools.GetAngleDistance(170, 190)).toBe(20);
        expect(Tools.GetAngleDistance(0, 180)).toBe(180);
    });
});

describe("Tools.GetOverLoopValue", () => {
    test("returns value unchanged inside bounds", () => {
        expect(Tools.GetOverLoopValue(50, 100, 0, 20)).toBe(50);
    });

    test("wraps to min when exceeding max + thresh", () => {
        expect(Tools.GetOverLoopValue(125, 100, 0, 20)).toBe(0);
    });

    test("wraps to max when falling below min - thresh", () => {
        expect(Tools.GetOverLoopValue(-25, 100, 0, 20)).toBe(100);
    });

    test("leaves value unchanged when just inside the threshold", () => {
        expect(Tools.GetOverLoopValue(115, 100, 0, 20)).toBe(115);
    });
});

describe("Tools.GetAngleOffsetByPosition", () => {
    test("integrates GetAngle + GetAngleOffset", () => {
        const from = new Position(0, 0);
        const to = new Position(0, -10); // above -> 90 deg
        const rot = new Rotation(45); // facing upper-left
        // angleToTarget = 90, current = 45, offset = 45
        expect(Tools.GetAngleOffsetByPosition(from, to, rot)).toBeCloseTo(45, 5);
    });
});

describe("Tools.GetSegmentPointDistance", () => {
    test("point on segment midpoint -> distance 0, t 0.5", () => {
        const a = new Position(0, 0);
        const b = new Position(10, 0);
        const p = new Position(5, 0);
        const r = Tools.GetSegmentPointDistance(a, b, p);
        expect(r.distance).toBe(0);
        expect(r.t).toBeCloseTo(0.5, 5);
    });

    test("point above segment midpoint -> distance equal to height", () => {
        const a = new Position(0, 0);
        const b = new Position(10, 0);
        const p = new Position(5, 3);
        const r = Tools.GetSegmentPointDistance(a, b, p);
        expect(r.distance).toBe(3);
        expect(r.t).toBeCloseTo(0.5, 5);
    });

    test("point before the segment -> clamps t to 0, distance to endpoint a", () => {
        const a = new Position(0, 0);
        const b = new Position(10, 0);
        const p = new Position(-3, 0);
        const r = Tools.GetSegmentPointDistance(a, b, p);
        expect(r.distance).toBe(3);
        expect(r.t).toBe(0);
    });

    test("point past the segment -> clamps t to 1, distance to endpoint b", () => {
        const a = new Position(0, 0);
        const b = new Position(10, 0);
        const p = new Position(13, 0);
        const r = Tools.GetSegmentPointDistance(a, b, p);
        expect(r.distance).toBe(3);
        expect(r.t).toBe(1);
    });

    test("degenerate segment (a == b) -> distance is point-to-a", () => {
        const a = new Position(5, 5);
        const b = new Position(5, 5);
        const p = new Position(5, 9);
        const r = Tools.GetSegmentPointDistance(a, b, p);
        expect(r.distance).toBe(4);
        expect(r.t).toBe(0);
    });

    test("symmetry: swapping endpoints reverses t but preserves distance", () => {
        const a = new Position(0, 0);
        const b = new Position(10, 0);
        const p = new Position(7, 0);
        const forward = Tools.GetSegmentPointDistance(a, b, p);
        const reverse = Tools.GetSegmentPointDistance(b, a, p);
        expect(reverse.distance).toBe(forward.distance);
        expect(reverse.t).toBeCloseTo(1 - forward.t, 5);
    });

    test("catches fast bullet passing thin target (regression for pass-through bug)", () => {
        // A Phaser bullet travels ~42px per frame at its native 2500 px/s.
        // Simulate a zombie 5px to the side of the travel path. Under the
        // old 15-px-substep algorithm this could miss depending on where
        // the sample points landed. The swept test always catches it.
        const bulletPrev = new Position(0, 0);
        const bulletCur = new Position(42, 0);
        const zombie = new Position(20, 5);
        const r = Tools.GetSegmentPointDistance(bulletPrev, bulletCur, zombie);
        // Bullet radius (12) + zombie radius (24 * 0.4 = 9.6) = 21.6
        // Closest approach is 5. 5 < 21.6, so it should be a hit.
        expect(r.distance).toBe(5);
        expect(r.distance).toBeLessThan(21.6);
    });
});
