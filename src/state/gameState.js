import { FighterId } from "../constants/fighter.js";
import { createDefaultFighterState } from "./fighterState.js";

export const gameState = {
    fighters: [
      null, 
      null
      //P1 Character
     //  createDefaultFighterState(FighterId.MALUPITON),
      //  createDefaultFighterState(FighterId.GOLEM),

      //P2 Character
      // createDefaultFighterState(FighterId.MALUPITON),
    //  createDefaultFighterState(FighterId.GOLEM),
    ],
    gameScene: 'prematch',
    gameStarted: false,
    gamePlayerWinned: 'P1',
    rounds: 0,
    pause: false,
    slowFX: 1,
    pauseTimer: 0,
    credits: 0,
    pauseFrameMove: -30,

    fighterNotIdle: false,

    difficulty: 'insane',
    stage: 'final',
    flash: false,
    characterSelectMode: true,
    hyperSkill: false,
    dodging: false,
    kapeCom: false,
    stageMusic: 'audio#stage-payatas',
    cameraShake: {
        enable: false,
        duration: 0,
        intensity: 0,
    },
};