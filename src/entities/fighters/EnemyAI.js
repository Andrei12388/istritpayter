// enemyAI.js
import { Control, controls } from "../../constants/control.js";
import { heldKeys, pressedKeys } from "../../inputHandler.js";

export class EnemyAI {
    constructor(fighter, opponent) {
        this.fighter = fighter;
        this.opponent = opponent;
        this.attackCooldown = 0;
        this.comboQueue = [];
        this.comboTimer = 0;
        this.blockChance = 0.25;
    }

    queueCombo(steps) {
        this.comboQueue = [...steps]; // array of { control, duration }
        this.comboTimer = 0;
    }

    runCombo(deltaTime) {
        if (this.comboQueue.length === 0) return;

        this.comboTimer -= deltaTime;

        if (this.comboTimer <= 0) {
            const step = this.comboQueue.shift();
            if (step) {
                this.resetInputs(); // Release previous inputs
                this.press(step.control);
                this.comboTimer = step.duration;
            }
        }
    }

    resetInputs() {
        const inputMap = controls[this.fighter.playerId];
        Object.values(inputMap.keyboard).forEach(code => heldKeys.delete(code));
        Object.values(inputMap.buttons).forEach(code => heldKeys.delete(code));
    }

    press(control) {
        const inputMap = controls[this.fighter.playerId];

        // Support multiple keys (for diagonal input)
        const controlsToPress = Array.isArray(control) ? control : [control];

        controlsToPress.forEach(controlName => {
            const code = inputMap.keyboard[controlName] || inputMap.buttons[controlName];
            heldKeys.add(code);
            pressedKeys.delete(code); // Make it "just pressed"
        });
    }

    update(time) {
        const myPos = this.fighter.position;
        const oppPos = this.opponent.position;
        const dx = oppPos.x - myPos.x;
        const distance = Math.abs(dx);

        this.resetInputs();

        // Face opponent
        this.fighter.direction = dx > 0 ? 1 : -1;

        // Avoid action if being hurt or dead
        if (this.fighter.currentState.includes("HURT") || this.fighter.currentState.includes("DEAD")) {
            return;
        }

        // Block if opponent is attacking and close
        if (
            (this.opponent.currentState.includes("PUNCH") ||
             this.opponent.currentState.includes("KICK")) &&
            distance < 90 &&
            Math.random() < this.blockChance
        ) {
            this.fighter.changeState("BLOCK"); // Optional: implement a block state
            return;
        }

        // If mid-combo, continue it
        if (this.comboQueue.length > 0) {
            this.runCombo(time.secondsPassed * 1000);
            return;
        }

        // Cooldown between attacks
        if (this.attackCooldown > 0) {
            this.attackCooldown -= time.secondsPassed * 1000;
            return;
        }

        // Attack if close enough
        if (distance < 70) {
            this.performAttack();
            this.attackCooldown = 1000;
            return;
        }

        // Move toward player
        if (dx > 0) {
            this.press(Control.RIGHT);
        } else {
            this.press(Control.LEFT);
        }
    }

    performAttack() {
        const r = Math.random();

        if (r < 0.33) {
            // Simulate: ↓ ↘ ← + HP
            this.queueCombo([
                { control: Control.DOWN, duration: 100 },
                { control: [Control.LEFT, Control.DOWN], duration: 100 }, // ↘
                { control: Control.LEFT, duration: 100 },
                { control: Control.HEAVY_PUNCH, duration: 100 },
            ]);
            console.log('super');
        } else if (r < 0.66) {
            this.queueCombo([
                { control: Control.LIGHT_PUNCH, duration: 100 },
                { control: Control.HEAVY_KICK, duration: 100 },
            ]);
        } else {
            this.queueCombo([
                { control: Control.HEAVY_KICK, duration: 100 },
                { control: Control.LIGHT_KICK, duration: 100 },
            ]);
        }
    }
}
