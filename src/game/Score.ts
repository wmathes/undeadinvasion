/**
 * End-of-game score animation and display.
 *
 * Ported from Core.Score in the legacy app.ts. The Kongregate stats
 * upload is preserved behind a feature-detect guard so the code compiles
 * and runs without the Kongregate CDN script loaded.
 */

import ko from "knockout";

// Thousands-separator formatter replacing the Sugar.js Number#format extension.
const _numberFormat = new Intl.NumberFormat("en-US");

export interface IScore {
    Points: number;
    Time: number;
}

export class Score {
    public Time: ko.Observable<string> = ko.observable("n/a");
    public Score: ko.Observable<string> = ko.observable("0");
    public ScaleTransform: ko.Observable<string> = ko.observable("scale(0,0)");

    private _points: number = 0;
    private _sizeIncrease: number = 0;

    private _countTime: number = 0;
    private _countDelay: number = 0;
    private _countTotal: number = 0;
    private _countInterval: ReturnType<typeof setInterval> | undefined;

    constructor(s: IScore) {
        this._points = s.Points;
        const seconds = Math.floor((s.Time / 1000) % 60);
        const minutes = Math.floor((s.Time / 1000 - seconds) / 60);
        this.Time(minutes + ":" + (seconds < 10 ? "0" + seconds : String(seconds)));

        //       100 -> 10
        //    10.000 -> 100
        // 1.000.000 -> 1000
        this._sizeIncrease = Math.sqrt(s.Points) / 2000;
        this._countTotal = 1000 + Math.sqrt(s.Points / 2) * 5;
        if (this._countTotal > 10000) this._countTotal = 10000;
        this._countDelay = 50;
    }

    public upload(): void {
        // Kongregate integration is optional - only runs when their API
        // happens to be available (e.g. embedded on kongregate.com).
        const kong = (window as unknown as Record<string, unknown>)["kongregate"] as
            | { stats?: { submit?: (key: string, value: number) => void } }
            | undefined;
        if (kong?.stats?.submit) {
            kong.stats.submit("HighScore", Math.round(this._points));
        }
    }

    public animate(): void {
        if (!this._countInterval) {
            this._countTime = 0;
            this._countInterval = setInterval(() => {
                this.update(this._countDelay);
            }, this._countDelay);
        }
    }

    public update(d: number): void {
        if (this._countTime >= this._countTotal) {
            if (this._countInterval !== undefined) clearInterval(this._countInterval);
            this._countInterval = undefined;
        } else {
            // Advance animated score
            this._countTime += d;
            if (this._countTime > this._countTotal) this._countTime = this._countTotal;

            // Display with thousands separators
            const perc = this._countTime / this._countTotal;
            this.Score(_numberFormat.format(Math.round(this._points * perc)));

            // Scale transform
            const scale = 1 + this._sizeIncrease * perc;
            this.ScaleTransform("scale(" + scale + "," + scale + ")");
        }
    }
}
