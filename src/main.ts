/**
 * Application entry point.
 *
 * Bootstraps the game once the DOM is ready and assets are loaded.
 * Order:
 *   1. Stylesheet - side-effect import, bundled by Bun.
 *   2. Responsive scaling installer.
 *   3. preloadAssets() fetches and decodes every PixiJS texture up front,
 *      so sprites render on the very first frame rather than racing the
 *      network on first reference.
 *   4. Game.create() runs PixiJS v8's async Application.init(), wires
 *      the HTML HUD, pointer/keyboard input, the camera, and the module-
 *      scoped `game` singleton.
 */
import.meta.hot.accept;

import "./styles/UndeadInvasion.css";
import { preloadAssets } from "./game/assets";
import { Game } from "./game/Game";
import { installResponsiveScaling } from "./responsive";

async function bootstrap(): Promise<void> {
    installResponsiveScaling();
    await preloadAssets();
    await Game.create("gameDiv");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void bootstrap(), { once: true });
} else {
    void bootstrap();
}
