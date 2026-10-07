import * as control from '../../inputHandler.js'
import { FIGHTER_HURT_DELAY, FighterAttackStrength, FighterAttackType, FighterState, FrameDelay, HitBox, HurtBox, PushBox, SpecialMoveButton, SpecialMoveDirection } from '../../constants/fighter.js';
import { STAGE_FLOOR } from '../../constants/stage.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
//import { FighterState, PushBox, AnimationFrame } from '../../constants/fighter.js';

import { Fighter, AnimationFrame } from './Fighter.js';
import { KnockLiftSplash } from './shared/KnockLiftSplash.js';
import { Fireball } from './special/Fireball.js';
import { boxOverlap, getActualBoxDimensions } from '../../utils/collisions.js';
import { BlockHitSplash } from './shared/BlockHitSplash.js';
import { HeavyHitSplash } from './shared/HeavyHitSplash.js';
import { GreenHitSplash } from './shared/GreenHitSplash.js';
import { DashEffectSplash } from './shared/DashEffectSplash.js';

export class Mamaoni extends Fighter {
    constructor(playerId, onAttackHit, effectSplash, entityList, entityListForeground) {
        super(playerId, onAttackHit, effectSplash); //Change Direction of the player

        this.entityList = entityList;
        this.entityListForeground = entityListForeground;

        this.image = document.querySelector('img[alt="mamaoni"]');
        this.voiceSpecial3 = document.querySelector('audio#sound-malupiton-special-3');
        this.voiceSpecial2 = document.querySelector('audio#sound-malupiton-special-2');
        this.voiceSpecial1 = document.querySelector('audio#sound-malupiton-special-1');
        this.voiceHyperSkill1 = document.querySelector('audio#sound-malupiton-hyperskill-1');
        this.knockliftSound = document.querySelector('audio#sound-malupiton-knock-lift');
        this.knockliftdownSound = document.querySelector('audio#sound-malupiton-knock-lift-down');
        this.headbuttSound = document.querySelector('audio#sound-malupiton-headbutt');
        this.headbuttDashSound = document.querySelector('audio#sound-malupiton-headbutt-dash');
        this.voiceSpecial1.volume = 0.8;
        this.voiceSpecial2.volume = 0.9;
        this.voiceSpecial3.volume = 0.9;
        this.voiceHyperSkill1.volume = 0.9;
        this.deathSound = document.querySelector('audio#sound-malupiton-death');
        this.deathSound.volume = 0.9;
        this.soundSuperLaunch = document.querySelector('audio#super-launch');
  
        this.soundPayterHurts = [
            document.querySelector("audio#sound-malupiton-hurt-1"),
            document.querySelector("audio#sound-malupiton-hurt-2"),
            document.querySelector("audio#sound-malupiton-hurt-3"),
        ];
        
        this.frames = new Map([
           
           //Idle
                                 ['idle-1', [[[6,122,52,109],[26,107]], [-19,-106,37,103], [[-12,-107,23,21],[-19,-86,37,44],[-23,-42,43,39]], [0,-500,0,0]]],
                                  ['idle-2', [[[60,121,51,109],[26,107]], [-19,-106,37,103], [[-12,-107,23,21],[-19,-86,37,44],[-23,-42,43,39]], [0,-500,0,0]]],
                                  ['idle-3', [[[116,120,51,110],[26,108]], [-19,-106,37,103], [[-12,-107,23,21],[-19,-86,37,44],[-23,-42,43,39]], [0,-500,0,0]]],
                                  ['idle-4', [[[172,120,59,111],[30,109]], [-19,-106,37,103], [[-12,-107,23,21],[-19,-86,37,44],[-23,-42,43,39]], [0,-500,0,0]]],
          
                                  //light punch
                                 ['light-punch-1', [[[13,7,59,106],[29,104]], [-22,-100,46,96], [[-6,-104,21,20],[-14,-84,32,40],[-23,-46,46,41]], [0,-500,0,0]]],
                                  ['light-punch-2', [[[85,8,64,105],[32,103]], [-22,-100,46,96], [[-6,-104,21,20],[-14,-84,32,40],[-23,-46,46,41]], [0,-500,0,0]]],
                                  ['light-punch-3', [[[150,7,73,105],[36,103]], [-22,-100,46,96], [[-6,-104,21,20],[-14,-84,32,40],[-23,-46,46,41]], [10,-97,28,19]]],
                                  ['light-punch-4', [[[223, 8, 73, 104],[36,102]], PushBox.IDLE, HurtBox.IDLE]],
          
                                  //Heavy Punch
                              ['heavy-punch-0', [[[395,7,47,101],[23,99]], [-8,-97,25,93], [[-1,-99,19,20],[-9,-83,29,47],[-15,-54,38,53]], [0,-500,0,0]]],
                              ['heavy-punch-1', [[[298,7,92,102],[46,100]], [-27,-97,35,90], [[-19,-101,28,17],[-28,-86,36,48],[-40,-44,54,42]], [-3,-90,50,17]]],
          
                              //Stand Block
                                 ['stand-block-1', [[[232,121,58,110],[29,108]], [-19,-108,39,105], [[-12,-109,23,21],[-19,-92,37,53],[-21,-40,41,37]], [0,-500,0,0]]],
                                  //Light Kick
                              ['light-kick-1', [[[6,236,44,112],[19,110]], [-16,-106,33,102], [[-22,-112,24,17],[-19,-95,29,44],[-16,-52,29,49]], [0,-500,0,0]]],
                              ['light-kick-2', [[[53,234,85,114],[52,112]], [-17,-111,34,106], [[-22,-112,24,17],[-19,-95,29,44],[-16,-52,29,49]], [0,-500,0,0]]],
                              ['light-kick-3', [[[143,234,118,115],[59,113]], [-17,-109,34,106], [[-22,-112,24,17],[-19,-95,29,44],[-16,-52,29,49]], [7,-89,53,20]]],
                              //Heavy Kick
                              ['heavy-kick-1', [[[276,354,45,118],[22,116]], [-18,-117,28,115], [[-15,-117,19,20],[-20,-103,32,57],[-19,-75,39,71]], [0,-500,0,0]]],
                              ['heavy-kick-2', [[[330,355,113,118],[56,116]], [-43,-115,38,114], [[-45,-115,33,43],[-36,-83,32,82],[-20,-100,78,23]], [-22,-98,78,22]]],
          
                              //walk forwards
                               ['forwards-1', [[[295,119,42,111],[21,109]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['forwards-2', [[[342,120,51,113],[25,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['forwards-3', [[[392,120,38,113],[19,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['forwards-4', [[[440,120,32,113],[16,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['forwards-5', [[[482,123,57,110],[28,108]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['forwards-6', [[[535,119,53,116],[26,114]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
          
                              //Walk Backwards
                              ['backwards-6', [[[295,119,42,111],[21,109]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['backwards-5', [[[342,120,51,113],[25,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['backwards-4', [[[392,120,38,113],[19,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['backwards-3', [[[440,120,32,113],[16,111]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['backwards-2', [[[482,123,57,110],[28,108]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                              ['backwards-1', [[[535,119,53,116],[26,114]], [-17,-109,33,101], [[-12,-110,23,20],[-19,-89,37,56],[-20,-31,37,26]], [0,-500,0,0]]],
                               
                      //Crouch
                      ['crouch-1', [[[270,236,46,109],[23,107]], [-13,-107,29,104], [[-4,-109,19,22],[-17,-95,34,63],[-18,-43,39,42]], [0,-500,0,0]]],
                      ['crouch-2', [[[337,254,51,91],[26,89]], [-11,-90,29,90], [[1,-88,20,19],[-19,-70,33,34],[-11,-44,29,41]], [0,-500,0,0]]],
                      ['crouch-3', [[[402,271,48,74],[24,72]], [-14,-72,33,70], [[5,-77,21,20],[-20,-64,36,38],[-16,-34,33,30]], [0,-500,0,0]]],
                      //Crouch Light Kick
                     ['crouch-lightkick-1', [[[533,394,52,79],[26,77]], [-14,-72,33,70], [[5,-77,21,20],[-20,-64,36,38],[-16,-34,33,30]], [0,-500,0,0]]],
                      ['crouch-lightkick-2', [[[441,402,86,71],[43,69]], [-28,-62,35,59], [[-10,-68,21,20],[-30,-57,30,39],[-6,-26,51,24]], [-22,-26,67,24]]],
          
                      //Crouch Heavy Kick
          ['crouch-heavykick-1', [[[601,388,94,85],[47,83]], [-43,-51,31,51], [[-44,-72,22,23],[-47,-50,30,39],[-44,-21,88,23]], [0,500,0,0]]],
          ['crouch-heavykick-2', [[[702,386,173,87],[86,85]], [-20,-71,44,73], [[-10,-72,21,20],[-21,-61,40,62],[-83,-20,172,21]], [-82,-22,172,26]]],
                      //Jump
                      ['jump-land', [[[337,254,51,91],[26,89]], [-11,-90,29,90], [[1,-88,20,19],[-19,-70,33,34],[-11,-44,29,41]], [0,-500,0,0]]],
                      ['jumpup-1', [[[473,240,36,124],[18,122]], [-11,-114,21,114], [[-8,-119,16,18],[-15,-105,29,50],[-17,-54,26,54]], [0,-500,0,0]]],
                      ['jumpup-2', [[[270,236,46,109],[23,107]], [-11,-104,24,104], [[-4,-105,19,18],[-16,-87,32,51],[-13,-45,29,41]], [0,-500,0,0]]],
                      ['jumpup-3', [[[337,254,53,91],[26,89]], [-11,-90,29,90], [[1,-88,20,19],[-20,-70,34,36],[-11,-44,29,41]], [0,-500,0,0]]],
          
                      //Jump Forwards/Backwards
                 ['jump-roll-1', [[[473,240,36,124],[18,122]], [-11,-114,21,114], [[-8,-119,16,18],[-15,-105,29,50],[-17,-54,26,54]], [0,-500,0,0]]],
                  ['jump-roll-2', [[[523,254,54,94],[27,92]], [-24,-85,40,82], [[-8,-92,20,19],[-22,-76,35,47],[-8,-29,30,30]], [0,-500,0,0]]],
                  ['jump-roll-3', [[[590,267,81,75],[40,73]], [-29,-62,50,44], [[-38,-75,20,21],[-25,-57,43,40],[13,-33,30,30]], [0,-500,0,0]]],
                  ['jump-roll-4', [[[677,265,94,58],[47,56]], [-41,-42,82,32], [[-47,-36,26,27],[-27,-38,51,31],[19,-49,30,30]], [0,-500,0,0]]],
                  ['jump-roll-5', [[[783,251,76,81],[38,79]], [-24,-67,41,60], [[-41,-21,23,24],[-17,-49,37,36],[1,-79,30,30]], [0,-500,0,0]]],
                  ['jump-roll-6', [[[872,231,52,94],[26,92]], [-15,-81,34,80], [[-16,-16,20,22],[-20,-61,39,36],[-22,-89,30,30]], [0,-500,0,0]]],
                  ['jump-roll-7', [[[935,240,78,80],[39,78]], [-8,-58,47,57], [[19,-17,22,20],[2,-52,35,45],[-34,-69,40,32]], [0,-500,0,0]]],
                  ['jump-roll-8', [[[596,158,93,53],[46,51]], [-38,-38,80,34], [[28,-31,21,25],[-20,-38,49,34],[-48,-34,30,30]], [0,-500,0,0]]],
                  ['jump-roll-9', [[[706,157,86,73],[43,71]], [-20,-65,59,44], [[23,-70,22,24],[-23,-62,52,31],[-37,-31,30,30]], [0,-500,0,0]]],
                  ['jump-roll-10', [[[809,136,61,88],[30,86]], [-19,-72,39,67], [[12,-86,19,24],[-18,-68,35,30],[-24,-35,42,33]], [0,-500,0,0]]],
                  ['jump-roll-11', [[[891,126,53,93],[26,91]], [-19,-75,38,71], [[1,-90,22,23],[-13,-72,32,48],[-13,-32,30,30]], [0,-500,0,0]]],
          
                  //hurt face
                  ['hurt-face-3', [[[160,481,78,97],[39,95]], [-21,-91,31,90], [[-35,-95,19,18],[-21,-89,29,86],[-9,-60,44,24]], [0,-500,0,0]]],
                  ['hurt-face-2', [[[83,479,61,101],[30,99]], [-11,-98,24,98], [[-17,-100,19,18],[-16,-87,32,51],[-13,-45,29,41]], [0,-500,0,0]]],
                  ['hurt-face-1', [[[6,479,66,100],[33,98]], [-12,-94,25,91], [[-4,-96,16,18],[-15,-77,32,39],[-19,-56,39,53]], [0,-500,0,0]]],
          
                   //hurt body
                  ['hurt-body-1', [[[255,479,59,90],[30,88]], [-13,-83,28,83], [[12,-86,16,18],[-24,-78,36,36],[-19,-53,26,54]], [0,-500,0,0]]],
                  ['hurt-body-2', [[[331,479,58,92],[29,90]], [-21,-80,34,77], [[10,-88,20,19],[-21,-82,34,39],[-24,-45,29,41]], [0,-500,0,0]]],
                  ['hurt-body-3', [[[400,489,79,82],[39,80]], [-21,-73,42,69], [[22,-71,18,22],[-16,-75,40,30],[-32,-48,29,41]], [0,-500,0,0]]],
              ]);
                  
         this.animations = {
             [FighterState.IDLE]:[ 
                                    ['idle-1', 85],['idle-2', 85],['idle-3', 85],['idle-4', 85],
                                    ['idle-3', 85],['idle-2', 85],['idle-1', 85],
                                ],
                                 [FighterState.WALK_FORWARD]: [
                                                ['forwards-1',85],['forwards-2',85],
                                                ['forwards-3',85],['forwards-4',85],
                                                ['forwards-5',85],['forwards-6',85],       
                                            ],  
                                            [FighterState.WALK_FORWARD]: [
                                                ['forwards-1',85],['forwards-2',85],
                                                ['forwards-3',85],['forwards-4',85],
                                                ['forwards-5',85],['forwards-6',85],       
                                            ],     
                                            [FighterState.WALK_BACKWARD]: [
                                                ['backwards-1',85],['backwards-2',85],
                                                ['backwards-3',85],['backwards-4',85],
                                                ['backwards-5',85],['backwards-6',85],       
                                            ],      
                                            [FighterState.CROUCH]:[['crouch-3',FrameDelay.FREEZE]],
                                                        [FighterState.CROUCH_DOWN]:[
                                                            ['crouch-1', 30],['crouch-2', 30],['crouch-3', 30],['crouch-3', FrameDelay.TRANSITION],
                                                        ],
                                                        [FighterState.CROUCH_UP]:[
                                                            ['crouch-3', 30],['crouch-2', 30],['crouch-1', 30],['crouch-1', FrameDelay.TRANSITION],
                                                        ],        
                                 [FighterState.LIGHT_PUNCH]:[
                                    ['light-punch-1', 33],['light-punch-2', 33],['light-punch-3', 66],
                                    ['light-punch-2', 66],['light-punch-1', FrameDelay.TRANSITION],
                                ],
                                 [FighterState.HEAVY_PUNCH]:[
                                                ['light-punch-1', 50],['light-punch-1', 50],['heavy-punch-0', 33],['heavy-punch-1', 100],
                                                ['heavy-punch-0', 250],['light-punch-1', 199],['light-punch-1', FrameDelay.TRANSITION],
                                            ],
                                            [FighterState.LIGHT_KICK]:[
                                                            ['light-punch-1', 50],['light-kick-1', 50],['light-kick-3', 133],
                                                            ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
                                                        ],
                                 [FighterState.HEAVY_KICK]:[
                                                ['heavy-kick-1', 66],['heavy-kick-1', 78],['heavy-kick-2', 100],
                                                ['heavy-kick-1', 250],['heavy-kick-1', 106],['light-punch-1', FrameDelay.TRANSITION],
                                            ],
                                            [FighterState.CROUCH_LIGHTKICK]:[
                                             ['crouch-lightkick-1', 33],['crouch-lightkick-1', 33],['crouch-lightkick-2', 106],
                                              ['crouch-lightkick-1', 66],['crouch-lightkick-1', FrameDelay.TRANSITION],
                                             ],
                                             [FighterState.CROUCH_HEAVYKICK]:[
                                                 ['crouch-lightkick-1', 40],['crouch-heavykick-1', 40],['crouch-heavykick-2', 143],
                                                   ['crouch-heavykick-1', 166],['crouch-lightkick-1', 196],['crouch-lightkick-1', FrameDelay.TRANSITION],
                                            ],
                                 [FighterState.BLOCK]:[
                                                ['stand-block-1', 60],
                                                ['stand-block-1', FrameDelay.TRANSITION],
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
                                [FighterState.JUMP_BACKWARD]:[
                                                ['jump-roll-1', 120],['jump-roll-2', 50],
                                                ['jump-roll-3', 50],['jump-roll-4', 50],
                                                ['jump-roll-5', 50],['jump-roll-6', 50],
                                                ['jump-roll-7', 50],['jump-roll-8', 50],
                                                ['jump-roll-9', 50],['jump-roll-10', 50],
                                                ['jump-roll-11', FrameDelay.FREEZE],
                                            ],
                                            [FighterState.JUMP_FORWARD]:[
                                                ['jump-roll-1', 120],['jump-roll-11', 50],
                                                ['jump-roll-10', 50],['jump-roll-9', 50],
                                                ['jump-roll-8', 50],['jump-roll-7', 50],
                                                ['jump-roll-6', 50],['jump-roll-5', 50],
                                                ['jump-roll-4', 50],['jump-roll-3', 50],
                                                ['jump-roll-2', 50],['jump-roll-1', 50],
                                                ['jump-roll-1', FrameDelay.FREEZE],
                                            ],
                             [FighterState.HURT_HEAD_LIGHT]:[
                                ['hurt-face-1', FIGHTER_HURT_DELAY],['hurt-face-1', 30],
                                ['hurt-face-2', 40],['hurt-face-2', 40], ['hurt-face-2', 20], ['hurt-face-1', 20],
                                ['hurt-face-1', FrameDelay.TRANSITION],
                            ],
                            [FighterState.HURT_HEAD_HEAVY]:[
                                ['hurt-face-3', FIGHTER_HURT_DELAY],['hurt-face-3', 80],
                                ['hurt-face-2', 50],['hurt-face-1', 70],['hurt-face-1', FrameDelay.TRANSITION],
                            ],
                            [FighterState.HURT_BODY_LIGHT]:[
                                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-1', 30],
                                ['hurt-body-2', 60], ['hurt-body-1', 60], ['hurt-body-1', FrameDelay.TRANSITION],
                            ],
                            [FighterState.HURT_BODY_HEAVY]:[
                                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-2', 80],
                                ['hurt-body-3', 120],['hurt-body-2', 90],['hurt-body-1', 90],['hurt-body-1', FrameDelay.TRANSITION],
                            ],         

        };

        this.initialVelocity = {
            x:{
                [FighterState.WALK_FORWARD]: 3 * 60,
                [FighterState.WALK_BACKWARD]: -(2 * 60),
                [FighterState.JUMP_FORWARD]: ((48 * 3) + (12 * 2)),
                [FighterState.JUMP_BACKWARD]: -((45 * 4) + (15 * 3)),
                [FighterState.HEADBUTT]: 600,
                [FighterState.HEADBUTT_UP]: 600,
                [FighterState.HEADBUTT_DOWN]: 700,
            },
            jump: -420,
        };
       
        this.SpecialMoves = [
            {
                state: FighterState.SPECIAL_1,
                sequence: 
                [SpecialMoveDirection.DOWN, SpecialMoveDirection.BACKWARD_DOWN, 
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.AB,
                ],
                cursor: 0,
            },
            {
                state: FighterState.SPECIAL_2,
                sequence: 
                [SpecialMoveDirection.FORWARD, 
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.BD,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HYPERSKILL_1,
                sequence: 
                [SpecialMoveDirection.DOWN,
                SpecialMoveDirection.UP, SpecialMoveButton.AD,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HYPERSKILL_2,
                sequence: 
                [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.DOWN, SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD,
                SpecialMoveButton.AC,
                ],
                cursor: 0,
            },
            {
                state: FighterState.DODGE_FORWARD,
                sequence: 
                [SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.BC,
                ],
                cursor: 0,
            },
            {
                state: FighterState.DODGE_BACKWARD,
                sequence: 
                [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.BC,
                ],
                cursor: 0,
            },
             {
                state: FighterState.KNOCKLIFT,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveButton.HEAVY_KICK,
                ],
                cursor: 0,
            },
            {
                state: FighterState.KNOCKLIFTDOWN,
                sequence: 
                [SpecialMoveDirection.DOWN, SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_KICK,
                ],
                cursor: 0,
            },
           {
                state: FighterState.HEADBUTT_DOWN,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HEADBUTT_UP,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
             {
                state: FighterState.HEADBUTT,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
            
        ];
        this.gravity = 1000;
        
        this.fireball = {fired: false, strength: undefined};
        this.headbuttActivate = false;
        
        this.states[FighterState.SPECIAL_1] = {
            init: this.handleSpecial1Init.bind(this),
            update: this.handleSpecial1State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_START,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.SPECIAL_2] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.LIGHT,
            init: this.handleSpecial2Init.bind(this),
            update: this.handleSpecial2State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HYPERSKILL_1] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.SUPER2,
            init: this.handleHyperSkill1Init.bind(this),
            update: this.handleHyperSkill1State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_UP, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_LAND,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HYPERSKILL_2] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.SLASH,
            init: this.handleHyperSkill2Init.bind(this),
            update: this.handleHyperSkill2State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_UP, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_LAND,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        
        this.states[FighterState.DODGE_FORWARD] = {
             init: this.handleDodgeForwardInit.bind(this),
             update: this.handleDodgeState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
                 FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.DODGE_BACKWARD] = {
            init: this.handleDodgeBackwardInit.bind(this),
            update: this.handleDodgeState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.KNOCKLIFT] = {
             attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.KNOCKLIFT,
             init: this.handleKnockLiftInit.bind(this),
             update: this.handleKnockLiftState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFTDOWN
                 
            ],
        }
        this.states[FighterState.KNOCKLIFTDOWN] = {
            attackType: FighterAttackType.KICK,
            attackStrength: FighterAttackStrength.KNOCKLIFTDOWN,
             init: this.handleKnockLiftInit.bind(this),
             update: this.handleKnockLiftState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT,
               
            ],
        }
        this.states[FighterState.HEADBUTT] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttInit.bind(this),
             update: this.handleHeadbuttState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HEADBUTT_UP] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttUpInit.bind(this),
             update: this.handleHeadbuttUpState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, 
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HEADBUTT_DOWN] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttDownInit.bind(this),
             update: this.handleHeadbuttDownState.bind(this),
           
            validFrom: [
                FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                 FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        
    
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2];
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HYPERSKILL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HYPERSKILL_2];
        //DOdges
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_FORWARD];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_BACKWARD];
        //special moves
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.KNOCKLIFT];
        
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.KNOCKLIFTDOWN];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT_DOWN];

         //headbutt up valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT];
        //headbutt up valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT_UP];
         //headbutt Down valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT_DOWN];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT_DOWN];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT_DOWN];
        
    }

    handleKnockLiftInit(time, _, strength, attackType, playerId) {
   
     playSound(this.knockliftSound);
        this.gravity = 1000;
    if (attackType === FighterAttackType.PUNCH) {
         playSound(this.knockliftdownSound);
         this.velocity.x = 150;
         this.velocity.y = -380;
        this.entityList.add(KnockLiftSplash, time, this.position.x, this.position.y - 50, this.playerId, 1, this.direction * -1);
    } else if (attackType === FighterAttackType.KICK) {
         playSound(this.knockliftdownSound);
          this.velocity.x = -100;
          this.velocity.y = -380;
        this.entityList.add(KnockLiftSplash, time, this.position.x, this.position.y + 50, this.playerId, -1, this.direction * -1);
        
    }
}


     handleKnockLiftState(){
      
        if (!this.isAnimationCompleted()) return;
        if(this.position.y >= STAGE_FLOOR)this.changeState(FighterState.IDLE);
    }

    handleHeadbuttInit(time) {
       console.log("HEADBUTT INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = 0;
        this.position.y -= 25;
        //this.position.x += 30*this.direction;
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }

    handleHeadbuttUpInit(time) {
        console.log("HEADBUTT Up INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = -300;
       
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }
    handleHeadbuttDownInit(time) {
        console.log("HEADBUTT Down INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = 400;
       
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }

     handleIdleInit(){
            this.resetVelocities();
            this.gravity = 1000;
            this.attackStruck = false;
            if(this.position.y >= STAGE_FLOOR)this.headbuttActivate = false;
        }


    handleHeadbuttState(time, context, camera){
        let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }


       
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.isAnimationCompleted()) {
            if(isTouchingCamera){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }

    handleHeadbuttUpState(time, context, camera){
        console.log("HEADBUTT up STATE");
    let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.isAnimationCompleted()) {
            if(isTouchingCamera){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }
    handleHeadbuttDownState(time, context, camera){
       console.log("HEADBUTT DOWN STATE");
     let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.position.y >= STAGE_FLOOR || this.isAnimationCompleted()) {
            if(isTouchingCamera || this.position.y >= STAGE_FLOOR){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }

    checkHeadbuttHit(camera, context) {
           // Check if touching camera directly instead of using this.touchingCamera
        if (!this.boxes?.hit || !this.opponent?.boxes?.hurt) return false;
        
        const actualHitBox = getActualBoxDimensions(this.position, this.direction, this.boxes.hit);
        if (!actualHitBox || actualHitBox.width <= 0 || actualHitBox.height <= 0) return false;
        
        for (const [hurtLocation, hurtBox] of Object.entries(this.opponent.boxes.hurt)) {
            const [x, y, width, height] = hurtBox;
            const actualOpponentHurtBox = getActualBoxDimensions(
                this.opponent.position, this.opponent.direction, {x, y, width, height}
            );
            if (!actualOpponentHurtBox || actualOpponentHurtBox.width <= 0 || actualOpponentHurtBox.height <= 0) continue;
            
            if (boxOverlap(actualHitBox, actualOpponentHurtBox)) {
                
                return true;
            }
        }
        return false;
    }

    handleDodgeForwardInit(distance, playerId){
        distance = 100;
        this.gravity = 1000;
        this.position.x -= distance;

       // gameState.fighters[this.playerId].sprite += 1;

        playSound(this.soundTeleport);
        this.handleMoveInit();
    }

     handleDodgeBackwardInit(distance, playerId){
        distance = 100;
        this.gravity = 1000;
        this.position.x += distance;

      //  gameState.fighters[this.playerId].sprite += 1;
 
        playSound(this.soundTeleport);
        this.handleMoveInit();
    }

     handleDodgeState(){
       
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

    
  // Hyper Skill 1 - Ultimate Blast
  handleHyperSkill1Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    
    // ✅ Ensure enough skill points & prevent double use
    if (fighter.skillNumber < 3 || fighter.skillUsedThisFrame) return;
    fighter.skillConsumed = false;
    fighter.skillUsedThisFrame = true; // guard
    fighter.skillNumber -= 3; // 🛡️ immediately spend skill
    fighter.resetSkillBar = true;

   // this.voiceHyperSkill1.play();
    playSound(this.voiceHyperSkill1, 1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;
    gameState.hyperSkill = true;
    fighter.hyperSprite += 1;

    console.log('🔥 Hyper Skill 1 initiated — skill points spent immediately');
  }

  handleHyperSkill1State() {
    const frameActivation = 130;
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      this.gravity = 0;
      this.velocity.y = 0;
     // this.opponent.velocity.y = 0;
      this.position.y -= 0.8;
      this.changeState(FighterState.HYPERSKILL_1);

      if (this.isHyperSkillEnabled(frameActivation)) {
        gameState.flash = true;
        console.log('⚡ Hyper Attack Activated!');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      // ✅ Reset guard and state after animation
      gameState.flash = false;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
      this.gravity = 1000;
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.JUMP_BACKWARD);
  }

  // ==============================
  // Hyper Skill 2 - Berserker Barrage
  // ==============================
  handleHyperSkill2Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    
    if (fighter.skillNumber < 3 || fighter.skillUsedThisFrame) return;
    fighter.skillConsumed = false;
    fighter.skillUsedThisFrame = true;
    fighter.skillNumber -= 3;
    fighter.resetSkillBar = true;

    //this.voiceSpecial1.play();
    playSound(this.voiceSpecial1, 1);
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;
    gameState.hyperSkill = true;
    fighter.hyperSprite += 1;

    console.log('🔥 Hyper Skill 2 initiated — skill points spent immediately');
  }

  handleHyperSkill2State() {
    const frameActivation = 140;
    const frameDeactivation = 60;
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.fireball.fired = true;
        this.changeState(FighterState.HYPERSKILL_2);
      }

      if (this.isHyperSkillEnabled(frameActivation)) {
        this.velocity.x = 800;
        console.log('⚡ Berserker Barrage Activated!');
      } else if (this.isHyperSkillEnabled(frameDeactivation)) {
        this.velocity.x = 0;
        console.log('🛑 Berserker Barrage Deactivated!');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      // ✅ Reset guard and flags
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.IDLE);
  }

  handleSpecial1Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    this.gravity = 1000;
    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1; // 🛡️ spend skill immediately

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

  //  this.voiceSpecial3.play();
    playSound(this.voiceSpecial3,1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;

   
    
    fighter.sprite += 1;

    console.log('🔥 Special 1 (Fireball) started — skill spent instantly');
  }

  handleSpecial1State(time) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.entityList.add.call(this.entityList, Fireball, time, this, this.fireball.strength);
        this.fireball.fired = true;
        console.log('🔥 Fireball launched!');
      }

      if (!this.isAnimationCompleted()) return;
        fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false; // reset guard
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.IDLE);
  }

  // ==============================
  // Special Skill 2 - Roll Attack
  // ==============================
  handleSpecial2Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    this.gravity = 1000;
    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1;

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

   // this.voiceSpecial2.play();
    playSound(this.voiceSpecial2,1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;

    this.velocity.x = +300;
    this.velocity.y = -100;
    fighter.sprite += 1;

    console.log('🔥 Special 2 (Roll Attack) started — skill spent instantly');
  }

  handleSpecial2State(time) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.fireball.fired = true;
        this.changeState(FighterState.SPECIAL_2);
        console.log('⚡ Rolling Attack in motion');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
       this.changeState(FighterState.HEAVY_PUNCH);
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.HEAVY_PUNCH);
  }

  // ==============================
  // Fireball Spawn (unchanged)
  // ==============================
  spawnFireball(time) {
    if (!this.position || !this.entityList) {
      console.warn("⚠️ Missing position or entityList in spawnFireball");
      return;
    }

    if (!this.fireball.fired && this.canFireball(time)) {
      const strength = Control.HEAVY_PUNCH;
      this.entityList.add(Fireball, [this, strength], time, this.entityList);
      this.fireball.fired = true;
      this.fireball.lastFired = time.now || performance.now();
      console.log("🔥 Fireball launched by AI");
    }
  }
}
