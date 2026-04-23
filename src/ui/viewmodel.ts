/**
 * UI viewmodel module.
 *
 * The legacy game binds Knockout directly against the Game instance
 * (see Game.ts constructor: ko.applyBindings(this, body)), so there is no
 * separate viewmodel layer today. This module is intentionally empty and
 * exists as a future home for extracting HUD/menu presentation state away
 * from Game when the UI layer grows (see IDEAS.md).
 */

export {};
