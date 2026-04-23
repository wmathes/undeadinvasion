/**
 * Application entry point.
 *
 * Bootstraps the game once the DOM is ready. Import order matters:
 *   1. createjs-bootstrap - populates globalThis.createjs so every other
 *      module can reference `createjs.Stage`, `createjs.Ticker`, etc.
 *   2. Stylesheet - side-effect import, bundled by Bun.
 *   3. Game - entry class; its constructor wires Knockout, pointer/keyboard
 *      handlers, the EaselJS Ticker, and the module-scoped `game` singleton.
 */
import.meta.hot.accept;
import "./game/createjs-bootstrap";
import "./styles/UndeadInvasion.css";
import { Game } from "./game/Game";
import { installResponsiveScaling } from "./responsive";

function bootstrap(): void {
    installResponsiveScaling();
    new Game("gameDiv");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
    bootstrap();
}
