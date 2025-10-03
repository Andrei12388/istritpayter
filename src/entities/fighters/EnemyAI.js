// enemyAI.js
import { Control, controls } from "../../constants/control.js";
import { heldKeys, pressedKeys } from "../../inputHandler.js";
import { FighterHurtBox, FighterState } from "../../constants/fighter.js";
import { getActualBoxDimensions } from "../../utils/collisions.js";

const DIFFICULTY_PRESETS = {
  easy: {
    blockChance: 0.15,
    dodgeChance: 0.10,
    attackCooldown: 1500,
    reactionDelay: [300, 600], // ms
    engageDistance: 50,
    dodgeDistance: 120,       // how far the AI will still consider dodging
    superChance: 0.15
  },
  normal: {
    blockChance: 0.3,
    dodgeChance: 0.25,
    attackCooldown: 1000,
    reactionDelay: [150, 350],
    engageDistance: 70,
    dodgeDistance: 150,
    superChance: 0.30
  },
  hard: {
    blockChance: 0.65,
    dodgeChance: 0.45,
    attackCooldown: 600,
    reactionDelay: [50, 150],
    engageDistance: 100,
    dodgeDistance: 180,
    superChance: 0.55
  },
  expert: {
    blockChance: 0.90,
    dodgeChance: 0.50,
    attackCooldown: 300,
    reactionDelay: [20, 70],
    engageDistance: 100,
    dodgeDistance: 200,
    superChance: 0.80
  }
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class EnemyAI {
  constructor(fighter, opponent, difficulty = "expert") {
    this.settings = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    this.fighter = fighter;
    this.opponent = opponent;

    this.comboQueue = [];
    this.comboTimer = 0;

    this.blockChance = this.settings.blockChance;
    this.dodgeChance = this.settings.dodgeChance;
    this.superChance = this.settings.superChance;
    this.attackCooldownBase = this.settings.attackCooldown;
    this.attackCooldown = 0;

    this.reactionDelay = this.settings.reactionDelay;
    this.engageDistance = this.settings.engageDistance;
    this.dodgeDistance = this.settings.dodgeDistance;

    this.isBlocking = false;
    this.blockUntil = 0;

    this.nextDecisionTime = 0;

    this.boxes = {
      push: { x: 0, y: 0, width: 0, height: 0 },
      hit:  { x: 0, y: 0, width: 0, height: 0 },
      hurt: {
        [FighterHurtBox.HEAD]: [0,0,0,0],
        [FighterHurtBox.BODY]: [0,0,0,0],
        [FighterHurtBox.FEET]: [0,0,0,0],
      }
    };
  }

  queueCombo(steps) {
    this.comboQueue = [...steps];
    this.comboTimer = 0;
  }

  runCombo(delta) {
    if (!this.comboQueue.length) return;
    this.comboTimer -= delta;
    if (this.comboTimer <= 0) {
      const step = this.comboQueue.shift();
      if (step) {
        this.resetInputs();
        this.press(step.control);
        this.comboTimer = step.duration || 0;
      }
    }
  }

  resetInputs() {
    const inputMap = controls[this.fighter.playerId];
    if (!inputMap) return;
    Object.values(inputMap.keyboard || {}).forEach(c => heldKeys.delete(c));
    Object.values(inputMap.buttons || {}).forEach(c => heldKeys.delete(c));
  }

  press(control) {
    const inputMap = controls[this.fighter.playerId];
    if (!inputMap) return;
    (Array.isArray(control) ? control : [control]).forEach(name => {
      const code = (inputMap.keyboard?.[name]) || (inputMap.buttons?.[name]);
      if (code) {
        heldKeys.add(code);
        pressedKeys.delete(code);
      }
    });
  }

  update(time) {
    const now = time.now || performance.now();
    const delta = (time.secondsPassed || 0) * 1000;

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    }

    if (this.comboQueue.length) {
      this.runCombo(delta);
      return;
    }

    if (this.isBlocking) {
      if (now >= this.blockUntil || !this.opponentIsAttacking()) {
        this.fighter.changeState(FighterState.IDLE, time);
        this.isBlocking = false;
      }
      return;
    }

    if (!this.nextDecisionTime || now >= this.nextDecisionTime) {
      this.nextDecisionTime = now + randomBetween(this.reactionDelay[0], this.reactionDelay[1]);
      this.makeDecision(time, now);
    } else {
      const dx = this.opponent.position.x - this.fighter.position.x;
      this.fighter.direction = dx > 0 ? 1 : -1;
    }
  }

  makeDecision(time, now) {
    const myPos = this.fighter.position;
    const oppPos = this.opponent.position;
    const dx = oppPos.x - myPos.x;
    const distance = Math.abs(dx);

    this.fighter.direction = dx > 0 ? 1 : -1;

    if (this.fighter.currentState.includes("HURT") || this.fighter.currentState.includes("DEAD")) return;

    // Decide to block
    if (this.opponentIsAttacking() && distance < Math.max(this.engageDistance, 90) && Math.random() < this.blockChance) {
      this.fighter.changeState(FighterState.BLOCK, time);
      this.isBlocking = true;
      this.blockUntil = now + 400;
      return;
    }

    // Dodge if opponent attacking and within dodgeDistance
    if (this.opponentIsAttacking() && distance < this.dodgeDistance && Math.random() < this.dodgeChance) {
      this.performDodge(dx);
      return;
    }

    // Attack decision
    if (this.attackCooldown <= 0 && distance < this.engageDistance) {
      if (Math.random() < 0.7) {
        this.performAttack();
        if (Math.random() < this.superChance) {
          this.performSuper();
        }
        this.attackCooldown = this.attackCooldownBase;
        return;
      }
    }

    // Move toward opponent if not attacking
    this.chaseOrIdle(dx);
  }

  chaseOrIdle(dx) {
    if (Math.random() < 0.05) return; // small idle chance
    this.press(dx > 0 ? Control.RIGHT : Control.LEFT);
  }

  opponentIsAttacking() {
    return (
      this.opponent.currentState.includes(FighterState.LIGHT_PUNCH) ||
      this.opponent.currentState.includes(FighterState.LIGHT_KICK)  ||
      this.opponent.currentState.includes(FighterState.HEAVY_PUNCH) ||
      this.opponent.currentState.includes(FighterState.HEAVY_KICK)  ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_1) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_2)
    );
  }

  performAttack() {
    const r = Math.random();
    if (r < 0.33) {
      this.queueCombo([
        { control: Control.DOWN, duration: 100 },
        { control: [Control.LEFT, Control.DOWN], duration: 100 },
        { control: Control.LEFT, duration: 100 },
        { control: Control.HEAVY_PUNCH, duration: 100 },
      ]);
    } else if (r < 0.66) {
      this.queueCombo([
        { control: Control.LIGHT_PUNCH, duration: 100 },
        { control: Control.HEAVY_KICK, duration: 120 },
      ]);
    } else {
      this.queueCombo([
        { control: Control.HEAVY_KICK, duration: 120 },
        { control: Control.LIGHT_KICK, duration: 100 },
      ]);
    }
  }

  performSuper() {
  // Add all the supers you want here
  const superMoves = [
    FighterState.HYPERSKILL_1,
    FighterState.HYPERSKILL_2,
    FighterState.SPECIAL_1,
    FighterState.SPECIAL_2,
    
    // …add more if you create them
  ];

  // Pick one randomly
  const move = superMoves[Math.floor(Math.random() * superMoves.length)];
  this.fighter.changeState(move);
}


  performDodge(dx) {
    // pick forward/backward randomly
    const forward = Math.random() < 1;
    if (forward) {
      this.fighter.changeState(FighterState.DODGE_FORWARD);
    } else {
      this.fighter.changeState(FighterState.DODGE_BACKWARD);
    }
  }
}
