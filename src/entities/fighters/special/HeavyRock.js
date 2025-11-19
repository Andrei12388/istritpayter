import { FRAME_TIME } from "../../../constants/game.js";
import {
    FireballCollidedState,
    FireballState,
    fireballVelocity
} from "../../../constants/fireball.js";
import {
    boxOverlap,
    getActualBoxDimensions
} from "../../../utils/collisions.js";
import {
    FighterAttackStrength,
    FighterAttackType,
    FighterHurtBox,
    FighterState
} from "../../../constants/fighter.js";
import { gameState } from "../../../state/gameState.js";
import { LightHitSplash } from "../shared/LightHitSplash.js";
import { HeavyHitSplash } from "../shared/HeavyHitSplash.js";
import { SuperHitSplash } from "../shared/SuperHitSplash.js";
import { BlockHitSplash } from "../shared/BlockHitSplash.js";
import { GreenHitSplash } from "../shared/GreenHitSplash.js";

// Frame data
const frames = new Map([
    ['special1-1', [[[894, 902, 54, 44], [27, 42]], [-15, -40, 54, 44],[-15, -40, 54, 44]]],
    
    // Collision frames
    ['special1-collide-1', [[[22, 450, 10, 11], [3, 10]], [0, 0, 0, 0]]],
    ['special1-collide-2', [[[39, 449, 14, 12], [3, 13]], [0, 0, 0, 0]]],
    ['special1-collide-3', [[[62, 449, 14, 13], [3, 14]], [0, 0, 0, 0]]],
    ['special1-collide-4', [[[83, 446, 21, 18], [3, 14]], [0, 0, 0, 0]]],
]);

// Animation sequences
const animations = {
    [FireballState.ACTIVE]: [
        ['special1-1', 10],['special1-1', 110],
    ],
    [FireballState.COLLIDED]: [['special1-1', 4]],
};

export class HeavyRock {
    image = document.querySelector('img[alt="golem"]');
    animationFrame = 0;
    crackAnimationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;
        this.canDealDamage = true;

        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = fireballVelocity[strength] || 400;
        this.direction = this.fighter?.direction ?? 1;
        this.directionY = 1;

        const baseX = this.fighter?.position?.x ?? 0;
        const baseY = this.fighter?.position?.y ?? 0;

        this.position = {
            x: baseX + (5 * this.direction),
            y: baseY - 60,
        };

