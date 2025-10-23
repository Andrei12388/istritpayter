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
    rounds: 0,
    pause: false,
    slowFX: 1,
    pauseTimer: 0,
    credits: 10,
    pauseFrameMove: -30,
    stage: 'litex',
    flash: false,
    characterSelectMode: true,
    hyperSkill: false,
    kapeCom: false,
};