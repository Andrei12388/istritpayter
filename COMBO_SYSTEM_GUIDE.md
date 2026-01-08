# Attack Cancel & Combo System Implementation Guide

## Overview
This guide explains how to implement attack cancels and combos in your fighter game based on your current Fighter.js architecture.

## Core Concepts

### Attack Cancel
An attack cancel allows a player to interrupt the recovery animation of an attack and immediately start another attack. This creates fluid, responsive combat.

### Combo
A sequence of attacks where the second attack can only be performed if the previous attack was executed. Combos create opportunities for higher damage output.

## Implementation Strategy

### 1. **Modify validFrom Arrays in State Definitions**

The `validFrom` array controls which states can transition to which. Currently:

```javascript
[FighterState.LIGHT_PUNCH]: {
    validFrom: [FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD],
}
```

To enable combo chains, add previous attack states to `validFrom`:

```javascript
[FighterState.HEAVY_PUNCH]: {
    validFrom: [
        FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD,
        FighterState.LIGHT_PUNCH,  // Can chain from light punch
    ],
}
```

### 2. **Add Cancel Windows to Attack Handlers**

Currently your handlers check if animation is complete before transitioning. Add a **cancel window** - an earlier point where the attack can be cancelled:

**Current Pattern:**
```javascript
handleLightPunchState(){
    if (this.animationFrame < 2) return;
    if (control.isLightPunch(this.playerId)) return;
    if (control.isHeavyPunch(this.playerId)) this.changeState(FighterState.HEAVY_PUNCH);

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}
```

**Improved Pattern with Cancel Window:**
```javascript
handleLightPunchState(){
    // Startup frames (can't be cancelled yet)
    if (this.animationFrame < 2) return;
    if (control.isLightPunch(this.playerId)) return;
    
    // Cancel window starts at frame 2 (adjust based on your animation)
    // Allow transitions to other attacks during recovery frames
    if (this.animationFrame >= 2 && this.animationFrame < this.animations[FighterState.LIGHT_PUNCH].length - 1) {
        if (control.isHeavyPunch(this.playerId)) {
            this.changeState(FighterState.HEAVY_PUNCH);
            return;
        }
        if (control.isLightKick(this.playerId)) {
            this.changeState(FighterState.LIGHT_KICK);
            return;
        }
        if (control.isHeavyKick(this.playerId)) {
            this.changeState(FighterState.HEAVY_KICK);
            return;
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}
```

## Full Implementation Example

### Step 1: Add Cancel Window Constants

```javascript
// In src/constants/fighter.js
export const CancelWindow = {
    LIGHT_PUNCH: { start: 2, end: 6 },      // Frames 2-6 can be cancelled
    HEAVY_PUNCH: { start: 4, end: 10 },     // Frames 4-10 can be cancelled
    LIGHT_KICK: { start: 2, end: 8 },
    HEAVY_KICK: { start: 4, end: 12 },
};
```

### Step 2: Add Combo Detection Method

```javascript
// Add to Fighter class
isInCancelWindow(state, cancelData = null) {
    if (!cancelData) {
        // Use default cancel windows if not specified
        const windows = {
            [FighterState.LIGHT_PUNCH]: { start: 2, end: 6 },
            [FighterState.HEAVY_PUNCH]: { start: 4, end: 10 },
            [FighterState.LIGHT_KICK]: { start: 2, end: 8 },
            [FighterState.HEAVY_KICK]: { start: 4, end: 12 },
        };
        cancelData = windows[state];
    }
    
    if (!cancelData) return false;
    return this.animationFrame >= cancelData.start && 
           this.animationFrame <= cancelData.end;
}

// Helper method to check which attack input is pressed
getNextAttackInput() {
    if (control.isLightPunch(this.playerId)) return FighterState.LIGHT_PUNCH;
    if (control.isHeavyPunch(this.playerId)) return FighterState.HEAVY_PUNCH;
    if (control.isLightKick(this.playerId)) return FighterState.LIGHT_KICK;
    if (control.isHeavyKick(this.playerId)) return FighterState.HEAVY_KICK;
    return null;
}
```

### Step 3: Update Attack State Handlers

