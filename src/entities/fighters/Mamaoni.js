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
                                //Crouch Block
                       ['crouch-block-1', [[[491,505,48,69],[24,67]], [-15,-71,41,69], [[9,-73,21,20],[-12,-60,37,53],[-18,-38,41,37]], [0,-500,0,0]]],
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
          
                  ['dodge-start', [[[651,1,51,115],[25,113]], [-22,-107,34,104], [[-17,-110,20,18],[-24,-93,28,43],[-19,-72,39,71]], [0,-500,0,0]]],
      //Dodge Backwards
['dodge-backward-1', [[[561,3,73,94],[36,92]], [-27,-86,34,83], [[-33,-91,20,21],[-32,-71,38,40],[-7,-54,29,52]], [0,-500,0,0]]],
['dodge-backward-2', [[[474,9,84,77],[42,75]], [-37,-59,59,45], [[-44,-75,20,21],[-30,-51,40,33],[-1,-41,31,38]], [0,-500,0,0]]],
          
        //Dodge Forward
['dodge-forward-1', [[[718,4,75,100],[37,98]], [-10,-90,26,80], [[18,-95,20,19],[-13,-79,44,45],[-21,-58,31,57]], [0,-500,0,0]]],
['dodge-forward-2', [[[803,3,82,91],[41,89]], [-14,-74,38,65], [[21,-88,19,20],[-12,-74,38,30],[-24,-48,33,42]], [0,-500,0,0]]],
          
        //Death
['death-1', [[[576,499,67,104],[33,102]], [-20,-94,36,93], [[-34,-101,25,20],[-29,-94,44,45],[-8,-54,32,49]], [0,-500,0,0]]],
['death-2', [[[651,499,81,99],[40,97]], [-19,-88,43,79], [[-41,-92,21,25],[-26,-84,48,42],[11,-49,28,49]], [0,-500,0,0]]],
['death-3', [[[738,504,97,85],[48,83]], [-24,-70,61,61], [[-51,-64,25,20],[-38,-69,43,31],[0,-54,39,51]], [0,-500,0,0]]],
['death-4', [[[837,510,105,64],[52,62]], [-44,-38,88,23], [[-53,-35,23,23],[-45,-38,58,25],[5,-27,46,21]], [0,-500,0,0]]],
['death-5', [[[582,620,105,53],[52,51]], [-50,-35,94,23], [[-52,-20,14,19],[-38,-37,57,38],[4,-28,47,30]], [0,-500,0,0]]],
['death-6', [[[699,623,110,48],[55,38]], [-53,-33,99,20], [[-55,-30,19,25],[-42,-33,51,31],[5,-25,46,24]], [0,-500,0,0]]],
['death-7', [[[830,633,108,36],[54,26]], [-50,-27,101,21], [[-54,-27,17,17],[-45,-32,70,24],[1,-28,49,26]], [0,-500,0,0]]],
['death-8', [[[673,492,97,103],[48,92]], [-41,-59,70,43], [[-53,-83,20,25],[-45,-63,48,41],[4,-54,29,41]], [0,-500,0,0]]],

