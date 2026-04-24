/**
 * A tiny reactive primitive in the style of Preact Signals, trimmed to
 * the subset this project needs.
 *
 *   const score = signal(0);
 *   score.subscribe((v) => console.log("score is now", v));
 *   score.value = 42;       // logs "score is now 42"
 *   console.log(score.value); // 42
 *
 *   bind(score, (v) => el.textContent = String(v));
 *   // ^ calls fn with the current value, then again on every change,
 *   //   returning an unsubscribe function.
 *
 * Deliberate non-features:
 *   - No auto-tracking (no proxy magic). Subscriptions are explicit.
 *   - No batching. If you write 100 times in a tick, subscribers fire 100 times.
 *   - No async scheduling. Subscribers run synchronously on .value = ...
 *
 * Adopted as the Knockout replacement when dropping KO. The shape
 * (`.value` get/set + `.subscribe`) is deliberately minimal so the eventual
 * migration to `@preact/signals` or similar - should we want auto-tracking
 * later - is a drop-in change.
 */

type Subscriber<T> = (value: T) => void;
type Unsubscribe = () => void;

export interface ReadSignal<T> {
    readonly value: T;
    subscribe(fn: Subscriber<T>): Unsubscribe;
}

export interface Signal<T> extends ReadSignal<T> {
    value: T;
}

class SignalImpl<T> implements Signal<T> {
    private _current: T;
    private readonly _subs = new Set<Subscriber<T>>();

    constructor(initial: T) {
        this._current = initial;
    }

    public get value(): T {
        return this._current;
    }

    public set value(next: T) {
        if (Object.is(this._current, next)) return;
        this._current = next;
        // Iterate a snapshot so subscribers that unsubscribe during the
        // callback don't mutate the set while we walk it.
        for (const fn of [...this._subs]) fn(next);
    }

    public subscribe(fn: Subscriber<T>): Unsubscribe {
        this._subs.add(fn);
        return () => {
            this._subs.delete(fn);
        };
    }
}

/** Create a writable signal seeded with `initial`. */
export function signal<T>(initial: T): Signal<T> {
    return new SignalImpl(initial);
}

/**
 * Run `fn` with the current value of `sig`, then again every time it
 * changes. Returns an unsubscribe function.
 *
 * This is the one-liner most UI code actually wants - "do this every time
 * the signal changes, and also once right now so I don't have to worry
 * about initial state".
 */
export function bind<T>(sig: ReadSignal<T>, fn: Subscriber<T>): Unsubscribe {
    fn(sig.value);
    return sig.subscribe(fn);
}
