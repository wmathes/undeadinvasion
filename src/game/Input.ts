/**
 * Keyboard and pointer input management.
 *
 * Ported from UndeadInvasion.Input / UndeadInvasion.InputKey in the legacy
 * Scripts/Game.ts. Key differences from the original:
 *
 *   1. jQuery event handlers replaced with native DOM addEventListener.
 *   2. `event.keyCode` (deprecated) kept for compatibility with the
 *      InputKey constructors' numeric key maps - but we could move to
 *      `event.code` in a future pass (tracked in IDEAS.md).
 *   3. Pointer Events are used instead of separate mouse/touch handlers,
 *      so the game works on phones and tablets with no code duplication.
 *   4. The Chrome / IE / Firefox offsetX fallback chain is gone - Pointer
 *      Events provide offsetX / offsetY natively in all modern browsers.
 */

import { Position } from "./Position";
import { game } from "./state";

export class InputKey {
    private _clicked: boolean = false;
    private _keyCodeArray: Array<number | string>;

    private _clickCallback: (() => void) | undefined;
    private _releaseCallback: (() => void) | undefined;

    constructor(
        keyCodeArray: Array<number | string>,
        clickCallback?: () => void,
        releaseCallback?: () => void,
    ) {
        this._clickCallback = clickCallback;
        this._releaseCallback = releaseCallback;
        this._keyCodeArray = keyCodeArray;
    }

    public updateOnKey(keyCode: number | string, value: boolean): boolean {
        if (this.hasKey(keyCode) && this._clicked !== value) {
            this.Clicked = value;
            return true;
        }
        return false;
    }

    public hasKey(keyCode: number | string): boolean {
        return this._keyCodeArray.indexOf(keyCode) >= 0;
    }

    public set Clicked(value: boolean) {
        if (this._clicked && !value && this._releaseCallback) {
            this._releaseCallback();
        }
        if (!this._clicked && value && this._clickCallback) {
            this._clickCallback();
        }
        this._clicked = value;
    }

    public get Clicked(): boolean {
        return this._clicked;
    }
}

export class Input {
    private _inputKeyLiteral: Record<string, InputKey>;

    public get Up(): InputKey {
        return this._inputKeyLiteral["up"]!;
    }
    public get Down(): InputKey {
        return this._inputKeyLiteral["down"]!;
    }
    public get Left(): InputKey {
        return this._inputKeyLiteral["left"]!;
    }
    public get Right(): InputKey {
        return this._inputKeyLiteral["right"]!;
    }
    public get Pause(): InputKey {
        return this._inputKeyLiteral["pause"]!;
    }
    public get Fire(): InputKey {
        return this._inputKeyLiteral["fire"]!;
    }

    private _cursorPosition: Position = new Position();
    public get CursorPosition(): Position {
        return this._cursorPosition;
    }

    constructor() {
        this._inputKeyLiteral = {
            up: new InputKey([38, 87]),
            down: new InputKey([40, 83]),
            left: new InputKey([37, 65]),
            right: new InputKey([39, 68]),
            pause: new InputKey([27]), // Escape
            fire: new InputKey(["MOUSE_0", 32]), // Space, Left mouse
            cheatRandomWeapon: new InputKey([82], undefined, () => {
                game.EquipRandomWeapon();
            }),
        };
    }

    public update(keyCode: number | string, value: boolean): boolean {
        let hadEffect = false;
        for (const inputKey in this._inputKeyLiteral) {
            const effect = this._inputKeyLiteral[inputKey]!.updateOnKey(keyCode, value);
            hadEffect = hadEffect || effect;
        }
        return hadEffect;
    }

    // -------- DOM event handlers --------

    public handleKeyUp(event: KeyboardEvent): void {
        if (this.update(event.keyCode, false)) {
            event.preventDefault();
        }
    }

    public handleKeyDown(event: KeyboardEvent): void {
        if (this.update(event.keyCode, true)) {
            event.preventDefault();
        }
    }

    public handlePointerDown(event: PointerEvent): void {
        this.updatePointerPosition(event);
        if (this.update("MOUSE_" + event.button, true)) {
            event.preventDefault();
        }
    }

    public handlePointerUp(event: PointerEvent): void {
        this.updatePointerPosition(event);
        if (this.update("MOUSE_" + event.button, false)) {
            event.preventDefault();
        }
    }

    public handlePointerMove(event: PointerEvent): void {
        this.updatePointerPosition(event);
    }

    private updatePointerPosition(event: PointerEvent): void {
        // Pointer Events expose offsetX / offsetY consistently across browsers.
        // On touch devices these still behave correctly.
        this._cursorPosition.x = event.offsetX;
        this._cursorPosition.y = event.offsetY;
    }
}
