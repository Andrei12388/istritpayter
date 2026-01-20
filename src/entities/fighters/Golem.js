import * as control from '../../inputHandler.js'
import { FIGHTER_HURT_DELAY, FighterAttackStrength, FighterAttackType, FighterState, FrameDelay, HitBox, HurtBox, PushBox, SpecialMoveButton, SpecialMoveDirection } from '../../constants/fighter.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
//import { FighterState, PushBox, AnimationFrame } from '../../constants/fighter.js';

import { Fighter, AnimationFrame } from './Fighter.js';
import { Fireball } from './special/Fireball.js';
import { Rock } from './special/Rock.js';
import { BlockRock } from './special/BlockRock.js';
import { STAGE_FLOOR } from '../../constants/stage.js';
import { HeavyRock } from './special/HeavyRock.js';
import { RockSplash } from './special/RockSplash.js';
import { boxOverlap, getActualBoxDimensions } from '../../utils/collisions.js';
import { TornadoSpinSplash } from './shared/TornadoSpinSplash.js';

export class Golem extends Fighter {
    constructor(playerId, onAttackHit, effectSplash, entityList, entityListForeground) {
        super(playerId, onAttackHit, effectSplash); //Change Direction of the player

        this.entityList = entityList;
        this.entityListForeground = entityListForeground;
        
        this.image = document.querySelector('img[alt="golem"]');

        this.voiceSpecial2 = document.querySelector('audio#sound-malupiton-special-2');
        this.voiceSpecial1 = document.querySelector('audio#sound-golem-special-1');
        this.voiceHyperSkill1 = document.querySelector('audio#sound-golem-hyperskill-1');
        this.soundGroundCrash = document.querySelector('audio#sound-groundCrash');
        this.soundKneeDash = document.querySelector('audio#sound-fighter-heavy-attack');
        this.soundKneeDash.volume = 1;
        this.soundGroundCrash.volume = 1;
        this.voiceSpecial1.volume = 1;
        this.voiceSpecial2.volume = 0.9;
        this.voiceHyperSkill1.volume = 0.9;

        this.golemEnableMove = false;
        this.quake = false;
        this.rockspawn = true;

        this.deathSound = document.querySelector('audio#sound-golem-death');
        this.deathSound.volume = 1;
        this.soundSuperLaunch = document.querySelector('audio#super-launch');
        this.frames = new Map([
           
           //Forwards or Idle
            ['forwards-1', [[[330,346, 55, 99],[27,97]], [-13,-82,33,78],[[-5,-95,32,22],[-20,-80,44,38],[-20,-41,40,39]]]],
            ['forwards-2', [[[404, 346,55,99],[27,97]], [-13,-82,33,78],[[-5,-95,32,22],[-20,-80,44,38],[-20,-41,40,39]]]],
            ['forwards-3', [[[472, 346,55,99],[27,97]], [-13,-82,33,78],[[-5,-95,32,22],[-20,-80,44,38],[-20,-41,40,39]]]],
            ['forwards-4', [[[543, 346,55,99],[27,97]], [-13,-82,33,78],[[-5,-95,32,22],[-20,-80,44,38],[-20,-41,40,39]]]],
            ['forwards-5', [[[613, 346,55,99],[27,97]], [-13,-82,33,78],[[-5,-95,32,22],[-20,-80,44,38],[-20,-41,40,39]]]],

            ['forwards2-1', [[[45,966, 87, 101],[44,99]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-2', [[[148,967, 84, 101],[42,99]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-3', [[[244,969, 90, 98],[45,96]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-4', [[[347,968, 71, 98],[35,96]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-5', [[[446,967, 76, 103],[38,101]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-6', [[[536,968, 57, 102],[28,100]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-7', [[[610,969, 78, 102],[39,100]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards2-8', [[[693,968, 81, 106],[40,104]], PushBox.IDLE, HurtBox.IDLE]],
            
            
            
            //Jump Up
            ['jumpup-1', [[[71, 110,54,97],[27,95]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-2', [[[472, 221,53,101],[21,99]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-3', [[[87, 16,56,83],[28,81]], PushBox.BEND, HurtBox.BEND]],
            
            
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
            ['crouch-1', [[[7, 1923, 66, 91], [33,89]], PushBox.IDLE, HurtBox.JUMP]],
            ['crouch-2', [[[78, 1932, 71, 82], [35,80]], PushBox.BEND, HurtBox.BEND]],
            ['crouch-3', [[[154, 1955, 70, 59], [35,61]], PushBox.CROUCH, HurtBox.CROUCH]], 

            // crouch old
           // ['crouch-1', [[[16, 3, 55, 98], [26,96]], PushBox.IDLE, HurtBox.JUMP]],
           // ['crouch-2', [[[87, 16, 56, 83], [28,81]], PushBox.BEND, HurtBox.BEND]],
           // ['crouch-3', [[[162, 32, 62, 70], [31,68]], PushBox.CROUCH, HurtBox.CROUCH]], 
           
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
            ['crouch-lightkick-1', [[[13, 2023, 61, 84], [30,82]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-lightkick-2', [[[86, 2027, 112, 82], [66,80]], [-55,-68,32,54], [[-42,-88,28,22],[-55,-65,36,47],[-60,-25,117,20]], [5,-17,42,16] ]],

            //Crouch Heavvy Kick
            ['crouch-heavykick-1', [[[17, 2122, 69, 78], [40,76]], [-32,-65,32,53], [[-30,-83,28,21],[-36,-64,51,63],[-37,-35,74,20]]]],
            ['crouch-heavykick-2', [[[97, 2118, 99, 83], [50,81]],[-32,-65,32,53], [[-30,-83,28,21],[-36,-64,51,63],[-37,-35,90,20]]]],
            ['crouch-heavykick-3', [[[201, 2118, 135, 82], [67,80]], [-66,-73,57,54], [[-78,-87,28,22],[-69,-74,63,64],[-49,-20,125,20]], [-8,-25,75,23]]],
            ['crouch-heavykick-3-nohit', [[[201, 2118, 135, 82], [67,80]], [-66,-73,57,54], [[-78,-87,28,22],[-69,-74,63,64],[-49,-20,125,20]]]],

            //Jump-attack
            ['jump-attack-1', [[[555, 42, 94, 54], [46,52]], PushBox.LIGHT_KICK, HurtBox.LIGHT_KICK, HitBox.JUMP_HEAVYKICKK]],

            //lIGHT Punch
            ['light-punch-1', [[[71, 109, 56, 99], [8,97]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['light-punch-2', [[[83, 361, 104, 71], [32,79]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]], [20,-70,50,18]]],
            ['light-punch-3', [[[83, 361, 104, 71], [32,79]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],

             //Heavy Punch
            ['heavy-punch-1', [[[222, 133, 109, 55], [-8,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]], HitBox.HEAVY_PUNCH]],

             //lIGHT kick
            ['light-kick-1', [[[336, 1434, 59, 93], [30,91]], [-20, -90, 40, 80],  [[-30, -108, 32, 22],[-30, -88, 44, 87], [-23, -50, 53, 20]]]],
            ['light-kick-2', [[[410, 1430, 118, 101], [59,99]], PushBox.BEND, [[-58, -111, 32, 22],[-58, -88, 53, 87], [-35, -50, 94, 30]], [16,-35,40,16]]],

             //Heavy kick
            ['heavy-kick-1', [[[148, 1435, 85, 94], [42,92]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-2', [[[234, 1433, 94, 95], [47,93]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-3', [[[336, 1434, 59, 93], [30,91]], [-20, -90, 40, 80],  [[-30, -108, 32, 22],[-30, -88, 44, 87], [-23, -50, 53, 20]]]],
            ['heavy-kick-4', [[[547, 1431, 86, 96], [43,94]], [-20, -90, 40, 80],  [[-30, -108, 32, 22],[-30, -88, 44, 87], [-23, -50, 53, 20]]]],
            ['heavy-kick-5', [[[659, 1424, 130, 105], [65,103]], [-20, -90, 40, 80],  [[-30, -108, 32, 22],[-30, -88, 44, 87], [-23, -50, 53, 20]],[8,-69,55,27]]],

            //Hit Face
            ['hurt-face-3', [[[886, 774,73,84],[26,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-2', [[[811, 772,65,92],[32,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-1', [[[741, 767,58,99],[29,97]], PushBox.IDLE, HurtBox.IDLE]],

            //Hurt Body
            ['hurt-body-1', [[[602, 653, 58, 95], [29,93]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-2', [[[678, 659, 70, 89], [35,87]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-3', [[[749, 666, 83, 75], [41,73]], PushBox.CROUCH, [[-26, -61, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],

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
             ['dodge-1', [[[95, 464, 55, 99], [28,97]], PushBox.NULL, HurtBox.IDLE]],
             ['dodge-2', [[[170, 463, 55, 102], [23,100]], PushBox.NULL, HurtBox.NULL]],
             ['dodge-3', [[[235, 462, 55, 103], [27,101]], PushBox.NULL,HurtBox.NULL]],
             ['dodge-4', [[[300, 462, 55, 103], [27,101]], PushBox.NULL,HurtBox.NULL]],

             //Dodge Anim2
             ['dodge2-1', [[[95, 464, 55, 99], [28,97]], PushBox.NULL, HurtBox.NULL]],
             ['dodge2-2', [[[171, 576, 55, 102], [23,100]], PushBox.NULL, HurtBox.NULL]],
             ['dodge2-3', [[[244, 579, 68, 104], [34,102]], PushBox.NULL,HurtBox.NULL]],
             ['dodge2-4', [[[337, 590, 88, 91], [44,89]], PushBox.NULL,HurtBox.NULL]],

             //Death State
                 ['death-1', [[[379, 461, 67, 97], [33,95]], [-6,-91,24,65], [[-10,-97,28,22],[-6,-75,33,48],[-26,40,39,39]]]],
                 ['death-2', [[[462, 463, 58, 99], [29,97]],[-9,-83,28,65], [[-25,-97,28,22],[-7,-79,33,48],[-14,-40,39,39]]]],
                 ['death-3', [[[536, 463, 82, 95], [41,93]],[-14,-72,48,44], [[-37,-76,28,22],[-10,-72,40,36],[16,-40,23,39]]]],
               
                 ['death-4', [[[624, 469, 101, 79], [50,77]],[-23,-45,60,26], [[-46,-46,28,22],[-23,-58,45,38],[25,-38,22,37]]]],
                
                 ['death-5', [[[735, 477, 107, 62], [54,60]],[-25,-32,60,26], [[-48,-23,28,22],[-26,-40,45,38],[19,-31,28,31]]]],
                
                 ['death-6', [[[497, 582, 110, 36], [55,34]],[-25,-32,60,26], [[-48,-23,28,22],[-26,-40,45,38],[19,-31,28,31]]]],
                ['death-7', [[[626, 589, 110, 29], [55,27]],[-25,-32,60,26], [[-48,-23,28,22],[-26,-40,45,30],[19,-31,28,31]]]],
                ['death-8', [[[626, 589, 110, 29], [55,27]],PushBox.IDLE, HurtBox.NULL]],

                //GetUp State
                 ['getUp-1', [[[392, 678, 94, 64], [47,62]], [-25,-32,30,26], HurtBox.NULL]],
                ['getUp-2', [[[491, 670, 81, 72], [40,70]], [-25,-52,30,46], HurtBox.NULL]],
                 ['getUp-3', [[[601, 653, 59, 95], [29,93]], [-25,-72,30,66], HurtBox.NULL]],

                ['getUp2-1', [[[519, 770, 73, 69], [36,67]], [-25,-32,30,26], HurtBox.NULL]],
                ['getUp2-2', [[[607, 769, 77, 65], [38,63]], [-25,-52,30,46], HurtBox.NULL]],
                ['getUp2-3', [[[431, 863, 61, 80], [30,78]], [-25,-72,30,66], HurtBox.NULL]],

             //Special 1 Death Impact
             ['special1-1', [[[473, 12, 55, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-2', [[[537, 12, 55, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-3', [[[601, 12, 55, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-4', [[[676, 12, 55, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-5', [[[751, 12, 55, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-6', [[[815, 18, 55, 99], [28,67]], PushBox.IDLE, HurtBox.NULL]],
             ['special1-7', [[[880, 18, 55, 99], [28,67]], PushBox.IDLE, HurtBox.NULL]],

             //Special 2 Rockman
             ['special2-1', [[[240, 1119, 57, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-2', [[[317, 1119, 57, 99], [28,97]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-3', [[[395, 1126, 84, 89], [42,87]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-4', [[[500, 1135, 93, 87], [46,85]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-5', [[[622, 1145, 109, 72], [54,70]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-6', [[[740, 1157, 138, 67], [69,45]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-7', [[[12, 1306, 127, 74], [63,52]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-8', [[[150, 1298, 115, 89], [57,67]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-9', [[[283, 1289, 103, 114], [51,92]], PushBox.IDLE, HurtBox.NULL]],
             ['special2-10', [[[414, 1283, 87, 101], [44,99]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-11', [[[510, 1283, 86, 101], [43,99]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-12', [[[605, 1284, 86, 102], [43,100]], PushBox.IDLE, HurtBox.IDLE]],

             //Release Rock anim
             ['special2-13', [[[705, 1283, 86, 104], [43,102]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-14', [[[797, 1283, 67, 103], [33,101]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-15', [[[874, 1242, 71, 145], [35,143]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-16', [[[4, 1403, 68, 130], [34,128]], PushBox.IDLE, HurtBox.IDLE]],
             ['special2-17', [[[80, 1432, 64, 101], [32,99]], PushBox.IDLE, HurtBox.IDLE]],

             //hyper skill 1
             ['hyperskill1-1', [[[4, 2260, 91, 97], [45,95]], [15,-70,50,60], HurtBox.NULL,]],
             ['hyperskill1-2', [[[100, 2266, 63, 87], [31,85]], [15,-70,50,60], HurtBox.NULL,]],
             ['hyperskill1-3', [[[170, 2279, 81, 75], [40,73]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-4', [[[249, 2282, 93, 74], [46,72]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-5', [[[357, 2291, 81, 68], [40,66]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-6', [[[444, 2295, 87, 64], [44,62]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-7', [[[532, 2303, 95, 56], [47,54]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-8', [[[631, 2295, 89, 61], [45,59]], PushBox.IDLE, HurtBox.NULL, [15,-70,50,60]]],
             ['hyperskill1-9', [[[737, 2293, 84, 66], [42,64]], PushBox.IDLE, HurtBox.NULL]],

             ['hyperskill1-10', [[[821, 2281, 93, 75], [46,73]], PushBox.IDLE, HurtBox.NULL]],
             ['hyperskill1-11', [[[916, 2298, 79, 58], [40,56]], PushBox.IDLE, HurtBox.NULL, [15,-70,50,60]]],

             //Golem Special Moves
             //Knee Dash
            ['kneeDash-1', [[[799, 1425, 59, 99], [29,97]], PushBox.JUMP, HurtBox.JUMP]],
            ['kneeDash-2', [[[875, 1426, 62, 99], [31,97]], PushBox.JUMP, HurtBox.JUMP]],
            ['kneeDash-3', [[[956, 1425, 65, 99], [32,97]], PushBox.JUMP, HurtBox.JUMP]],
            ['kneeDash-4', [[[1027, 1420, 75, 104], [37,102]], PushBox.JUMP, HurtBox.JUMP]],
            //Active Frame
            ['kneeDash-5', [[[1106, 1418, 93, 106], [46,104]], PushBox.JUMP, HurtBox.JUMP, [18,-55,23,35]]],
            ['kneeDash-6', [[[1099, 1544, 95, 106], [47,104]], PushBox.JUMP, HurtBox.JUMP, [18,-55,23,35]]],
            ['kneeDash-7', [[[1004, 1544, 82, 106], [41,104]], PushBox.JUMP, HurtBox.JUMP]],

            //Tornado dig frame
            ['tornado-dig-1', [[[1011, 1679, 55, 99], [27,97]], PushBox.JUMP, HurtBox.JUMP]],

            ['tornado-dig-2', [[[1084, 1680, 76, 94], [38,92]], PushBox.JUMP, HurtBox.JUMP]],
            ['tornado-dig-3', [[[1001, 1800, 94, 79], [47,77]], PushBox.JUMP, HurtBox.JUMP]],
            ['tornado-dig-4', [[[1096, 1819, 104, 50], [52,48]], PushBox.JUMP, HurtBox.JUMP]],
            ['tornado-dig-5', [[[1002, 1893, 95, 80], [47,78]], PushBox.JUMP, HurtBox.JUMP]],
            ['tornado-dig-6', [[[1115, 1888, 66, 104], [33,102]], [0,0,0,0], HurtBox.JUMP]],
            ['tornado-dig-7', [[[1123, 2007, 50, 104], [25,102]], [0,0,0,0], HurtBox.JUMP]],
            ['tornado-dig-8', [[[1028, 2000, 50, 103], [25,101]], [0,0,0,0], HurtBox.JUMP]],
            ['tornado-dig-9', [[[934, 1902, 50, 103], [25,101]], [0,0,0,0], HurtBox.NULL]],


            // Golem Pick up opponent frame
            ['pickup-1', [[[1011, 1679, 55, 99], [27,7]], [0,0,0,0], HurtBox.NULL, [-15,30,30,20]]],
            ['pickup-2', [[[1011, 1679, 55, 99], [27,7]], [0,0,0,0], [[-8, -18, 24, 16],[-26, -4, 48, 42], [-26, 41, 45, 32]]]],
            
            
        ]);

                  
         this.animations = {
            //Golem ok
            [FighterState.IDLE]:[ 
                ['forwards-1', 85],['forwards-2',85],
                ['forwards-3',85],['forwards-2',85],
                ['forwards-1',85],
                ['forwards-4',85],['forwards-5',85],['forwards-4',85]
            ],
            [FighterState.DODGE_BACKWARD]:[ 
               ['dodge-1', 40],['dodge-2', 40], 
               ['dodge-3', 50], ['dodge-4', 100],['dodge-3', 40],['dodge-2', 40],['dodge-1', 40], ['dodge-1',FrameDelay.TRANSITION],
                        ],
              [FighterState.DODGE_FORWARD]:[ 
               ['dodge-1', 40],['dodge-2', 40], 
               ['dodge-3', 50], ['dodge-4', 100],['dodge-3', 40],['dodge-2', 40],['dodge-1', 40], ['dodge-1',FrameDelay.TRANSITION],
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
                ['forwards2-1',85],['forwards2-2',85],['forwards2-3',85], ['forwards2-4',85],['forwards2-5',85],['forwards2-6',85],['forwards2-7',85],['forwards2-8',85],
                        
            ],
             //Golem ok
            [FighterState.WALK_BACKWARD]:[
                ['forwards2-8',85],['forwards2-7',85],['forwards2-6',85], ['forwards2-5',85],['forwards2-4',85],['forwards2-3',85],['forwards2-2',85],['forwards2-1',85],
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
                ['light-punch-3', 250],['light-punch-1', 199],['light-punch-1', FrameDelay.TRANSITION],
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
                ['crouch-heavykick-1', 30],['crouch-heavykick-2', 30],['crouch-heavykick-3', 30],['crouch-heavykick-3-nohit', 183],
                ['crouch-heavykick-2', 60],['crouch-heavykick-1', 206],['crouch-heavykick-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HEAVY_KICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-5', 100],
                ['heavy-kick-4', 250],['heavy-kick-3', 106],['heavy-kick-2', FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_HEAVYKICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-5', 88],
                ['heavy-kick-4', 106],['heavy-kick-3', 106],['heavy-kick-2', FrameDelay.TRANSITION],
               // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_LIGHTKICK]:[
                ['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
                 // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            
             [FighterState.HURT_HEAD_LIGHT]:[
                ['hurt-face-1', FIGHTER_HURT_DELAY],['hurt-face-1', 30],
                ['hurt-face-2', 40],['hurt-face-3', 40], ['hurt-face-2', 20], ['hurt-face-1', 20],
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
            [FighterState.SPECIAL_1]:[
                ['special1-1', 100],['special1-2', 100],['special1-3', 100],['special1-4', 100],['special1-5', 100],['special1-6', 100],['special1-7', 100],
                ['special1-6', 60], ['special1-5', 60], ['special1-4', 60], ['special1-3', 90], ['special1-2', 60], ['special1-1', 60],
                ['special1-1', FrameDelay.TRANSITION],
            ],
            [FighterState.SPECIAL_2]:[
                ['special2-1', 100],['special2-2', 100],['special2-3', 100],['special2-4', 100],['special2-5', 100],['special2-6', 100],['special2-7', 100],
                ['special2-8', 60], ['special2-9', 60], ['special2-10', 60], ['special2-11', 90], ['special2-12', 90],['special2-12', FrameDelay.TRANSITION],
            ],
            [FighterState.SPECIAL_2_MOVEFIGHTER]:[
                ['special2-10', 120], ['special2-11', 120],['special2-12', 120],['special2-11', 120],
            ],
             [FighterState.SPECIAL_2_ROCKRELEASE]:[
                ['special2-13', 70], ['special2-14', 70],['special2-15', 70],['special2-16', 70],['special2-17', 70],['special2-17', FrameDelay.TRANSITION],
            ],[FighterState.HYPERSKILL_1]:[
                ['hyperskill1-1', 150], ['hyperskill1-2', 80],
                ['hyperskill1-3', 80], ['hyperskill1-4', 80],
                ['hyperskill1-5', 80], ['hyperskill1-6', 150],
                ['hyperskill1-7', 200], ['hyperskill1-8', 80],
                ['hyperskill1-6', 150],
                ['hyperskill1-7', 200], ['hyperskill1-8', 80],
                ['hyperskill1-6', 150],
                ['hyperskill1-7', 200], ['hyperskill1-8', 80],
                ['hyperskill1-9', 140],

                ['hyperskill1-10', 600], ['hyperskill1-11', 80],
                ['hyperskill1-8', 60], ['hyperskill1-7', 210],
                ['hyperskill1-6', 120], ['hyperskill1-5', 130],
                ['hyperskill1-4', 170], ['hyperskill1-3', 140],
                ['hyperskill1-2', 60], ['hyperskill1-2', FrameDelay.TRANSITION],
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
                        ['death-4', 100], ['death-5', 100], ['death-6', 100], 
                        ['death-7', 100],
                        ['death-7', FrameDelay.TRANSITION],
                        ],
                         [FighterState.GETUP]:[
                            ['death-8', 300], ['getUp2-1', 120], ['getUp2-2', 120], ['getUp2-3', 100],['getUp-3', 100],
                            ['getUp-3', FrameDelay.TRANSITION],
                        ],
                        [FighterState.KNEEDASH]:[
                                        ['kneeDash-1', 80],['kneeDash-2', 60],['kneeDash-3', 50],['kneeDash-4', 50],
                                        ['kneeDash-5', 100],['kneeDash-6', 60],['kneeDash-7', 60],
                                        ['kneeDash-4', 60],['kneeDash-3', 60],['kneeDash-2', 20],['kneeDash-1', 20],
                                        ['kneeDash-1', FrameDelay.TRANSITION],
                                    ],
                        [FighterState.TORNADO_DIG]:[
                            ['tornado-dig-1', 20],['tornado-dig-1', 60], 
                            ['tornado-dig-2', 60], ['tornado-dig-3', 60], 
                            ['tornado-dig-4', 60], ['tornado-dig-5', 60], 
                            ['tornado-dig-6', 60], ['tornado-dig-7', 60],
                            ['tornado-dig-8', 60],['tornado-dig-9', 1500], 
                            ['tornado-dig-9', FrameDelay.TRANSITION],
                        ],
                            [FighterState.PICKUP]:[
                            ['pickup-1', 100],['pickup-1', 200],['pickup-2', 900],
                            ['pickup-2', FrameDelay.TRANSITION],
                        
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
                [FighterState.TORNADO_DIG]: -(2 * 50),
                
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
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.AB
                ],
                cursor: 0,
            },
            {
                state: FighterState.SPECIAL_2,
                sequence: 
                [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.FORWARD, 
                SpecialMoveDirection.FORWARD, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.AD
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
            //Special Moves
            {
                state: FighterState.KNEEDASH,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.ANY_KICK,
                ],
                cursor: 0,
            },
            {
                state: FighterState.TORNADO_DIG,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
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
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.KNEEDASH,
            ],
        }
        this.states[FighterState.SPECIAL_2] = {
                    init: this.handleSpecial2Init.bind(this),
                    update: this.handleSpecial2State.bind(this),
                    shadow: [1.6, 1, -40, 0],
                    validFrom: [
                        FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                        FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                        FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.KNEEDASH,
                        
                    ],
                }
                this.states[FighterState.SPECIAL_2_MOVEFIGHTER] = {
                    init: this.handleSpecial2MoveFighterInit.bind(this),
                    update: this.handleSpecial2MoveFighterState.bind(this),
                    shadow: [1.6, 1, -40, 0],
                    validFrom: [
                        FighterState.SPECIAL_2
                    ],
                }
                 this.states[FighterState.SPECIAL_2_ROCKRELEASE] = {
                    init: this.handleSpecial2RockReleaseInit.bind(this),
                    update: this.handleSpecial2RockReleaseState.bind(this),
                    shadow: [1, 1, 0, 0],
                    validFrom: [
                        FighterState.SPECIAL_2_MOVEFIGHTER
                    ],
                }
                 this.states[FighterState.HYPERSKILL_1] = {
                            attackType: FighterAttackType.PUNCH,
                            attackStrength: FighterAttackStrength.KNOCKUP,
                            init: this.handleHyperSkill1Init.bind(this),
                            update: this.handleHyperSkill1State.bind(this),
                            shadow: [1.6, 1, -40, 0],
                            validFrom: [
                                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_UP, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_LAND,
                                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                                FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN, FighterState.KNEEDASH,
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
         this.states[FighterState.KNEEDASH] = {
                    attackType: FighterAttackType.KICK,
                     attackStrength: FighterAttackStrength.HEAVY,
                     init: this.handleKneeDashInit.bind(this),
                     update: this.handleKneeDashState.bind(this),
                   
                    validFrom: [
                        FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                        FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                        FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                        FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                        FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, 
                    ],
                }
        this.states[FighterState.TORNADO_DIG] = {
                    attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
                     init: this.handleTornadoDigInit.bind(this),
                     update: this.handleTornadoDigState.bind(this),
                   
                    validFrom: [
                        FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                        FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                        FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                        FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                        FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, 
                    ],
                }
                this.states[FighterState.PICKUP] = {
                    attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.LIGHT,
                     init: this.handlePickUpInit.bind(this),
                     update: this.handlePickUpState.bind(this),
                   
                    validFrom: [
                       FighterState.TORNADO_DIG,
                    ],
                }
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2_MOVEFIGHTER];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2_ROCKRELEASE];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HYPERSKILL_1];

        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_FORWARD];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_BACKWARD];
        //Special Moves
         this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.KNEEDASH];
         this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.TORNADO_DIG];
         this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.PICKUP];
         this.states[FighterState.HEAVY_PUNCH].validFrom = [...this.states[FighterState.HEAVY_PUNCH].validFrom, FighterState.PICKUP];

        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.KNEEDASH];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.KNEEDASH];
    }

    //Knee Dash move
    handleKneeDashInit(time, _, strength, attackType, playerId) {
       
        playSound(this.soundKneeDash, 1);
        const slowSpeed = {
            x: 300,
            y: -180,
        }
        const fastSpeed = {
            x: 600,
            y: -270,
        }
        this.kneeDashSpeed = (strength === 'heavyKick') ? fastSpeed.x : slowSpeed.x;
        this.kneeDashJump = (strength === 'heavyKick') ? fastSpeed.y : slowSpeed.y;
        console.log(strength);
         console.log(attackType);
       
        
       
    }

         handleKneeDashState(_, strength){
           
             const slowSpeed = {
            x: 300,
            y: -180,
        }
        const fastSpeed = {
            x: 600,
            y: -270,
        }
        
                if(this.kneeDashSpeed === fastSpeed.x && this.animationFrame === 3){
            this.velocity.y = this.kneeDashJump;
            this.velocity.x = this.kneeDashSpeed;
        }else if (this.kneeDashSpeed === slowSpeed.x && this.animationFrame === 0){
             this.velocity.y = this.kneeDashJump;
        this.velocity.x = this.kneeDashSpeed;
        }
              if(this.kneeDashSpeed === slowSpeed.x && this.animationFrame === 4){
               
                 this.velocity.x = 0;
                this.changeState(FighterState.IDLE);
              } 
             
              if(this.animationFrame === 7 ) this.velocity.x = this.kneeDashSpeed;
             if (!this.isAnimationCompleted()) return;
             this.velocity.x = 0;
       this.changeState(FighterState.IDLE);
    }
    //End Knee Dash move

   

    //Tornado dig move
    handleTornadoDigInit(time, _, strength, attackType, playerId){
       
        this.rotation = 0;
        this.gravity = 0;
        this.position.y -= 10;
        this.velocity.y = -50;
        this.touchGround = false;
        this.rotationValue = 5;
        this.handleMoveInit();
 this.entityList.add(TornadoSpinSplash, time, this.position.x, this.position.y - 50, this.playerId, 1, this.direction * -1);
    }

    handleTornadoDigState(time){
        
         this.rotation -= this.rotationValue;
         if(this.position.y >= STAGE_FLOOR && !this.touchGround){
            this.entityList.add.call(this.entityList, RockSplash, time, this, this.fireball.strength);
            this.touchGround = true;
            this.velocity.x = 0;
            
            this.soundGroundCrash.volume = 1;
        this.soundGroundCrash.play();
        gameState.cameraShake.enable = true;
        gameState.cameraShake.duration = 0.2;
        gameState.cameraShake.intensity = 7;
         }

         if(this.position.y <= 130) this.position.y = 130;
         if(this.rotation <= -30 && this.rotation >= -35){
            this.velocity.y -= 320;
            this.rotationValue = 8;
         } 
         if(this.rotation <= -90){
            
            this.rotationValue = 8;
        } 
        if(this.rotation <= -90) this.velocity.y += 30;
        if(this.rotation <= -180) this.rotation = -180;
         if(this.animationFrame >= 9 && this.position.y >= STAGE_FLOOR &&(control.isHeavyPunch(this.playerId, this.direction))){
            this.velocity.x = 0;
            this.changeState(FighterState.PICKUP);
            this.position.x = this.opponent.position.x +13*this.direction;
         } 
            
       
          if (!this.isAnimationCompleted()) return;
             this.velocity.x = 0;
             
                // remove invisibility, set position.x to the opponent
                    this.changeState(FighterState.PICKUP);
                    this.position.x = this.opponent.position.x +13*this.direction;
            
    }

     //Pickup init and state
    handlePickUpInit(time,hitPosition){
        this.opponent.velocity.y = -40;
       
        this.pickUp = false;
        this.touchGround = false;
        this.stageEnable = false;

        this.gravity = 0;
        this.velocity.y = -500;
       
    }
    handlePickUpState(time,context,camera,hitPosition){
       
        const pickupHit = this.checkPickupHit(camera, context);
        if(pickupHit && !this.pickUp){
            this.opponent.gravity = 0;
             this.opponent.changeState(FighterState.FALL);
             this.opponent.velocity.x = 0;
             this.direction *= -1;
             this.pickUp = true;
        }
       
        if(!this.touchGround){
            this.soundGroundCrash.currentTime = 0;
            this.soundGroundCrash.volume = 1;
        this.soundGroundCrash.play();
        gameState.cameraShake.enable = true;
        gameState.cameraShake.duration = 0.2;
        gameState.cameraShake.intensity = 7;
            this.entityList.add.call(this.entityList, RockSplash, time, this, this.fireball.strength);
            this.touchGround = true;
        }
       
        
       console.log(this.opponent.currentState);
        if(this.opponent.currentState === 'fall'){
            this.opponent.position.x = this.position.x;
            this.opponent.position.y = this.position.y-10;
        } else {
            this.opponent.gravity = 1000;
        }
        
        if(this.stageEnable && this.position.y >= STAGE_FLOOR-90){
            this.position.y = STAGE_FLOOR-90;
            this.velocity.y = 0;
           
        } 
        if(this.touchGround && !this.stageEnable && this.position.y <= 100){
             this.gravity = 2000;
             
             this.stageEnable = true; 
        } 
        
        if (!this.isAnimationCompleted()) return;
             this.velocity.y = 0;
             this.position.y = STAGE_FLOOR;
            this.opponent.gravity = 1000;
             this.gravity = 1000;
             
             
       this.changeState(FighterState.HEAVY_PUNCH);
       if(this.opponent.currentState === 'fall') {
         this.opponent.position.y = this.position.y-100;
             this.opponent.velocity.x = -700*this.direction;
             
             this.opponent.velocity.y = 80;
         this.onAttackHit?.(time, this.playerId, this.opponent.playerId, hitPosition, FighterAttackStrength.HEAVY,this.direction);
       gameState.fighters[this.opponent.playerId].hitPoints -= 10;
       this.opponent.changeState(FighterState.KNOCKUP);
       }
    }

    checkPickupHit(camera, context) {
       
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

     handleIdleInit(){
                this.resetVelocities();
                this.gravity = 1000;
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
            
           gameState.dodging = true;
           if (control.isForward(this.playerId, this.direction)) {
                       console.log('Dodge Forward State');
                        this.changeState(FighterState.DODGE_FORWARD);
                   }else if (control.isBackward(this.playerId, this.direction)) {
                       console.log('Dodge Backward State');
                        this.changeState(FighterState.DODGE_BACKWARD);
        }
            
            if (!this.isAnimationCompleted()) return;
             gameState.dodging = false;
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
  // Special Skill 1 - Death Impact
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
    if (control.isForward(this.playerId, this.direction)) {
        this.velocity.x = 330;
    }
    if (control.isBackward(this.playerId, this.direction)) {
        this.velocity.x = -330;
    }
   
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
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.IDLE);
  }


   // ==============================
  // Special Skill 2 - Rockman
  // ==============================
  handleSpecial2Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1; // 🛡️ spend skill immediately

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

    this.voiceHyperSkill1.play();
   
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;
    this.golemEnableMove = false;
    this.gravity = 1300;
    fighter.sprite += 1;

    this.fireball = { fired: false, strength };

    console.log('🔥 Special 1 (Fireball) started — skill spent instantly');
  }

  handleSpecial2MoveFighterInit(_, strength){
    // this.fireball = { fired: false, strength }; // Moved to handleSpecial2Init
  }

  handleSpecial2RockReleaseInit(_, strength){
     this.velocity.y = -300;
  }

  handleSpecial2State(time) {
    this.getDirection();
    const fighter = gameState.fighters[this.playerId];
    
    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (this.animationFrame === 6) {
        this.soundGroundCrash.volume = 1;
        this.soundGroundCrash.play();
        this.entityList.add.call(this.entityList, RockSplash, time, this, this.fireball.strength);

        gameState.cameraShake.enable = true;
        gameState.cameraShake.duration = 0.2;
        gameState.cameraShake.intensity = 7;

      
      
        this.velocity.x = 0;
        console.log('🔥 Fireball launched!');
      }
      
    

      if (!this.isAnimationCompleted()) return;
        fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false; // reset guard
      this.changeState(FighterState.SPECIAL_2_MOVEFIGHTER);
    } else this.changeState(FighterState.IDLE);
     if (!this.isAnimationCompleted()) return;
   

   
  }

   handleSpecial2MoveFighterState(time) {

    if(this.position.y < STAGE_FLOOR)  this.quake = true;
    if(this.quake && this.position.y >= STAGE_FLOOR){
                this.soundGroundCrash.volume = 0.5;
                this.soundGroundCrash.currentTime = 0;
                 this.soundGroundCrash.play();
                 if(this.opponent.position.y >= STAGE_FLOOR)this.opponent.changeState(FighterState.HURT_BODY_HEAVY);
                gameState.cameraShake.enable = true;
                gameState.cameraShake.duration = 0.4;
                gameState.cameraShake.intensity = 7;
                this.quake = false;
            }
    if (control.isUp(this.playerId, this.direction)) {
         if(this.position.y >= STAGE_FLOOR){
            this.velocity.y = -400;
         }
    }
    if(control.isHeavyPunch(this.playerId, this.direction)){
         this.fireball.strength = 300;
         this.changeState(FighterState.SPECIAL_2_ROCKRELEASE);
         this.gravity = 1000;
    } else if (control.isLightPunch(this.playerId, this.direction)){
        this.fireball.strength = 120;
        this.changeState(FighterState.SPECIAL_2_ROCKRELEASE);
         this.gravity = 1000;
    }
    
    if(!control.isForward(this.playerId, this.direction) && !control.isBackward(this.playerId, this.direction)){
       
             this.velocity.x = 0;
             return;
         }
    if (control.isForward(this.playerId, this.direction)) {
        this.velocity.x = 70;
    }
    if (control.isBackward(this.playerId, this.direction)) {
        this.velocity.x = -70;
    }
      
   }

    handleSpecial2RockReleaseState(time) {

    if(this.position.y < STAGE_FLOOR)  this.quake = true;
    if(this.quake && this.position.y >= STAGE_FLOOR){
                this.soundGroundCrash.volume = 0.5;
                 this.soundGroundCrash.play();
                
                gameState.cameraShake.enable = true;
                gameState.cameraShake.duration = 0.4;
                gameState.cameraShake.intensity = 7;
                this.quake = false;
            }

             if (control.isUp(this.playerId, this.direction)) {
                if(this.position.y >= STAGE_FLOOR){
                    this.velocity.y = -400;
                }
            }
            
            if (control.isForward(this.playerId, this.direction)) {
                this.velocity.x = 70;
            }
            if (control.isBackward(this.playerId, this.direction)) {
                this.velocity.x = -70;
            }

             if (!this.fireball.fired && this.animationFrame === 4) {
                console.log('Rock Released', this.fireball.strength);

            this.entityList.add.call(this.entityList, HeavyRock, time, this, this.fireball.strength);
            this.fireball.fired = true;
            
      
            }  
            if (!this.isAnimationCompleted()) return;

             this.changeState(FighterState.IDLE);
   }

   //Hyperskills

   // Hyper Skill 1 - Super Kaldag!
     handleHyperSkill1Init(_, strength) {
       const fighter = gameState.fighters[this.playerId];
       
       // ✅ Ensure enough skill points & prevent double use
       if (fighter.skillNumber < 3 || fighter.skillUsedThisFrame) return;
       fighter.skillConsumed = false;
       fighter.skillUsedThisFrame = true; // guard
       fighter.skillNumber -= 3; // 🛡️ immediately spend skill
       fighter.resetSkillBar = true;
   
       this.voiceHyperSkill1.play();
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
   
     handleHyperSkill1State(time, context, camera) {
       
       const fighter = gameState.fighters[this.playerId];
       const hyperskill1Hit = this.checkHyperskill1Hit(camera, context);
   
       if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
        
        
        if(this.animationFrame === 1 && hyperskill1Hit){
            this.opponent.changeState(FighterState.LAYDOWN_GROUND);
            this.opponent.velocity.y = 100;
            this.opponent.velocity.x += 70;
        } 

        if (this.animationFrame === 8 || this.animationFrame === 11 || this.animationFrame === 14 || this.animationFrame === 17) {

       if(this.rockspawn) {this.entityList.add.call(this.entityList, RockSplash, time, this, this.fireball.strength);
        this.soundGroundCrash.volume = 1;
        this.soundGroundCrash.currentTime = 0;
        this.soundGroundCrash.play();
        gameState.cameraShake.enable = true;
        gameState.cameraShake.duration = 0.3;
        gameState.cameraShake.intensity = 10;
        if(this.animationFrame === 17) {
            if(hyperskill1Hit) this.opponent.velocity.y -= 500;
            if(this.opponent.position.y >= STAGE_FLOOR){
            
            this.opponent.changeState(FighterState.KNOCKUP);
            this.opponent.velocity.y -= 500;
            console.log("changed state to knock up");
            }
        }
       }
         this.rockspawn = false;
        console.log('Rock Spawned', this.rockspawn);
      } else this.rockspawn = true;
      
   
   
         if (!this.isAnimationCompleted()) return;
         fighter.skillConsumed = true;
         // ✅ Reset guard and state after animation
         gameState.flash = false;
         fighter.superAcivated = false;
         fighter.skillUsedThisFrame = false;
        
       }else this.changeState(FighterState.IDLE);
   
       this.changeState(FighterState.IDLE);
     }

     checkHyperskill1Hit(camera, context) {
                // Check if touching camera directly instead of using this.touchingCamera
             if (!this.boxes?.hit || !this.opponent?.boxes?.hurt) return false;
            
             
             const actualHitBox = getActualBoxDimensions(this.position, this.direction, this.boxes.push);
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
        
}