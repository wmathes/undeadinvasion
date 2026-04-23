/**
 * Audio playback.
 *
 * The 2013 implementation had a latent bug: each `new Sound("bloodsplash")`
 * re-registered the same file with createjs.Sound and played it from the
 * `fileload` callback. createjs.Sound silently ignores re-registration of
 * an already-known id, so `fileload` only ever fired for the first
 * instance - every subsequent splatter was a no-op. The symptom was
 * "SFX plays once and then never again".
 *
 * The fix is to register each sound id exactly once (module-level set)
 * and call createjs.Sound.play directly on every trigger. createjs.Sound
 * handles overlapping playback by creating a fresh SoundInstance per play
 * call, so rapid blood splatters all get their own voice.
 *
 * The `Sound` class is kept as a thin shim so existing call sites
 * (`new Sound("bloodsplash")` in Game.splatterBlood) keep working
 * unchanged.
 */

import "createjs-module";

class AudioManagerImpl {
    private readonly _registered = new Set<string>();

    /**
     * Register a sound id -> file path mapping with createjs.Sound.
     * Idempotent: subsequent calls with the same id are ignored.
     */
    public preload(id: string, path: string = `Sounds/${id}.mp3`): void {
        if (this._registered.has(id)) return;
        this._registered.add(id);
        createjs.Sound.registerSound(path, id);
    }

    /**
     * Play a sound. Auto-registers on first use so callers don't have to
     * preload explicitly. Returns the SoundInstance (undefined if the file
     * is still loading - createjs.Sound will queue the play internally in
     * that case on most versions).
     */
    public play(
        id: string,
        options: { volume?: number; loop?: number } = {},
    ): createjs.AbstractSoundInstance | undefined {
        this.preload(id);

        const instance = createjs.Sound.play(id);
        if (instance) {
            if (options.volume !== undefined) instance.volume = options.volume;
            if (options.loop !== undefined) instance.loop = options.loop;
        }
        return instance;
    }

    /**
     * Preload a batch of sound ids up front. Useful at game start so the
     * first SFX trigger doesn't race the file load.
     */
    public preloadAll(ids: readonly string[]): void {
        for (const id of ids) this.preload(id);
    }
}

export const AudioManager = new AudioManagerImpl();

/**
 * Backwards-compatible shim matching the legacy Sound class shape.
 * Constructing `new Sound("bloodsplash")` now plays via the manager,
 * so re-plays work after the first trigger.
 */
export class Sound {
    public readonly instance: createjs.AbstractSoundInstance | undefined;

    constructor(name: string, _repeat: boolean = false, volume: number = 0.5) {
        this.instance = AudioManager.play(name, { volume });
    }

    public get Instance(): createjs.AbstractSoundInstance | undefined {
        return this.instance;
    }
}
