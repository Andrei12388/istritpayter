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
    inputEnable: false,

    gameScene: 'prematch',
    gameStarted: false,
    gamePlayerWinned: 'P1',
    rounds: 0,
    pause: false,
    slowFX: 1,
    pauseTimer: 0,
    credits: 5,
    pauseFrameMove: -30,
    skillNumber: 1,
    fighterNotIdle: false,
    difficultyIndex: 1,
    difficulty: 'normal',
    buttonHold: false,
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
    shadowInvert: true,
    // for Enemy AI
    bot: {
      player1: true,
      player2: true,
    },
    // Onscreen controls settings
    buttonTransparency: 1, // 0 to 1
    buttonSize: 1, // 0.5 to 2 (multiplier)
    //for Gamepad Switch Player
    gamepadSwitchPlayer: true,
    FpsCounterEnable: false,

    //for practice mode
    practiceMode: {
        enabled: false,
        infiniteHealth: false,
        infiniteSkill: false,
        infiniteTime: false,
    },
    pauseMenu: {
      show: false,
      pauseGame: false,
      select: false,
      selectPosition:{
        x: 0,
        y: 0,
      }
    },
};