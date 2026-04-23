/**
 * Position / Rotation behaviour regression tests.
 */

import { describe, expect, test } from "bun:test";
import { Position, Rotation } from "../src/game/Position";

describe("Position", () => {
    test("construct with coordinates", () => {
        const p = new Position(3, 4);
        expect(p.x).toBe(3);
        expect(p.y).toBe(4);
    });

    test("default construct to origin", () => {
        const p = new Position();
        expect(p.x).toBe(0);
        expect(p.y).toBe(0);
    });

    test("setters update coordinates", () => {
        const p = new Position();
        p.x = 10;
        p.y = -5;
        expect(p.x).toBe(10);
        expect(p.y).toBe(-5);
    });

    test("clone produces an independent copy", () => {
        const p = new Position(7, 9);
        const c = p.clone();
        expect(c.x).toBe(7);
        expect(c.y).toBe(9);
        c.x = 100;
        expect(p.x).toBe(7); // original unchanged
    });

    test("crop clamps to min/max bounds", () => {
        const p = new Position(150, -20);
        p.crop(100, 100, 0, 0);
        expect(p.x).toBe(100);
        expect(p.y).toBe(0);
    });

    test("crop leaves in-range values untouched", () => {
        const p = new Position(50, 50);
        p.crop(100, 100, 0, 0);
        expect(p.x).toBe(50);
        expect(p.y).toBe(50);
    });

    test("displaceDirection moves along angle vector", () => {
        // angle 90 = upward; displaceDirection subtracts sin -> y decreases
        const p = new Position(0, 100);
        p.displaceDirection(50, 90);
        expect(p.x).toBeCloseTo(0, 5);
        expect(p.y).toBeCloseTo(50, 5);
    });

    test("displaceDirection with zero distance is a no-op", () => {
        const p = new Position(10, 20);
        p.displaceDirection(0, 45);
        expect(p.x).toBe(10);
        expect(p.y).toBe(20);
    });

    test("overLoop wraps around bounds", () => {
        const p = new Position(150, -25);
        p.overLoop(100, 100, 20, 20);
        // 150 > max(100) + thresh(20) = 120 -> wrap to -max = -20
        expect(p.x).toBe(-20);
        // -25 < min(-20) - thresh(20) = -40... wait, min is -20 here
        // -25 is within [-20 - 20, 100 + 20] = [-40, 120] so stays
        expect(p.y).toBe(-25);
    });
});

describe("Rotation", () => {
    test("default construct to 0", () => {
        expect(new Rotation().angle).toBe(0);
    });

    test("construct with explicit angle", () => {
        expect(new Rotation(180).angle).toBe(180);
    });

    test("setter normalises values >= 360", () => {
        const r = new Rotation();
        r.angle = 450;
        expect(r.angle).toBe(90);
    });

    test("setter does not normalise values < 360 or negatives", () => {
        // The legacy setter only normalises the >= 360 case; negative
        // values pass through. This asserts the behaviour so we notice
        // if anyone "helpfully" changes it.
        const r = new Rotation();
        r.angle = -10;
        expect(r.angle).toBe(-10);
    });
});
