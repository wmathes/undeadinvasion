/**
 * Application entry point.
 *
 * Phase 1 status: scaffold only. This file currently imports the stylesheet
 * and bootstraps Knockout's viewmodel with a placeholder. Phase 2 will
 * replace the placeholder with the real Game instance migrated from
 * the legacy app.ts + Scripts/*.ts sources.
 */

import ko from "knockout";
import "./styles/UndeadInvasion.scss";

// TODO(phase-2): import { Game } from "./game/Game";
// TODO(phase-2): import { createViewModel } from "./ui/viewmodel";

function bootstrap(): void {
    // Placeholder viewmodel so the Knockout bindings in index.html don't blow up
    // before Phase 2 wires the real Game instance.
    const placeholderViewModel = {
        State: ko.observable<"menu" | "game">("menu"),
        Score: ko.observable(0),
        Weapon: ko.observable(null),
        GameScore: ko.observable(null),
        start: (_difficulty: string) => {
            console.warn("[phase-1] start() not wired yet - Phase 2 will connect Game.");
        },
    };

    const root = document.getElementById("gameDiv");
    if (!root) throw new Error("#gameDiv not found in index.html");
    ko.applyBindings(placeholderViewModel, root);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
    bootstrap();
}