```javascript
handleLightPunchState(){
    // Startup frames (can't cancel or be interrupted)
    if (this.animationFrame < 2) return;
    if (control.isLightPunch(this.playerId)) return;
    
    // Cancel window: allow chaining to other attacks
    if (this.isInCancelWindow(FighterState.LIGHT_PUNCH)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.LIGHT_PUNCH) {
            if (this.states[nextAttack].validFrom.includes(FighterState.LIGHT_PUNCH)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyPunchState(){
    // Startup frames
    if (this.animationFrame < 4) return;
    
    // Cancel window
    if (this.isInCancelWindow(FighterState.HEAVY_PUNCH)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.HEAVY_PUNCH) {
            if (this.states[nextAttack].validFrom.includes(FighterState.HEAVY_PUNCH)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleLightKickState(){
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    if (this.isInCancelWindow(FighterState.LIGHT_KICK)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.LIGHT_KICK) {
            if (this.states[nextAttack].validFrom.includes(FighterState.LIGHT_KICK)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyKickState(){
    if (this.animationFrame < 4) return;
    
    if (this.isInCancelWindow(FighterState.HEAVY_KICK)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.HEAVY_KICK) {
            if (this.states[nextAttack].validFrom.includes(FighterState.HEAVY_KICK)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}
```

### Step 4: Update validFrom Arrays for Combo Chains

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
        FighterState.LIGHT_PUNCH,      // NEW: Can chain from light punch
        FighterState.LIGHT_KICK,       // NEW: Can chain from light kick
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
        FighterState.LIGHT_PUNCH,      // NEW: Can chain from punch combo
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
        FighterState.HEAVY_PUNCH,      // NEW: Can chain from heavy punch
        FighterState.LIGHT_PUNCH,      // NEW: Can chain from light punch
    ],
},
```

## Common Combo Chains

Based on the above implementation, players can execute:

```
Light Punch → Heavy Punch
Light Punch → Light Kick
Light Punch → Heavy Kick
Light Kick → Heavy Kick
Light Kick → Light Punch
Heavy Punch → Light Kick
Heavy Punch → Heavy Kick
```

## Advanced: Crouch Combos

Apply the same pattern to crouch attacks:

```javascript
[FighterState.CROUCH_LIGHTKICK]: {
    validFrom: [
        FighterState.CROUCH,
        FighterState.CROUCH_DOWN,
        FighterState.CROUCH_TURN,
    ],
},

[FighterState.CROUCH_HEAVYKICK]: {
    validFrom: [
        FighterState.CROUCH,
        FighterState.CROUCH_DOWN,
        FighterState.CROUCH_TURN, 
        FighterState.CROUCH_LIGHTKICK,  // NEW: Can chain crouch kicks
    ],
},
```

And update the crouch handlers:

```javascript
handleCrouchLightKickState(){
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    if (this.isInCancelWindow(FighterState.CROUCH_LIGHTKICK)) {
        if (control.isHeavyKick(this.playerId)) {
            this.changeState(FighterState.CROUCH_HEAVYKICK);
            return;
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.CROUCH);
}

handleCrouchHeavyKickState(){
    if (this.animationFrame < 4) return;
    
    if (this.isInCancelWindow(FighterState.CROUCH_HEAVYKICK)) {
        // Can chain into other actions here if needed
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.CROUCH);
}
```

## Animation Frame Adjustments

You may need to adjust the cancel window frames based on your actual animations:

- **Startup**: Frames where hitbox is active (cannot cancel)
- **Active**: Frames where attack has effect (beginning of cancel window)
- **Recovery**: Frames after active (safe zone for cancelling)
- **End**: Last frame transitions back to neutral state

Example for Light Punch with 6 total frames:
- Frame 0-1: Startup (no cancel)
- Frame 2-4: Active (can cancel)
- Frame 5: Recovery (must wait)
- Frame 6+: Idle (animation complete)

## Testing Your Combos

1. Test light punch → heavy punch chains
2. Test light punch → light kick chains
3. Test light kick → heavy kick chains
4. Verify cancel windows feel responsive
5. Ensure no unintended double-hits occur
6. Check opponent block states work correctly

## Tips for Balance

- **Shorter cancel windows** = More technical, skill-based
- **Longer cancel windows** = More forgiving, combo-friendly
- **Higher damage combos** = Fewer chain options
- **Lower damage combos** = More chain options available
- **Startup frames** = Control how quickly attacks transition
