import * as control from '../../inputHandler.js'
import { FIGHTER_HURT_DELAY, FighterAttackStrength, FighterState, FrameDelay, HitBox, HurtBox, PushBox, SpecialMoveButton, SpecialMoveDirection } from '../../constants/fighter.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
//import { FighterState, PushBox, AnimationFrame } from '../../constants/fighter.js';

import { Fighter, AnimationFrame } from './Fighter.js';
import { Fireball } from './special/Fireball.js';
import { Rock } from './special/Rock.js';
import { BlockRock } from './special/BlockRock.js';

export class Golem extends Fighter {
    constructor(playerId, onAttackHit, entityList){
        super(playerId, onAttackHit); //Change Direction of the player

        this.entityList = entityList;

        this.image = document.querySelector('img[alt="golem"]');
        this.voiceSpecial3 = document.querySelector('audio#sound-malupiton-special-3');
        this.voiceSpecial2 = document.querySelector('audio#sound-malupiton-special-2');
        this.voiceSpecial1 = document.querySelector('audio#sound-golem-special-1');
        this.voiceHyperSkill1 = document.querySelector('audio#sound-malupiton-hyperskill-1');
        this.soundGroundCrash = document.querySelector('audio#sound-groundCrash');
        this.soundGroundCrash.volume = 1;
        this.voiceSpecial1.volume = 1;
        this.voiceSpecial2.volume = 0.9;
        this.voiceSpecial3.volume = 0.9;
        this.voiceHyperSkill1.volume = 0.9;
        this.deathSound = document.querySelector('audio#sound-malupiton-death');
        this.deathSound.volume = 0.9;
        this.soundSuperLaunch = document.querySelector('audio#super-launch');
        this.frames = new Map([
           
           //Forwards or Idle
            ['forwards-1', [[[330,346, 55, 99],[27,97]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-2', [[[404, 346,55,99],[27,97]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-3', [[[472, 346,55,99],[27,97]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-4', [[[543, 346,55,99],[27,97]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-5', [[[613, 346,55,99],[27,97]], PushBox.IDLE, HurtBox.IDLE]],
            
            
            //Jump Up
            ['jumpup-1', [[[71, 110,54,97],[27,95]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-2', [[[472, 221,53,101],[21,99]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-3', [[[87, 16,56,83],[28,81]], PushBox.CROUCH, HurtBox.CROUCH]],
            
            
            //Jump Forwards/Backwards
            ['jump-roll-1', [[[71, 109, 56, 99], [28,97]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-2', [[[137, 114, 86, 92], [43,90]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-3', [[[222, 133, 109, 55], [54,53]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-4', [[[337, 101, 58, 109], [29,107]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-5', [[[318, 13, 97, 78], [48,76]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-6', [[[239, 12, 61, 108], [30,106]], PushBox.JUMP, HurtBox.JUMP]],

            //Jump first/Last frame
            ['jump-land', [[[87, 16, 56, 83], [28,81]], PushBox.IDLE, HurtBox.IDLE]],

             //Crouch
            ['crouch-1', [[[16, 3, 55, 98], [26,96]], PushBox.IDLE, HurtBox.JUMP]],
            ['crouch-2', [[[87, 16, 56, 83], [28,81]], PushBox.BEND, HurtBox.BEND]],
            ['crouch-3', [[[162, 32, 62, 70], [31,68]], PushBox.CROUCH, HurtBox.CROUCH]], 
           
            //Idle

            ['stands-1', [[[200, 523, 55, 92], [27,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-2', [[[133, 526,59,92],[29,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-3', [[[67, 528,60,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-4', [[[2, 528,61,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]], 

            //Idle Turn
            ['idle-turn-3', [[[330, 232,51,94],[25,92]], PushBox.IDLE, [[-10, -89, 28, 10],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-2', [[[400, 233,59,92],[30,90]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-1', [[[145, 233,53,90],[26,88]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],

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
            ['light-punch-1', [[[71, 109, 56, 99], [8,97]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['light-punch-2', [[[83, 361, 104, 71], [32,79]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]], HitBox.LIGHT_PUNCH]],
            ['light-punch-3', [[[83, 361, 104, 71], [32,79]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],

             //Heavy Punch
            ['heavy-punch-1', [[[222, 133, 109, 55], [-8,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]], HitBox.HEAVY_PUNCH]],

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

            //Standing Block
            ['stand-block-1', [[[87, 692, 60, 99], [30,97]], PushBox.IDLE, HurtBox.IDLE,]],

            //Rock on Block entity
            ['rock-1', [[[265, 765, 15, 42], [7,40]], PushBox.IDLE, HurtBox.IDLE,]],
            ['rock-2', [[[238, 741, 17, 64], [7,40]], PushBox.IDLE, HurtBox.IDLE,]],
            ['rock-3', [[[211, 708, 18, 97], [9,95]], PushBox.IDLE, HurtBox.IDLE,]],
            ['rock-2', [[[184, 686, 18, 119], [9,117]], PushBox.IDLE, HurtBox.IDLE,]],
            
            //Crouch Block
            ['crouch-block-1', [[[162, 32, 62, 70], [31,68]], PushBox.CROUCH, HurtBox.CROUCH]], 
            


            //Dodge Anim
             ['dodge-1', [[[95, 464, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['dodge-2', [[[170, 463, 55, 102], [23,100]], PushBox.NULL, HurtBox.NULL]],
             ['dodge-3', [[[235, 462, 55, 103], [27,101]], PushBox.NULL,HurtBox.NULL]],
             ['dodge-4', [[[300, 462, 55, 103], [27,101]], PushBox.NULL,HurtBox.NULL]],

             //Dodge Anim2
             ['dodge2-1', [[[95, 464, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['dodge2-2', [[[171, 576, 55, 102], [23,100]], PushBox.NULL, HurtBox.NULL]],
             ['dodge2-3', [[[244, 579, 68, 104], [34,102]], PushBox.NULL,HurtBox.NULL]],
             ['dodge2-4', [[[337, 590, 88, 91], [44,89]], PushBox.NULL,HurtBox.NULL]],

             //Death State
                 ['death-1', [[[379, 461, 67, 97], [33,95]], PushBox.IDLE, HurtBox.IDLE]],
                 ['death-2', [[[462, 463, 58, 99], [29,97]],PushBox.IDLE, HurtBox.IDLE]],
                 ['death-3', [[[538, 464, 78, 84], [39,82]],PushBox.IDLE, HurtBox.IDLE]],
                ['death-4', [[[624, 469, 97, 70], [48,68]],PushBox.IDLE, HurtBox.IDLE]],
                ['death-5', [[[731, 476, 102, 55], [51,53]],PushBox.IDLE, HurtBox.IDLE]],
                ['death-6', [[[492, 585, 102, 39], [51,37]],PushBox.IDLE, HurtBox.IDLE]],
                ['death-7', [[[608, 585, 92, 28], [46,26]],PushBox.IDLE, HurtBox.IDLE]],

                //GetUp State
                 ['getUp-1', [[[392, 678, 94, 64], [47,62]], PushBox.IDLE, HurtBox.NULL]],
                ['getUp-2', [[[491, 670, 81, 72], [40,70]], PushBox.IDLE, HurtBox.NULL]],
                 ['getUp-3', [[[601, 653, 59, 95], [29,93]], PushBox.IDLE, HurtBox.NULL]],

             //Special 1 Death Impact
             ['special1-1', [[[473, 12, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['special1-2', [[[537, 12, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['special1-3', [[[601, 12, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['special1-4', [[[676, 12, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['special1-5', [[[751, 12, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['special1-6', [[[815, 18, 55, 99], [28,67]], PushBox.NULL, HurtBox.NULL]],
             ['special1-7', [[[880, 18, 55, 99], [28,67]], PushBox.NULL, HurtBox.NULL]],
            
        ]);

                  
         this.animations = {
            //Golem ok
            [FighterState.IDLE]:[ 
                ['forwards-1', 85],['forwards-2',85],
                ['forwards-3',85],['forwards-2',85]
               ,['forwards-1',85],
                ['forwards-4',85],['forwards-5',85],['forwards-4',85]
            ],
            [FighterState.DODGE_BACKWARD]:[ 
               ['dodge-1', 40],['dodge-2', 40], 
               ['dodge-3', 50], ['dodge-4', 300],['dodge-3', 40],['dodge-2', 40],['dodge-1', 40], ['dodge-1',FrameDelay.TRANSITION],
                        ],
              [FighterState.DODGE_FORWARD]:[ 
               ['dodge-1', 40],['dodge-2', 40], 
               ['dodge-3', 50], ['dodge-4', 300],['dodge-3', 40],['dodge-2', 40],['dodge-1', 40], ['dodge-1',FrameDelay.TRANSITION],
                        ],
                [FighterState.BLOCK]:[
                ['stand-block-1', 60],
                ['stand-block-1', FrameDelay.TRANSITION],
                ],          
                [FighterState.CROUCH_BLOCK]:[
                ['crouch-block-1', 60],
                ['crouch-block-1', FrameDelay.TRANSITION],
            ],
             //Golem ok
            [FighterState.WALK_FORWARD]: [
                ['forwards-4',85],['forwards-5',85],['forwards-4',85], ['forwards-3',85],['forwards-2',85],['forwards-1',85]
                        
            ],
             //Golem ok
            [FighterState.WALK_BACKWARD]:[
                ['forwards-4',85],['forwards-5',85],['forwards-4',85], ['forwards-3',85],['forwards-2',85],['forwards-1',85]
        ],
         //Golem ok
            [FighterState.JUMP_START]:[
                ['jump-land', 50],['jump-land',FrameDelay.TRANSITION],
             ],
              //Golem ok
            [FighterState.JUMP_LAND]:[
            ['jump-land', 33],['jump-land',117],['jump-land',FrameDelay.TRANSITION],
             ],
              //Golem ok
            [FighterState.JUMP_UP]:[
                ['jumpup-1', 180],['jumpup-2', 100],
                ['jumpup-3', FrameDelay.FREEZE],
            ],
             //Golem ok
            [FighterState.JUMP_FORWARD]:[
                ['jump-roll-1', 232],['jump-roll-2', 50],
                ['jump-roll-3', 50],['jump-roll-4', 50],
                ['jump-roll-5', 50],['jump-roll-6', FrameDelay.FREEZE],
            ],
             //Golem ok
            [FighterState.JUMP_BACKWARD]:[
                ['jump-roll-6', 249],
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
                ['heavy-kick-2', 106],['heavy-kick-1', 106],['heavy-kick-5', 5],
               // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_LIGHTKICK]:[
                ['light-punch-1', 50],['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', 5],
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
                ['special1-1', 100],['special1-2', 100],['special1-3', 100],['special1-4', 100],['special1-5', 100],['special1-6', 100],['special1-7', 100],
                ['special1-6', 60], ['special1-5', 60], ['special1-4', 60], ['special1-3', 90], ['special1-2', 60], ['special1-1', 60],
                ['special1-1', FrameDelay.TRANSITION],
            ],

             [FighterState.DEATH]:[
                            ['death-1', 300], ['death-2', 120], ['death-3', 120], 
                            ['death-4', 120], ['death-5', 120], ['death-6', 120], 
                            ['death-7', 120],
                            ['death-7', FrameDelay.TRANSITION],
                        ],
                        [FighterState.DIE]:[
                            ['death-7', 7000],
                            ['death-7', FrameDelay.TRANSITION],
                        ],
                        [FighterState.KNOCKUP]:[
                            ['death-1', 100], ['death-2', 120], ['death-3', 120], 
                            ['death-4', 120], ['death-5', 120], ['death-6', 130], 
                            ['death-7', 120],
                            ['death-7', FrameDelay.TRANSITION],
                        ],
                         [FighterState.GETUP]:[
                            ['death-7', 300], ['getUp-1', 120], ['getUp-2', 100], ['getUp-3', 100],['forwards-5',85],
                            ['forwards-5', FrameDelay.TRANSITION],
                        ],
          

        };

        this.initialVelocity = {
            x:{
                [FighterState.WALK_FORWARD]: 3 * 60,
                [FighterState.WALK_BACKWARD]: -(2 * 60),
                [FighterState.JUMP_FORWARD]: ((48 * 3) + (12 * 2)),
                [FighterState.JUMP_BACKWARD]: -((45 * 4) + (15 * 3)),
                [FighterState.DODGE_FORWARD]: ((80 * 4) + (12 * 2)),
                [FighterState.DODGE_BACKWARD]: -((80 * 4) + (12 * 3)),
            },
            jump: -420,
        };
       
        this.SpecialMoves = [
            {
                            state: FighterState.DODGE_BACKWARD,
                            sequence: 
                            [SpecialMoveButton.BC,
                            ],
                            cursor: 0,
                        },
                        {
                            state: FighterState.DODGE_FORWARD,
                            sequence: 
                            [SpecialMoveButton.BC,
                            ],
                            cursor: 0,
                        },
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
            shadow: [1.6, 1, 0, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
            ],
        }
        this.states[FighterState.DODGE_FORWARD] = {
             init: this.handleDodgeInit.bind(this),
             update: this.handleDodgeState.bind(this),
             shadow: [0, 0, 0, 0],
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
            ],
        }
        this.states[FighterState.DODGE_BACKWARD] = {
            init: this.handleDodgeInit.bind(this),
            update: this.handleDodgeState.bind(this),
             shadow: [0, 0, 0, 0],
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
            ],
        }
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_FORWARD];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_BACKWARD];
    }


     handleDodgeInit(distance, playerId){
       // playSound(this.soundTeleport);
         if(!control.isForward(this.playerId, this.direction) && !control.isBackward(this.playerId, this.direction)){
             this.changeState(FighterState.IDLE);
             return;
         }
           if (control.isForward(this.playerId, this.direction)) {
                       console.log('Dodge Forward Init');
                        this.velocity.x = -this.initialVelocity.x[this.currentState] ?? 0;
                   }else if (control.isBackward(this.playerId, this.direction)) {
                       console.log('Dodge Backward Init');
                        this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0;
        }
    }
    
         handleDodgeState(){
        
           
           if (control.isForward(this.playerId, this.direction)) {
                       console.log('Dodge Forward State');
                        this.changeState(FighterState.DODGE_FORWARD);
                   }else if (control.isBackward(this.playerId, this.direction)) {
                       console.log('Dodge Backward State');
                        this.changeState(FighterState.DODGE_BACKWARD);
        }
            
            if (!this.isAnimationCompleted()) return;
              this.direction = this.getDirection();
            this.changeState(FighterState.IDLE);
        }
         

       handleBlockInit(time, hitPosition){
         this.entityList.add.call(this.entityList, BlockRock, time, this, this.fireball.strength);
              this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, FighterAttackStrength.BLOCK);
               
                playSound(this.soundHits.BLOCK);
             //  this.EntityList.add(SuperHitSplash, time, this.opponent.position.x, this.opponent.position.y - 30, this.opponent.playerId);
               this.handleMoveInit();
           }

           handleCrouchBlockInit(time, hitPosition){
            this.entityList.add.call(this.entityList, BlockRock, time, this, this.fireball.strength);
                  this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, FighterAttackStrength.BLOCK);
                 
                   playSound(this.soundHits.BLOCK);
                 
                   this.handleMoveInit();
               }
        
       

        // ==============================
  // Special Skill 1 - Fireball
  // ==============================
  handleSpecial1Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1; // 🛡️ spend skill immediately

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

    this.voiceSpecial1.play();
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;

    
    this.velocity.x = 330;
    this.velocity.y = -420;
    fighter.sprite += 1;

    console.log('🔥 Special 1 (Fireball) started — skill spent instantly');
  }

  handleSpecial1State(time) {
    
    const fighter = gameState.fighters[this.playerId];
    
    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 7) {
        this.soundGroundCrash.play();

        gameState.cameraShake.enable = true;
        gameState.cameraShake.duration = 0.5;
        gameState.cameraShake.intensity = 15;

        this.entityList.add.call(this.entityList, Rock, time, this, this.fireball.strength);
        this.fireball.fired = true;
        this.velocity.x = 0;
        console.log('🔥 Fireball launched!');
      }

      if (!this.isAnimationCompleted()) return;
        fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false; // reset guard
    }

    this.changeState(FighterState.IDLE);
  }
        
}