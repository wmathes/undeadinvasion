# Camera

## Smooth camera

Basic logic
```
camera_target = player.position on spawn
each frame:
    camera_target += (player.position - camera_target) * (1 - exp(-Smoothness * dt))
    viewport.center = camera_target
```

This gives you the "virtual point tweening toward player" behaviour you described. The exponential smoothing is frame-rate independent (proved through the same 1 - exp(-s*dt) math as the Bullet ScaleFactor fix), so a 120Hz display produces identical camera trajectories to 60Hz. At Smoothness = 0.005, the camera catches ~92% of the distance in 500ms and ~99% in 1s — soft lag during sprints, quick settle when you stop.


### Config
Knobs to play with in `Config.Camera`:

Smoothness:
- `Smoothness: 0.002` — very cinematic lag, camera visibly "catches up" after you stop.
- `Smoothness: 0.005` — the default. Balanced.
- `Smoothness: 0.02` — tight. Lag is barely perceptible but still smoother than rigid follow.

DeadZone:
- `DeadZoneRadius: 50` — camera won't move while the player wanders within 50px of the current target. Combined with low smoothness this gives a classic "breathing room" feel. Set to 0 to always track.

On spawn, `spawnPlayer` snaps the target to the player's position so the camera doesn't tween in from a previous position. On `end()` (death) and `reset()`, the target is cleared and the viewport is parked manually so nothing holds a reference to a destroyed sprite. No more death crash possibility even if you hotswap cameras later.