/**
 * Scales the 920x700 game viewport to fit the browser window.
 *
 * The entire #gameDiv (canvas + menu + HUD overlays) is transformed as one
 * unit via CSS `transform: scale(var(--game-scale))`. This preserves the
 * canvas's internal resolution (Config.Game.Width x Config.Game.Height),
 * which in turn preserves sprite sizes, hit detection math, and pixel
 * coordinates - critical for keeping the game mechanically identical on
 * mobile and desktop.
 *
 * The transform origin is the centre of the element, and body flex
 * centering keeps the scaled game vertically and horizontally centred in
 * the viewport.
 */

// Internal game dimensions. Must match Config.Game + the .fullscreenMessage
// / .gamelogo CSS widths (920px is the menu width, 900px is the canvas).
const GAME_WIDTH = 920;
const GAME_HEIGHT = 700;

export function installResponsiveScaling(): void {
    const root = document.documentElement;

    const update = (): void => {
        const scaleX = window.innerWidth / GAME_WIDTH;
        const scaleY = window.innerHeight / GAME_HEIGHT;
        // Cap at 1 so we don't upscale pixel art on large monitors.
        // Flip to Math.min(...) without the cap if you want full-screen stretch.
        const scale = Math.min(scaleX, scaleY, 1);
        root.style.setProperty("--game-scale", String(scale));
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
}
