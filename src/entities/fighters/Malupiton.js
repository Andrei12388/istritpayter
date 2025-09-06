import { Control, controls } from '../../constants/control.js';
import { FIGHTER_HURT_DELAY, FighterState, FrameDelay, HitBox, HurtBox, PushBox, SpecialMoveButton, SpecialMoveDirection } from '../../constants/fighter.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
//import { FighterState, PushBox, AnimationFrame } from '../../constants/fighter.js';

import { Fighter, AnimationFrame } from './Fighter.js';
import { Fireball } from './special/Fireball.js';

export class Malupiton extends Fighter {
    constructor(playerId, onAttackHit, entityList){
        super(playerId, onAttackHit); //Change Direction of the player

        this.entityList = entityList;

        this.image = document.querySelector('img[alt="malupiton"]');
        this.voiceSpecial1 = document.querySelector('audio#sound-malupiton-special-1');
        this.voiceSpecial1.volume = 0.5;
        this.soundSuperLaunch = document.querySelector('audio#super-launch');
        this.frames = new Map([
           
           //Forwards or Idle
            ['forwards-1', [[[71, 253, 50, 90],[24,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-2', [[[140, 253,52,88],[26,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-3', [[[205, 255,52,88],[26,86]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-4', [[[269, 254,50,90],[25,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-5', [[[335, 254,61,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-6', [[[410, 254,60,89],[30,87]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-7', [[[477, 252,57,96],[28,94]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-8', [[[482, 155,54,91],[27,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-9', [[[477, 252,57,96],[28,94]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-10',[[[410, 254,60,89],[30,87]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-11',[[[335, 254,61,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-12', [[[269, 254,50,90],[25,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-13', [[[205, 255,52,88],[26,86]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-14', [[[140, 253,52,88],[26,90]], PushBox.IDLE, HurtBox.IDLE]],
           
            
            //Jump Up
            ['jumpup-1', [[[410, 254,60,89],[30,87]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-2', [[[335, 254,61,90],[30,88]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-3', [[[269, 254,50,90],[25,88]], PushBox.JUMP, HurtBox.JUMP]],
            
            
            //Jump Forwards/Backwards
            ['jump-roll-1', [[[70, 124, 55, 88], [27,86]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-2', [[[136, 127, 82, 70], [41,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-3', [[[231, 138, 88, 48], [44,46]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-4', [[[339, 115, 50, 94], [24,91]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-5', [[[327, 43, 100, 68], [50,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-6', [[[251, 21, 56, 102], [28,100]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-7', [[[482, 155,54,91],[27,89]], PushBox.JUMP, HurtBox.JUMP]],

            //Jump first/Last frame
            ['jump-land', [[[269, 254,51,90],[25,88]], PushBox.IDLE, HurtBox.IDLE]],

             //Crouch
            ['crouch-1', [[[17, 19, 52, 81], [26,79]], PushBox.IDLE, HurtBox.JUMP]],
            ['crouch-2', [[[81, 32, 57, 69], [28,67]], PushBox.BEND, HurtBox.BEND]],
            ['crouch-3', [[[153, 43, 59, 59], [29,57]], PushBox.CROUCH, HurtBox.CROUCH]], 
           
            //Idle

            ['stands-1', [[[200, 523, 55, 92], [27,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-2', [[[133, 526,59,92],[29,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-3', [[[67, 528,60,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-4', [[[2, 528,61,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]], 

            //Idle Turn
            ['idle-turn-3', [[[206, 254, 51, 88], [25,86]], PushBox.IDLE, [[-10, -89, 28, 10],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-2', [[[141, 252, 51, 89], [25,87]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-1', [[[70, 252, 52, 91], [26,89]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],

            //Crouch Turn
            ['crouch-turn-1', [[[154, 42, 58, 58], [29,56]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['crouch-turn-2', [[[81, 32, 57, 67], [28,65]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['crouch-turn-3', [[[492, 34, 46, 67], [23,65]], PushBox.CROUCH, [[-26, -61, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],

            //Crouch Block
            ['crouch-block-1', [[[558, 127, 62, 49], [31,24]], PushBox.CROUCH, HurtBox.CROUCH,]],
            
             //Crouch Light Kick
            ['crouch-lightkick-1', [[[555, 195, 53, 53], [21,51]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-lightkick-2', [[[615, 196, 91, 50], [45,48]], PushBox.CROUCH, HurtBox.CROUCH, HitBox.CROUCH_LIGHTKICK ]],
            
            //Crouch Heavvy Kick
            ['crouch-heavykick-1', [[[548, 254, 63, 50], [31,48]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-heavykick-2', [[[622, 250, 49, 67], [24,65]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-heavykick-3', [[[696, 241, 114, 74], [57,64]], PushBox.CROUCH, HurtBox.CROUCH, HitBox.CROUCH_HEAVYKICK ]],

            //Jump-attack
            ['jump-attack-1', [[[555, 42, 94, 54], [46,52]], PushBox.LIGHT_KICK, HurtBox.LIGHT_KICK, HitBox.JUMP_HEAVYKICKK]],

            //lIGHT Punch
            ['light-punch-1', [[[70, 124, 55, 88], [27,86]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['light-punch-2', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]], HitBox.LIGHT_PUNCH]],
            ['light-punch-3', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],

             //Heavy Punch
            ['heavy-punch-1', [[[230, 140, 91, 49], [1,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]], HitBox.HEAVY_PUNCH]],

             //lIGHT kick
            ['light-kick-1', [[[81, 34, 57, 69], [27,86]], PushBox.IDLE,  [[3, -76, 30, 18],[-3, -59, 64, 20], [-32, -52, 44, 58]]]],
            ['light-kick-2', [[[560, 26, 84, 71], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 64, 20], [-32, -52, 44, 58]], HitBox.LIGHT_KICK]],

             //Heavy kick
            ['heavy-kick-1', [[[153, 44, 59, 60], [30,58]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-2', [[[660, 29, 58, 87], [19,85]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-3', [[[560, 26, 84, 71], [1,78]], PushBox.BEND, [[3, -76, 30, 18],[8, -58, 75, 20], [-2, -52, 44, 58]], HitBox.HEAVY_KICK]],
            ['heavy-kick-4', [[[269, 256, 51, 91], [16,89]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-5', [[[206, 259, 51, 87], [15,85]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],

            //Hit Face
            ['hurt-face-4', [[[71, 253, 50, 90],[24,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-3', [[[140, 253,52,88],[26,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-2', [[[205, 255,52,88],[26,86]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-1', [[[269, 254,50,90],[25,88]], PushBox.IDLE, HurtBox.IDLE]],

            //Hurt Body
            ['hurt-body-1', [[[154, 42, 58, 58], [29,56]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-2', [[[81, 32, 57, 67], [28,65]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-3', [[[492, 34, 46, 67], [23,65]], PushBox.CROUCH, [[-26, -61, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],

             //Special 1 - Roll
            ['special-1', [[[70, 124, 55, 88], [27,86]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['special-2', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],
            ['special-3', [[[230, 140, 91, 49], [1,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]]]],
        ]);

                  
         this.animations = {
            [FighterState.IDLE]:[ 
                ['forwards-1', 75],['forwards-2',75],
                ['forwards-3',75],['forwards-4',75],
                ['forwards-5',75],['forwards-6',75],
                ['forwards-7',75],['forwards-8',75],
                ['forwards-9',75],['forwards-10',75],
                ['forwards-11',75],['forwards-12',75],
                ['forwards-13',75],['forwards-14',75],
            ],
            [FighterState.DODGE]:[ 
                ['forwards-1', 75],['forwards-2',75],
                ['forwards-3',75],['forwards-4',75],
                ['forwards-5',75],['forwards-6',75],
                ['forwards-7',75],['forwards-8',75],
                ['forwards-9',75],['forwards-10',75],
                ['forwards-11',75],['forwards-12',75],
                ['forwards-13',75],['forwards-14',FrameDelay.TRANSITION],
            ],

            [FighterState.WALK_FORWARD]: [
                ['forwards-1', 65],['forwards-2',65],
                ['forwards-3',65],['forwards-4',65],
                        
            ],
            [FighterState.WALK_BACKWARD]:[
                ['forwards-4', 65],['forwards-3',65],
                ['forwards-2',65],['forwards-1',65],
        ],
            [FighterState.JUMP_START]:[
                ['jump-land', 50],['jump-land',FrameDelay.TRANSITION],
             ],
            [FighterState.JUMP_LAND]:[
            ['jump-land', 33],['jump-land',117],['jump-land',FrameDelay.TRANSITION],
             ],
            [FighterState.JUMP_UP]:[
                ['jumpup-1', 180],['jumpup-2', 100],
                ['jumpup-3', 100],
            ],
            [FighterState.JUMP_FORWARD]:[
                ['jump-roll-1', 232],['jump-roll-2', 50],
                ['jump-roll-3', 50],['jump-roll-4', 50],
                ['jump-roll-5', 50],['jump-roll-6', 50],
                ['jump-roll-7', FrameDelay.FREEZE],
            ],
            [FighterState.JUMP_BACKWARD]:[
                ['jump-roll-7', 249],['jump-roll-6', 50],
                ['jump-roll-5', 50],['jump-roll-4', 50],
                ['jump-roll-3', 50],['jump-roll-2', 50],
                ['jump-roll-1', FrameDelay.FREEZE],
            ],
            [FighterState.CROUCH]:[['crouch-3',FrameDelay.FREEZE]],
            [FighterState.CROUCH_DOWN]:[
                ['crouch-1', 30],['crouch-2', 30],['crouch-3', 30],['crouch-3', FrameDelay.TRANSITION],
            ],
            [FighterState.CROUCH_UP]:[
                ['crouch-3', 30],['crouch-2', 30],['crouch-1', 30],['crouch-1', FrameDelay.TRANSITION],
            ],
            [FighterState.IDLE_TURN]:[
                ['idle-turn-3', 33],['idle-turn-2', 33],
                ['idle-turn-1', 33],['idle-turn-1', FrameDelay.TRANSITION],
            ],
            [FighterState.CROUCH_TURN]:[
                ['crouch-turn-3', 33],['crouch-turn-2', 33],
                ['crouch-turn-1', 33],['crouch-turn-1', FrameDelay.TRANSITION],
            ],
             [FighterState.LIGHT_PUNCH]:[
                ['light-punch-1', 33],['light-punch-2', 66],
                ['light-punch-1', 66],['light-punch-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HEAVY_PUNCH]:[
                ['light-punch-1', 50],['light-punch-3', 33],['heavy-punch-1', 100],
                ['light-punch-3', 166],['light-punch-1', 199],['light-punch-1', FrameDelay.TRANSITION],
            ],
             [FighterState.LIGHT_KICK]:[
                ['light-punch-1', 50],['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
            ],
             [FighterState.CROUCH_LIGHTKICK]:[
                ['crouch-lightkick-1', 33],['crouch-lightkick-2', 106],
                ['crouch-lightkick-1', 66],['crouch-lightkick-1', FrameDelay.TRANSITION],
            ],
           [FighterState.CROUCH_HEAVYKICK]:[
                ['crouch-heavykick-1', 66],['crouch-heavykick-2', 88],['crouch-heavykick-3', 143],
                ['crouch-heavykick-2', 166],['crouch-heavykick-1', 196],['crouch-heavykick-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HEAVY_KICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-3', 88],
                ['heavy-kick-2', 106],['heavy-kick-1', 106],['heavy-kick-5', FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_HEAVYKICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-3', 88],
                ['heavy-kick-2', 106],['heavy-kick-1', 106],['heavy-kick-5', FrameDelay.TRANSITION],
               // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_LIGHTKICK]:[
                ['light-punch-1', 50],['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
                 // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            
            [FighterState.HURT_HEAD_LIGHT]:[
                ['hurt-face-1', FIGHTER_HURT_DELAY],['hurt-face-1', 30],
                ['hurt-face-2', 40],['hurt-face-3', 90],['hurt-face-3', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_HEAD_HEAVY]:[
                ['hurt-face-3', FIGHTER_HURT_DELAY],['hurt-face-3', 70],
                ['hurt-face-4', 40],['hurt-face-3', 90],['hurt-face-3', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_BODY_LIGHT]:[
                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-1', 70],
                ['hurt-body-2', 90],['hurt-body-2', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_BODY_HEAVY]:[
                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-2', 30],
                ['hurt-body-3', 40],['hurt-body-3', 40],['hurt-body-3', 90],['hurt-body-3', FrameDelay.TRANSITION],
            ],
            [FighterState.SPECIAL_1]:[
                ['special-1', 20],['special-2', 80],['special-3', 20],['special-3', 400],
                ['special-3', FrameDelay.TRANSITION],
            ],
          

        };

        this.initialVelocity = {
            x:{
                [FighterState.WALK_FORWARD]: 3 * 60,
                [FighterState.WALK_BACKWARD]: -(2 * 60),
                [FighterState.JUMP_FORWARD]: ((48 * 3) + (12 * 2)),
                [FighterState.JUMP_BACKWARD]: -((45 * 4) + (15 * 3)),
            },
            jump: -420,
        };
       
        this.SpecialMoves = [
            {
                state: FighterState.SPECIAL_1,
                sequence: 
                [SpecialMoveDirection.DOWN, SpecialMoveDirection.BACKWARD_DOWN, 
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.ANY_PUNCH
                ],
                cursor: 0,
            }
        ];
        this.gravity = 1000;
        
        this.fireball = {fired: false, strength: undefined};

        this.states[FighterState.SPECIAL_1] = {
            init: this.handleSpecial1Init.bind(this),
            update: this.handleSpecial1State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
            ],
        }
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_1];
    }


    handleSpecial1Init(_, strength){
            if(gameState.fighters[this.playerId].skillNumber > 0){
             //this.resetVelocities();
              if(gameState.fighters[this.playerId].skillNumber === 3){
                gameState.fighters[this.playerId].resetSkillBar = true;
            }
            this.voiceSpecial1.play();
            this.fireball = {fired: false, strength};
            this.soundSuperLaunch.play();
            gameState.fighters[this.playerId].superAcivated = true;
            gameState.pauseTimer = 1;
            gameState.pauseFrameMove = -100;
            gameState.pause = true;
            this.velocity.x  = -300;
            this.velocity.y = -100;

            }
        
    }

    handleSpecial1State(time) {
        // if(gameState.fighters[this.playerId].skillNumber < 1)this.changeState(FighterState.IDLE);
        if (!this.fireball.fired && this.animationFrame === 3){
            this.fireball.fired = true;
             gameState.fighters[this.playerId].skillNumber -=1 ;
              gameState.fighters[this.playerId].superAcivated = false;
            
             
            this.entityList.add.call(this.entityList, Fireball, time, this, this.fireball.strength);
            console.log('Firing');
        }
        if (!this.isAnimationCompleted()) return;
         this.changeState(FighterState.IDLE);
    
}
}