//getUp
['getUp-1', [[[395,595,80,41],[40,39]], [-24,-38,63,37], [[19,-39,21,25],[-21,-38,52,37],[-33,-31,27,34]], [0,-500,0,0]]],
['getUp-2', [[[491,505,57,74],[28,72]], [-19,-70,40,68], [[1,-71,20,18],[-16,-54,34,26],[-21,-33,46,30]], [0,-500,0,0]]],
['getUp-3', [[[491,590,65,64],[32,62]], [-27,-60,54,59], [[8,-62,20,25],[-24,-49,48,41],[-23,-33,37,34]], [0,-500,0,0]]],
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
                                  [FighterState.DODGE_BACKWARD]:[ 
                                                ['dodge-start', 40], ['dodge-backward-1', 40],
                                                ['dodge-backward-2', 150], 
                                                ['dodge-backward-1', 40],
                                                ['dodge-start',FrameDelay.TRANSITION],
                                            ],
                                             [FighterState.DODGE_FORWARD]:[ 
                                                ['dodge-start', 40], ['dodge-forward-1', 40],
                                                ['dodge-forward-2', 150], 
                                                ['dodge-forward-1', 40],
                                                ['dodge-start',FrameDelay.TRANSITION],
                                            ],
                                [FighterState.CROUCH]:[['crouch-3',FrameDelay.FREEZE]],
                                            [FighterState.CROUCH_DOWN]:[
                                                ['crouch-1', 30],['crouch-2', 30],['crouch-3', 30],['crouch-3', FrameDelay.TRANSITION],
                                            ],
                                            [FighterState.CROUCH_UP]:[
                                                ['crouch-3', 30],['crouch-2', 30],['crouch-1', 30],['crouch-1', FrameDelay.TRANSITION],
                                            ],
                                             [FighterState.IDLE_TURN]:[
                                            ['idle-3', 33],['idle-2', 33],
                                            ['idle-1', 33],['idle-1', FrameDelay.TRANSITION],
                                            ],
                                            [FighterState.CROUCH_TURN]:[
                                            ['crouch-3', 33],['crouch-2', 33],
                                            ['crouch-1', 33],['crouch-1', FrameDelay.TRANSITION],
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
                                [FighterState.JUMP_LIGHTKICK]:[
                                                ['light-punch-1', 50],['light-kick-1', 50],['light-kick-3', 133],
                                                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
                                            ],
                     [FighterState.JUMP_HEAVYKICK]:[
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
                                 [FighterState.CROUCH_BLOCK]:[
                                                ['crouch-block-1', 60],
                                                ['crouch-block-1', FrameDelay.TRANSITION],
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
                            [FighterState.LAYDOWN_GROUND]:[
                                ['death-1', 300], ['death-2', 120], ['death-3', 120], 
                                ['death-4', 120], ['death-5', 120], ['death-6', 120], 
                                ['death-7', 120],
                                ['death-7', FrameDelay.FREEZE],
                            ],
                            [FighterState.FALL]:[
                                ['fall-4', 100], ['fall-5', 100], ['fall-6', 100], 
                                ['fall-7', 100],
                                ['fall-7', FrameDelay.TRANSITION],
                            ],
                             [FighterState.GETUP]:[
                                ['death-7', 300], ['getUp-1', 120], ['getUp-2', 120], ['getUp-3', 120],
                                ['getUp-3', FrameDelay.TRANSITION],
                            ],           

        };

        this.initialVelocity = {
            x:{
                [FighterState.WALK_FORWARD]: 3 * 60,
                [FighterState.WALK_BACKWARD]: -(2 * 60),
                [FighterState.DODGE_FORWARD]: -((80 * 4) + (12 * 2)),
                [FighterState.DODGE_BACKWARD]: ((80 * 4) + (12 * 3)),
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
                            state: FighterState.DODGE_BACKWARD,
                            sequence: 
                            [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD,SpecialMoveButton.BC,
                            ],
                            cursor: 0,
                        },
            {
                state: FighterState.DODGE_FORWARD,
                sequence: 
                [SpecialMoveDirection.FORWARD,SpecialMoveDirection.FORWARD, SpecialMoveButton.BC,
                ],
                cursor: 0,
            },
            
        ];
        this.gravity = 1000;
        
        this.fireball = {fired: false, strength: undefined};
        
         this.states[FighterState.DODGE_FORWARD] = {
             init: this.handleDodgeForwardInit.bind(this),
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
            init: this.handleDodgeBackwardInit.bind(this),
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
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2];
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HYPERSKILL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HYPERSKILL_2];
        //Dodges
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_FORWARD];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_BACKWARD];
       
        
    }

  
 handleIdleInit(){
                this.resetVelocities();
                this.gravity = 1000;
            }

   handleDodgeForwardInit() {
    this.gravity = 1000;
    this.velocity.y = 0;
    this.velocity.x = this.direction * (this.initialVelocity.x[FighterState.DODGE_FORWARD] ?? 0);
}

   handleDodgeBackwardInit() {
    this.gravity = 1000;
    this.velocity.y = 0;
    this.velocity.x = this.direction * (this.initialVelocity.x[FighterState.DODGE_BACKWARD] ?? 0);
}
       
   handleDodgeState() {
    gameState.dodging = true;

    if (!this.isAnimationCompleted()) return;

    gameState.dodging = false;
    this.velocity.x = 0;
    this.direction = this.getDirection();
    this.changeState(FighterState.IDLE);
}

}
