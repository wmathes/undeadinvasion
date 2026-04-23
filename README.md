# Undead Invasion

A top-down zombie shooter built as a university project in 2013 and modernised in 2026. You spawn in the middle of the field, zombies come in from the edges, you pick up weapons and power-ups, you try to survive. Thirteen weapons from revolver to plasma cutter, four difficulty settings, blood everywhere.

Originally shipped against jQuery 1.8, Knockout 2.3, Sugar.js, a Kongregate CDN script, and a hand-compiled pile of `<script>` tags. The current build is a clean ES-module TypeScript project bundled with Bun that runs on any modern desktop or mobile browser — gameplay and visuals are unchanged, only the delivery layer moved thirteen years forward.

## Quick start

Requires [Bun](https://bun.sh) 1.1 or newer.

```bash
bun install
bun run dev
```

Opens a dev server on http://localhost:3000 with hot-module reload. Edits to anything under `src/` reload in place.

## Controls

| Action            | Keyboard                  | Mouse / touch               |
| ----------------- | ------------------------- | --------------------------- |
| Move              | WASD or arrow keys        | —                           |
| Aim               | —                         | Pointer position on canvas  |
| Fire              | Space                     | Left click / tap-and-hold   |
| Pause             | Escape                    | —                           |
| Equip random gun  | R (cheat)                 | —                           |

Mobile works the same way — the canvas scales to fit the viewport and touch is routed through Pointer Events.

## npm scripts

| Command               | What it does                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `bun run dev`         | Dev server on :3000 with HMR; bundles `src/` on the fly.                     |
| `bun run build`       | Produces a minified production bundle in `dist/` and copies assets in.       |
| `bun run preview`     | Serves the already-built `dist/` on :3000 as if it were deployed.            |
| `bun run test`        | Runs the `bun:test` suite under `tests/`.                                    |
| `bun run typecheck`   | Strict TypeScript check (`tsc --noEmit`), no emission.                       |

## Project layout

```
undeadinvasion/
├── index.html              single entry point with <script type="module">
├── src/
│   ├── main.ts             bootstrap: createjs shim, CSS, Game instance
│   ├── responsive.ts       resize handler -> CSS scale custom property
│   ├── server.ts           Bun.serve dev + preview server
│   ├── styles/             CSS (and SCSS source) for menu + HUD
│   ├── game/
│   │   ├── Game.ts         stage, ticker, entity/bullet/effect arrays
│   │   ├── Bullet.ts       projectile physics + collision
│   │   ├── Actions.ts      enemy AI state machines (Idle, Approach)
│   │   ├── Config.ts       difficulty tuning + effect constants
│   │   ├── Input.ts        keyboard + Pointer Events
│   │   ├── Sound.ts        AudioManager singleton over createjs.Sound
│   │   ├── Tools.ts        geometry helpers
│   │   ├── Position.ts     Position + Rotation value objects
│   │   ├── Score.ts        end-of-game score animation
│   │   ├── SpriteSheetData.ts  cached sprite sheets (zombies, player)
│   │   ├── VanishingEntity.ts  blood / bone fade-out effect
│   │   ├── state.ts        module-scoped Game singleton
│   │   ├── createjs-bootstrap.ts   ensures globalThis.createjs is populated
│   │   ├── entities/       Entity, Player, PowerUp
│   │   └── weapons/        Weapon factories (13 guns)
│   ├── types/              type re-exports for consumer aliases
│   └── ui/                 reserved for future viewmodel extraction
├── tests/                  bun:test regression suites (Tools, Config, Position, Weapon)
├── scripts/copy-assets.ts  post-build step copying Images/ + Sounds/ to dist/
├── Images/                 sprite sheets, bullets, weapon icons, backgrounds
├── Sounds/                 SFX and BGM (MP3)
├── IDEAS.md                deferred improvements for future passes
├── bunfig.toml             Bun configuration
├── package.json            dependencies + scripts
└── tsconfig.json           strict TS, ES2022, bundler resolution
```

## Tech stack

- **Bun** handles package install, dev server, HMR, bundling, TypeScript execution, and the test runner. No separate Node, npm, Webpack, Vite, Jest, or tsc CLI are required.
- **TypeScript** in strict mode targeting ES2022, using `moduleResolution: "bundler"`.
- **[EaselJS](https://createjs.com/easeljs)** (via the `createjs-module` npm aggregate package) for the canvas display tree, sprite sheets, and the `Ticker` game loop.
- **[SoundJS](https://createjs.com/soundjs)** for audio playback, wrapped in a thin `AudioManager` that registers each file once and plays on demand.
- **[Knockout 3.5](https://knockoutjs.com)** for menu, HUD, and game-over score bindings.
- **Pointer Events** for unified mouse / touch / pen input.

The CreateJS-era libraries are unmaintained but stable — gameplay feel is preserved verbatim. `IDEAS.md` tracks their eventual replacement with native Canvas 2D + Web Audio.

## Development workflow

1. Edit any source under `src/`, the page hot-reloads.
2. Run `bun run test` before committing — the regression tests pin down geometry helpers, difficulty tuning, and all thirteen weapon stat blocks, so accidental drift in gameplay balance surfaces immediately.
3. Run `bun run typecheck` to confirm strict-mode compliance.

## Production build

```bash
bun run build       # emits dist/
bun run preview     # verifies dist/ locally on :3000
```

`dist/` is self-contained and can be deployed to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3+CloudFront, a plain nginx).

## Testing

```bash
bun run test
```

The suite covers:

- `tests/Tools.test.ts` — geometry helpers (`GetDistance`, `GetAngle`, `GetAngleOffset`, `GetAngleDistance`, `GetOverLoopValue`, `GetAngleOffsetByPosition`) with known-good cases and range invariants.
- `tests/Position.test.ts` — `Position` and `Rotation` behaviour including `clone`, `crop`, `displaceDirection`, `overLoop`, and the angle-normalisation quirk in `Rotation`'s setter.
- `tests/Config.test.ts` — structural snapshot of all four difficulties plus exact-value pinning on Easy and Ultra, guards against accidental rebalancing.
- `tests/Weapon.test.ts` — every weapon factory produces a valid `Weapon` instance, key stat blocks (Revolver, Shotgun, IonMinigun, FlameThrower) are pinned, and `Random()` always returns a canonical weapon.

Rendering and input code are intentionally not tested — visual regressions are obvious when the game runs.

## Roadmap

See [IDEAS.md](./IDEAS.md) for deferred improvements, including:

- Dropping Knockout in favour of a small hand-rolled reactive binding
- Migrating rendering off EaselJS to vanilla Canvas 2D or PixiJS
- Replacing SoundJS with native Web Audio
- Wiring up the unused BGM and weapon-specific SFX that ship with the repo
- CI pipeline, asset optimisation (WebP), service worker for offline play
- Virtual on-screen joystick and fire button for better mobile ergonomics
- Accessibility (keyboard-only menu, colour-blind-safe palette, volume sliders)

## History

Undead Invasion was written in 2013 as a university project by Wolf Mathes, originally targeting the Kongregate web portal. It was built against the web standards of the time: jQuery 1.8, Knockout 2.3, Sugar.js 1.3, CreateJS from a CDN, manually wired `<script>` tags, no build system.

In 2026 it was modernised in place. The entire source was converted from TypeScript internal modules to ES modules, jQuery and Sugar were removed, Kongregate CDN dependencies dropped, Pointer Events replaced jQuery's mouse handlers, the canvas got responsive scaling, a proper `tsconfig.json` with strict mode was added, all tooling moved to Bun, and a regression test suite was introduced. Gameplay and visuals are unchanged — the mission was to make it runnable again on current browsers both desktop and mobile, not to redesign it.

The full legacy source tree remains accessible via `git log`.

## Author

Wolf Mathes — <hello@wolfmathes.com>

## License

Not specified. If you plan to fork, redistribute, or otherwise reuse this code, please reach out first.
