/**
 * Application entry point.
 *
 * Bootstraps the game once the DOM is ready. Everything upstream (Knockout
 * bindings in index.html, the sprite sheet image URLs, the sound URLs) is
 * resolved inside Game's constructor, which also calls setGame() to expose
 * itself to the module graph.
 */

// Bun's bundler picks up CSS natively via this side-effect import.
// The SCSS source lives next to this CSS for future SCSS -> CSS rebuilds
// (run `bun x sass src/styles/UndeadInvasion.scss src/styles/UndeadInvasion.css`
// or add a bun-plugin-sass config when we want a watched pipeline).
import "./styles/UndeadInvasion.css";
import { Game } from "./game/Game";

function bootstrap(): void {
    // Kicking off Game() wires Knockout, pointer/keyboard handlers, the
    // EaselJS Ticker, and seeds the module-scoped `game` singleton used
    // by actions/bullets/entities.
    new Game("gameDiv");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
    bootstrap();
}