        this.animationTimer = time.previous ?? 0;
        this.crackAnimationTimer = time.previous ?? 0;
    }

    // 🧩 Check collision with opponent
    hasCollidedWithOpponent(hitBox) {
        for (const [, hurtBox] of Object.entries(this.fighter.opponent.boxes.hurt)) {
            const [x, y, width, height] = hurtBox;
            const actualHurtBox = getActualBoxDimensions(
                this.fighter.opponent.position,
                this.fighter.opponent.direction,
                { x, y, width, height }
            );

            if (boxOverlap(hitBox, actualHurtBox)) {
                return FireballCollidedState.OPPONENT;
            }
        }
        return null;
    }

    // 🧩 Check collision with other fireballs
    hasCollidedWithOtherFireball(hitBox) {
        const others = this.entityList.entities.filter(
            (entity) => entity instanceof HeavyRock && entity !== this
        );
        for (const other of others) {
            const [x, y, width, height] = frames.get(
                animations[other.state][other.animationFrame][0]
            )[1];
            const otherHitBox = getActualBoxDimensions(other.position, other.direction, { x, y, width, height });
            if (boxOverlap(hitBox, otherHitBox)) {
                return FireballCollidedState.OPPONENT;
            }
        }
        return null;
    }

    // 🧩 Determine collision type
    hasCollided() {
        const [x, y, width, height] = frames.get(
            animations[FireballState.ACTIVE][this.animationFrame][0]
        )[1];
        const hitBox = getActualBoxDimensions(this.position, this.direction, { x, y, width, height });

        return this.hasCollidedWithOpponent(hitBox) || this.hasCollidedWithOtherFireball(hitBox);
    }

    // 🚀 Update movement and handle collisions
    updateMovement(time, camera) {
       this.position.x += (this.velocity * this.direction) * time.secondsPassed * 1.8;
        this.position.y += 70 * time.secondsPassed* 1.8;

       

        const screenX = this.position.x - camera.position.x;
        if (screenX > 384 + 56 || screenX < -56) {
            this.entityList.remove(this);
            return;
        }

        const collided = this.hasCollided();
        if (!collided) return;

       // FireballState.ACTIVE = FireballState.COLLIDED;
        

        this.handleCollisionEffects(time, collided);
    }

    // 💥 Handle collision results
    handleCollisionEffects(time, collisionState) {
        if (collisionState === FireballCollidedState.FIREBALL) {
          // this.direction *= -1;
           // this.directionY = 1;
            return;
        }

        const opponent = this.fighter.opponent;

        

        if (collisionState === FireballCollidedState.OPPONENT && this.canDealDamage) {
            this.canDealDamage = false;
            opponent.position.y -= 150 * time.secondsPassed;
           // this.direction *= -1;
           // this.directionY = 1;
            this.entityList.add(GreenHitSplash, time, opponent.position.x, opponent.position.y - 40, 1);

            opponent.handleAttackHit(
                time,
                FighterAttackStrength.SUPER1,
                FighterAttackType.PUNCH,
                undefined,
                FighterHurtBox.BODY
            );
        }
    }

    // 🎞️ Update animation frames
    updateAnimation(time) {
        if (time.previous < this.animationTimer) return;
         if(this.animationFrame === 6)  this.entityList.remove(this);
        this.animationFrame = (this.animationFrame + 1) % animations[FireballState.ACTIVE].length;
        this.animationTimer = time.previous + animations[FireballState.ACTIVE][this.animationFrame][1] * FRAME_TIME;
      
         // this.animationTimer = time.previous + animations[FireballState.ACTIVE][0][1] * FRAME_TIME;
    }

   

    // 🧭 Draw individual debug boxes
    drawDebugBox(context, camera, dimensions, baseColor) {
        if (!Array.isArray(dimensions)) return;

        const [x = 0, y = 0, width = 0, height = 0] = dimensions;
        const finalWidth = Math.abs(width);

        context.beginPath();
        context.strokeStyle = baseColor + 'AA';
        context.fillStyle = baseColor + '33';

        const drawX = Math.floor(this.position.x + (x * this.direction) - camera.position.x) + 0.5;
        const drawY = Math.floor(this.position.y + y - camera.position.y) + 0.5;

        context.fillRect(drawX, drawY, finalWidth, height);
        context.rect(drawX, drawY, finalWidth, height);
        context.stroke();
    }

    // 🔍 Draw all debug boxes
    drawDebug(context, camera) {
        const [frameKey] = animations[FireballState.ACTIVE][this.animationFrame];
        const frameData = frames.get(frameKey);
        if (!frameData) return;

        const boxes = {
            hit: frameData[1],
            hurt: frameData[2] || [],
        };

        context.lineWidth = 1;

        this.drawDebugBox(context, camera, boxes.hit, '#FF0000');
        if (Array.isArray(boxes.hurt)) {
            this.drawDebugBox(context, camera, boxes.hurt, '#7777FF');
        }

        // Draw origin
        const originX = Math.floor(this.position.x - camera.position.x);
        const originY = Math.floor(this.position.y - camera.position.y);
        context.beginPath();
        context.strokeStyle = 'red';
        context.moveTo(originX - 4, originY);
        context.lineTo(originX + 5, originY);
        context.moveTo(originX, originY - 5);
        context.lineTo(originX, originY + 4);
        context.stroke();
    }


    draw(context, camera) {
         
        if (!this.image || !this.image.complete) return;

        const [frameKey] = animations[FireballState.ACTIVE][this.animationFrame];
        const [[[frameX, frameY, frameWidth, frameHeight], [originX, originY]]] = frames.get(frameKey);

        context.save();
        context.scale(this.direction, 1);

        context.drawImage(
            this.image,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
            Math.floor((this.position.x - camera.position.x) * this.direction - originX),
            Math.floor(this.position.y - camera.position.y - originY),
            frameWidth,
            frameHeight
        );

        context.restore();
       
      //  this.drawDebug(context, camera);
    }

    // ⏱️ Main update loop
    update(time, _, camera) {
        this.updateMovement(time, camera);
        this.updateAnimation(time);
       
    }
}
