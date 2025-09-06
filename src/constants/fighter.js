//import { Fighter } from "../entities/fighters/Fighter.js";

import { FRAME_TIME } from "./game.js";

export const FighterDirection = {
    LEFT: -1,
    RIGHT: 1,
};

export const PUSH_FRICION = 66;
export const FIGHTER_START_DISTANCE = 88;
export const FIGHTER_HURT_DELAY = 5 + 5;

export const FighterAttackType = {
    PUNCH: 'punch',
    KICK: 'kick',
};

export const FighterAttackStrength = {
   LIGHT: 'light',
   HEAVY: 'heavy',
   SUPER1: 'super1'
};

export const FighterHurtBox = {
    HEAD: 'head',
    BODY: 'body',
    FEET: 'feet',
};

export const FighterAttackBaseData = {
 [FighterAttackStrength.LIGHT]: {
    score: 100,
    skill: 5,
    damage: 4,
    slide: {
        velocity: -10 * FRAME_TIME,
        friction: 300,
    },
 },
 [FighterAttackStrength.HEAVY]: {
    score: 500,
    skill: 10,
    damage: 10,
    slide: {
        velocity: -16 * FRAME_TIME,
        friction: 500,
    },
 },
  [FighterAttackStrength.SUPER1]: {
    score: 1000,
    skill: 5,
    damage: 45,
    slide: {
        velocity: -16 * FRAME_TIME,
        friction: 500,
    },
 },
};

export const FighterId = {
    MALUPITON: 'Malupiton',
    GOLEM: 'Golem',
}

export const FighterState = {
IDLE: 'idle',
WALK_FORWARD: 'walkForwards',
WALK_BACKWARD: 'walkBackwards',
JUMP_UP: 'jumpUp',
JUMP_START: 'jumpStart',
JUMP_LAND: 'jumpLand',
JUMP_FORWARD: 'jumpForwards',
JUMP_BACKWARD: 'jumpBackwards',
CROUCH: 'crouch',
CROUCH_DOWN: 'crouchDown',
CROUCH_UP: 'crouchUp',
IDLE_TURN: 'idleTurn',
CROUCH_TURN: 'crouchTurn',
LIGHT_PUNCH: 'lightPunch',
LIGHT_KICK: 'lightKick',
HEAVY_PUNCH: 'heavyPunch',
HEAVY_KICK: 'heavyKick',
CROUCH_LIGHTKICK: 'crouch-lightkick',
CROUCH_HEAVYKICK: 'crouch-heavykick',
JUMP_LIGHTKICK: 'jump-lightkick',
JUMP_HEAVYKICK: 'jump-heavykick',
HURT_HEAD_LIGHT: 'hurt-head-light',
HURT_HEAD_HEAVY: 'hurt-head-heavy',
HURT_BODY_LIGHT: 'hurt-body-light',
HURT_BODY_HEAVY: 'hurt-body-heavy',
SPECIAL_1: 'special-1',
DODGE: 'dodge',
};

export const FrameDelay = {
    FREEZE: 0,
    TRANSITION: -1,
};

export const PushBox = {
    IDLE: [-16, -80, 32, 78],
    JUMP: [-16, -91, 32, 66],
    BEND: [-16, -58, 32, 58],
    CROUCH: [-16, -50, 32, 50],
};

export const HurtBox = {
 IDLE: [[-8, -88, 24, 16],[-26, -74, 48, 42], [-26, -31, 45, 32]],
 BACKWARD: [[-19, -88, 24, 16],[-26, -74, 48, 42], [-26, -31, 40, 32]],
 FORWARD: [[-3, -88, 24, 16],[-26, -74, 48, 42], [-26, -31, 40, 32]],
 JUMP: [[-3, -86, 28, 18],[-26, -70, 48, 42], [-26, -31, 40, 32]],
 BEND: [[-2, -68, 24, 18],[-16, -53, 44, 24], [-16, -24, 44, 24]],
 CROUCH: [[6, -61, 24, 18],[-16, -46, 44, 24], [-16, -24, 44, 24]],
 PUNCH: [[11, -94, 24, 18],[-7, -77, 40, 43], [-7, -33, 40, 33]],
};

export const HitBox ={
    LIGHT_PUNCH: [3,-70,50,18],
    HEAVY_PUNCH: [0,-70,90,30],
    LIGHT_KICK: [8,-60,50,18],
    HEAVY_KICK: [8,-55,75,15],
    CROUCH_LIGHTKICK: [8,-20,40,18],
    CROUCH_HEAVYKICK: [10,-25,55,18],
    JUMP_HEAVYKICKK: [8,-60,40,18],
    JUMP_LIGHTKICK: [8,-60,50,18],
}

export const hurtStateValidFrom = [
    FighterState.IDLE, FighterState.WALK_BACKWARD,FighterState.WALK_FORWARD,
    FighterState.JUMP_LAND, FighterState.JUMP_START, FighterState.IDLE_TURN,
    FighterState.LIGHT_PUNCH, FighterState.HEAVY_PUNCH,
    FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
    FighterState.HURT_HEAD_LIGHT, FighterState.HURT_HEAD_HEAVY,
    FighterState.HURT_BODY_LIGHT, FighterState.HURT_BODY_HEAVY,
    FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_HEAVYKICK,
    FighterState.JUMP_HEAVYKICK, FighterState.JUMP_LIGHTKICK,
    FighterState.SPECIAL_1, FighterState.DODGE,
];

export const SpecialMoveDirection = {
    BACKWARD: 'backward',
    BACKWARD_UP: 'backward-up',
    UP: 'up',
    FORWARD: 'forward',
    FORWARD_UP: 'forward-up',
    FORWARD_DOWN: 'forward-down',
    DOWN: 'down',
    BACKWARD_DOWN: 'backward-down',
    NONE: 'none',
};

export const SpecialMoveButton = {
    ANY_PUNCH: 'any-punch',
    ANY_KICK: 'any-kick',
};