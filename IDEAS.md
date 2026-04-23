# Future Improvements

Deferred ideas from the modernization effort. None of these block playability on modern browsers — they're quality-of-life, maintenance, and architectural improvements to revisit later.

## UI / Framework

- **Drop Knockout 2.3.0.** Used only in `index.html` for menu state, score, health bar, weapon UI, and game-over screen. Replace with either a small hand-rolled reactive binding (~50 lines) or a lightweight modern library (Alpine.js, Preact signals, Solid). Knockout still works but is unmaintained and adds ~40 KB.
- **Drop the global `game` singleton.** Pass the `Game` instance through constructors or expose it via a dedicated module accessor. Currently every entity/action/bullet reaches into a module-level `export let game: Game`.

## Engine

- **Consider migrating rendering off EaselJS.** EaselJS is abandoned (no Adobe updates since ~2015). Candidate replacements in order of effort: (1) vanilla Canvas 2D with a thin sprite helper — minimal deps, preserves all existing art; (2) PixiJS — GPU-accelerated, similar display-tree API to EaselJS so sprite/stage code ports cleanly; (3) Phaser — full game framework, would require rewriting the entity/weapon/action system against Phaser's scene and physics model.
- **Replace CreateJS SoundJS with native Web Audio API.** Five sound files, three of them tiny SFX. A ~80-line `AudioManager` class with an `AudioContext`, a buffer map, and volume envelopes would replace SoundJS entirely.
- **Introduce a proper entity-component system.** Current `_action: IEntityAction` pattern is close to a strategy/behavior pattern but `Entity` still owns a lot of state that belongs to components (health, velocity, sprite). A true ECS would make new enemy types trivial.

## Gameplay / Content

- **Multiplayer or online leaderboard.** Kongregate API is dead; replace with a small Bun HTTP backend and a Postgres or SQLite score table.
- **More weapon and enemy variety.** Existing factory pattern makes this easy once the TypeScript migration is done.
- **Mobile-first touch controls.** Current plan adds Pointer Events so touch works, but a dedicated virtual joystick + fire button layout would play much better on phones.
- **Difficulty curve tuning.** Config-driven; easy to iterate on once there's a live build.

## Build & Tooling

- **CI pipeline.** GitHub Actions running `bun install`, `bun run typecheck`, `bun test`, `bun run build` on every push.
- **Asset pipeline.** Sprite sheets are already pre-packed, but `menu_logo.png` is 309 KB — could be ~40 KB as WebP. Add a build step that converts PNG → WebP with PNG fallback.
- **Service Worker for offline play.** Game assets total ~5 MB; easily cacheable for offline-first PWA experience.
- **Bundle splitting.** Current plan produces a single JS bundle. Splitting menu vs. gameplay would let the menu interactive paint earlier.

## Code Quality

- **Unit test coverage.** Target: pure game-logic modules (Config, Weapon factories, Tools.GetDistance, bullet trajectory math). Skip rendering code — visual regressions are caught by playing.
- **Delete `console.log` debug spam** scattered through `Game.ts` and `app.ts`.
- **Enable `noUnusedLocals` and `noUnusedParameters`** in `tsconfig.json` after the migration stabilises.
- **Extract hard-coded magic numbers** (frame counts, pixel offsets, timing constants) into `Config.ts`.

## Accessibility

- **Keyboard-only playable menu.** Currently the menu relies on mouse clicks for difficulty selection.
- **Colour-blind safe palette for zombie variants.** Blue/red/yellow is fine but could be paired with shape differences.
- **Adjustable volume sliders** for music and SFX separately.

## Compliance / Legal

- **License file.** Original CreateJS / Knockout / jQuery licenses should be preserved or at least acknowledged in a `THIRD_PARTY_LICENSES.md`.
