/**
 * Audio playback via the native Web Audio API.
 *
 * Replaces the former createjs.Sound wrapper. Each sound file is fetched,
 * decoded into an AudioBuffer once, and cached. `play(id)` creates a
 * fresh BufferSourceNode per call so overlapping plays (rapid blood
 * splatters, simultaneous weapon fires) each get their own voice.
 *
 * This also fixes the original 2013 play-once bug structurally: there's
 * no per-instance registration, just a buffer-keyed play call.
 *
 * Browsers require a user gesture before an AudioContext may start
 * producing audio. The context here is created lazily on first access
 * and resumed on the first `play()` call, which happens after the
 * player clicks a difficulty button - well after the required gesture.
 */

// -------- AudioManager --------

class AudioManagerImpl {
    private _context: AudioContext | undefined;
    private _buffers = new Map<string, AudioBuffer>();
    private _pending = new Map<string, Promise<AudioBuffer | undefined>>();
    private _masterVolume: number = 1;

    /** Lazy AudioContext - browsers gate autoplay until a user gesture. */
    private get ctx(): AudioContext {
        if (!this._context) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Ctor: typeof AudioContext = (window as any).AudioContext ?? (window as any).webkitAudioContext;
            this._context = new Ctor();
        }
        return this._context;
    }

    public setMasterVolume(value: number): void {
        this._masterVolume = Math.max(0, Math.min(1, value));
    }

    /**
     * Fetch + decode a sound file into an AudioBuffer. Idempotent.
     * Returns a promise that resolves when the buffer is ready.
     */
    public async preload(id: string, path: string = `Sounds/${id}.mp3`): Promise<AudioBuffer | undefined> {
        const existing = this._buffers.get(id);
        if (existing) return existing;

        const inflight = this._pending.get(id);
        if (inflight) return inflight;

        const promise = (async () => {
            try {
                const res = await fetch(path);
                if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
                const arr = await res.arrayBuffer();
                const buf = await this.ctx.decodeAudioData(arr);
                this._buffers.set(id, buf);
                return buf;
            } catch (err) {
                console.warn(`[audio] failed to load ${path}:`, err);
                return undefined;
            } finally {
                this._pending.delete(id);
            }
        })();

        this._pending.set(id, promise);
        return promise;
    }

    /** Batch preload for startup. */
    public async preloadAll(ids: readonly string[]): Promise<void> {
        await Promise.all(ids.map((id) => this.preload(id)));
    }

    /**
     * Play a sound. Auto-preloads on first use. Spawns a fresh
     * BufferSourceNode per call so concurrent plays overlap cleanly.
     */
    public play(id: string, options: { volume?: number; loop?: boolean } = {}): void {
        const buffer = this._buffers.get(id);

        // Resume the context if a user gesture unlocked it after construction.
        if (this.ctx.state === "suspended") {
            void this.ctx.resume();
        }

        if (!buffer) {
            // Auto-preload then retry once the buffer lands.
            void this.preload(id).then((buf) => {
                if (buf) this._playBuffer(buf, options);
            });
            return;
        }
        this._playBuffer(buffer, options);
    }

    private _playBuffer(buffer: AudioBuffer, options: { volume?: number; loop?: boolean }): void {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop ?? false;

        const gain = this.ctx.createGain();
        gain.gain.value = (options.volume ?? 0.5) * this._masterVolume;

        source.connect(gain).connect(this.ctx.destination);
        source.start(0);
    }
}

export const AudioManager = new AudioManagerImpl();

// -------- Backwards-compatible shim --------

/**
 * Kept for call-site parity with the legacy API (`new Sound("bloodsplash")`
 * in Game.splatterBlood). Now just a one-shot play-on-construct wrapper.
 */
export class Sound {
    constructor(name: string, _repeat: boolean = false, volume: number = 0.5) {
        AudioManager.play(name, { volume });
    }
}
