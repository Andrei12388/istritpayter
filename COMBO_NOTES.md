Combo feature and special-hit fix
================================

Summary
-------

- Added per-player combo counters with a 3-second cooldown.
- Combo overlay rendering lives in `src/entities/overlays/ComboOverlay.js`.

Why specials weren't counting
----------------------------

Special entities like `Fireball` called the target's `Fighter.handleAttackHit(...)` with an undefined `hitPosition` (this is normal for projectile-based attacks that don't need a screened splash coordinate).

`BattleScene.handleAttackHit` previously returned early when `position` was falsy, which meant combo updates were skipped for these special attacks — the target still took damage, but the combocount wasn't incremented.

What I changed
-------------

- Moved the combo update logic so it executes whether or not a position is supplied.
- `BattleScene.handleAttackHit` now conditionally adds hit splash visuals only if a position was provided, but still updates the combo counters.

Where to look
-------------

- Combo overlay: `src/entities/overlays/ComboOverlay.js`
- Central attack handling: `src/scenes/Battlescene.js` (the combo update is in `handleAttackHit`)
- Per-fighter state: `src/state/fighterState.js` (fields `comboCount`, `lastHitTime`, `comboExpiresAt`)
