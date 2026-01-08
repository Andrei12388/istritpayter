# Combo System - Code Implementation Steps

## Quick Start Implementation

### 1. Add Cancel Window Helper Methods to Fighter.js

Add these methods to your Fighter class (around line 400-500):

```javascript
// ==============================
// Cancel Window & Combo Methods
// ==============================

isInCancelWindow(state) {
    const cancelWindows = {
        [FighterState.LIGHT_PUNCH]: { start: 2, end: 5 },
        [FighterState.HEAVY_PUNCH]: { start: 4, end: 8 },
        [FighterState.LIGHT_KICK]: { start: 2, end: 6 },
        [FighterState.HEAVY_KICK]: { start: 4, end: 9 },
        [FighterState.CROUCH_LIGHTKICK]: { start: 2, end: 5 },
        [FighterState.CROUCH_HEAVYKICK]: { start: 3, end: 7 },
    };
    
    const window = cancelWindows[state];
    if (!window) return false;
    
    return this.animationFrame >= window.start && 
           this.animationFrame <= window.end;
}

getNextAttackInput() {
    if (control.isLightPunch(this.playerId)) return FighterState.LIGHT_PUNCH;
    if (control.isHeavyPunch(this.playerId)) return FighterState.HEAVY_PUNCH;
    if (control.isLightKick(this.playerId)) return FighterState.LIGHT_KICK;
    if (control.isHeavyKick(this.playerId)) return FighterState.HEAVY_KICK;
    return null;
}

canTransitionToState(nextState, currentState) {
    return this.states[nextState] && 
           this.states[nextState].validFrom.includes(currentState);
}

// Utility method to attempt a combo cancel
attemptCombCancel(currentState) {
    if (!this.isInCancelWindow(currentState)) return false;
    
    const nextAttack = this.getNextAttackInput();
    if (!nextAttack || nextAttack === currentState) return false;
    
    if (this.canTransitionToState(nextAttack, currentState)) {
        this.changeState(nextAttack);
        return true;
    }
    
    return false;
}
```

### 2. Update Standing Attack Handlers

Replace the existing attack handlers with these improved versions:

```javascript
handleLightPunchState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 2) return;
    if (control.isLightPunch(this.playerId)) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.LIGHT_PUNCH)) return;

    // Return to idle when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyPunchState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 4) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.HEAVY_PUNCH)) return;

    // Return to idle when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleLightKickState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.LIGHT_KICK)) return;

    // Return to idle when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyKickState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 4) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.HEAVY_KICK)) return;

    // Return to idle when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}
```

### 3. Update Crouch Attack Handlers

```javascript
handleCrouchLightKickState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.CROUCH_LIGHTKICK)) return;

    // Return to crouch when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.CROUCH);
}

handleCrouchHeavyKickState(){
    // Prevent re-triggering during startup
    if (this.animationFrame < 3) return;
    
    // Attempt combo cancel
    if (this.attemptCombCancel(FighterState.CROUCH_HEAVYKICK)) return;

    // Return to crouch when animation completes
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.CROUCH);
}
```

### 4. Update State Definitions - validFrom Arrays

In your Fighter constructor's `this.states` object, update these:

