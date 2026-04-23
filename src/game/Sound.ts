/**
 * Thin wrapper around createjs.Sound for one-shot SFX and looping BGM.
 *
 * Ported from UndeadInvasion.Sound in the legacy Scripts/Game.ts.
 * Identical behaviour - SFX register and auto-play when loaded.
 *
 * Note: modern CreateJS SoundJS picks WebAudio when available and falls
 * back to HTMLAudio automatically. No explicit plugin registration needed.
 */

import "createjs-module";

export class Sound {
    private _instance: createjs.AbstractSoundInstance | undefined;

    public get Instance(): createjs.AbstractSoundInstance | undefined {
        return this._instance;
    }

    constructor(
        private _name: string,
        // _repeat kept for API parity with the original; reload-triggered
        // replay is handled by fileload below.
        _repeat: boolean = false,
        private _volume: number = 0.5,
    ) {
        createjs.Sound.addEventListener("fileload", (event: Object) => {
            this.loadHandler(event);
        });

        createjs.Sound.registerSound("Sounds/" + this._name + ".mp3", this._name);
    }

    private loadHandler(_event: Object): void {
        // Fires once per registered file; we only care about ours.
        this._instance = createjs.Sound.play(this._name);
        if (this._instance) {
            this._instance.volume = this._volume;
        }
    }
}