```javascript
[FighterState.LIGHT_PUNCH]: {
    attackType: FighterAttackType.PUNCH,
    attackStrength: FighterAttackStrength.LIGHT,
    init: this.handleAttackInit.bind(this),
    update: this.handleLightPunchState.bind(this),
    validFrom: [
        FighterState.IDLE, 
        FighterState.WALK_FORWARD, 
        FighterState.WALK_BACKWARD
    ],
},

[FighterState.HEAVY_PUNCH]: {
    attackType: FighterAttackType.PUNCH,
    attackStrength: FighterAttackStrength.HEAVY,
    init: this.handleAttackInit.bind(this),
    update: this.handleHeavyPunchState.bind(this),
    validFrom: [
        FighterState.IDLE, 
        FighterState.WALK_FORWARD, 
        FighterState.WALK_BACKWARD, 
        FighterState.SPECIAL_2, 
        FighterState.LIGHT_PUNCH,   // ADD THIS
        FighterState.LIGHT_KICK,    // ADD THIS
    ],
},

[FighterState.LIGHT_KICK]: {
    attackType: FighterAttackType.KICK,
    attackStrength: FighterAttackStrength.LIGHT,
    init: this.handleAttackInit.bind(this),
    update: this.handleLightKickState.bind(this),
    validFrom: [
        FighterState.IDLE, 
        FighterState.WALK_FORWARD, 
        FighterState.WALK_BACKWARD,
        FighterState.LIGHT_PUNCH,   // ADD THIS
    ],
},

[FighterState.HEAVY_KICK]: {
    attackType: FighterAttackType.KICK,
    attackStrength: FighterAttackStrength.HEAVY,
    init: this.handleAttackInit.bind(this),
    update: this.handleHeavyKickState.bind(this),
    validFrom: [
        FighterState.IDLE, 
        FighterState.WALK_FORWARD, 
        FighterState.WALK_BACKWARD, 
        FighterState.LIGHT_KICK, 
        FighterState.HEAVY_PUNCH,   // ADD THIS
        FighterState.LIGHT_PUNCH,   // ADD THIS
    ],
},

[FighterState.CROUCH_LIGHTKICK]: {
    attackType: FighterAttackType.KICK,
    attackStrength: FighterAttackStrength.LIGHT,
    init: this.handleAttackInit.bind(this),
    update: this.handleCrouchLightKickState.bind(this),
    validFrom: [
        FighterState.CROUCH,
        FighterState.CROUCH_DOWN,
        FighterState.CROUCH_TURN, 
        FighterState.LIGHT_KICK  // ADD THIS for chaining during crouch
    ],
},

[FighterState.CROUCH_HEAVYKICK]: {
    attackType: FighterAttackType.KICK,
    attackStrength: FighterAttackStrength.HEAVYKICK,
    init: this.handleAttackInit.bind(this),
    update: this.handleCrouchHeavyKickState.bind(this),
    validFrom: [
        FighterState.CROUCH,
        FighterState.CROUCH_DOWN,
        FighterState.CROUCH_TURN, 
        FighterState.CROUCH_LIGHTKICK,  // ADD THIS
        FighterState.LIGHT_KICK         // ADD THIS
    ],
},
```

## Testing the System

After implementation, test these combos:

### Standing Combos:
- [ ] Light Punch → Heavy Punch
- [ ] Light Punch → Light Kick  
- [ ] Light Punch → Heavy Kick
- [ ] Light Kick → Heavy Kick
- [ ] Heavy Punch → Light Kick
- [ ] Heavy Punch → Heavy Kick

### Crouch Combos:
- [ ] Crouch Light Kick → Crouch Heavy Kick
- [ ] Crouch Light Kick → Light Punch (if you allow standing after crouch)

### What to Verify:
1. ✓ Combos execute smoothly without delays
2. ✓ Animation frames play correctly
3. ✓ Hit detection works during combo chains
4. ✓ Opponent can block combo sequences
5. ✓ Attack sounds play once per move (no double-sound)
6. ✓ Recovery cancels don't allow startup cancels
7. ✓ Combos feel responsive to player input

## Adjusting Cancel Windows

If combos feel too lenient or too strict, adjust these values:

```javascript
const cancelWindows = {
    [FighterState.LIGHT_PUNCH]: { start: 2, end: 5 },    // Change 5 to higher/lower
    [FighterState.HEAVY_PUNCH]: { start: 4, end: 8 },    // Change values
    [FighterState.LIGHT_KICK]: { start: 2, end: 6 },
    [FighterState.HEAVY_KICK]: { start: 4, end: 9 },
};
```

**Higher end value** = More forgiving (longer window to input next attack)
**Lower end value** = More technical (must input faster)

## Debugging Combo Issues

If a combo isn't working, check:

1. **Is the current state in `validFrom` for the next state?**
   ```javascript
   console.log(this.states[FighterState.HEAVY_PUNCH].validFrom);
   // Should include FighterState.LIGHT_PUNCH
   ```

2. **Is the animation frame in the cancel window?**
   ```javascript
   console.log(`Frame: ${this.animationFrame}, In cancel window: ${this.isInCancelWindow(FighterState.LIGHT_PUNCH)}`);
   ```

3. **Check console for state transitions:**
   ```javascript
   // Add to attemptCombCancel()
   console.log(`Attempting cancel from ${currentState} to ${nextAttack}`);
   ```

## Optional: Add Combo Counter (Advanced)

Track consecutive hits for combo display:

```javascript
// Add to Fighter constructor
this.comboCount = 0;
this.comboTimer = 0;
this.lastComboAttackTime = 0;

// Add method
startCombo() {
    this.comboCount++;
    this.lastComboAttackTime = Date.now();
    console.log(`Combo: ${this.comboCount}`);
}

// Call in your hit detection
handleAttackHit(time, attackStrength, attackType, hitPosition, hurtLocation) {
    // ... existing code ...
    
    if (this.opponent.attackStruck) {
        this.startCombo();
    }
}
```
