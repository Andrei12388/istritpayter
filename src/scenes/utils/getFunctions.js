import { FighterAttackStrength, FighterId } from "../../constants/fighter.js";
import { Golem } from "../../entities/fighters/Golem.js";
import { Malupiton } from "../../entities/fighters/Malupiton.js";
import { BlockHitSplash, FlameHitSplash, GreenHitSplash, GroundShakeSplash, GroundSmokeSplash, HeavyHitSplash, LightHitSplash, SlashHitSplash } from "../../entities/fighters/shared/index.js";
import { boholStage } from "../../entities/stage/boholStage.js";
import { finalStage } from "../../entities/stage/finalStage.js";
import { pasayStage } from "../../entities/stage/pasayStage.js";
import { payatasStage } from "../../entities/stage/payatasStage.js";
import { testStage } from "../../entities/stage/testStage.js";
import { tondoStage } from "../../entities/stage/tondoStage.js";
import { gameState } from "../../state/gameState.js";
import * as control from '../../inputHandler.js'; 

export function getFighterEntityClass(id){
        switch (id) {
            case FighterId.MALUPITON:
                return Malupiton;
            case FighterId.GOLEM:
                return Golem;
            default:
                 control.showNotice(`${id} not yet available.`);
                 throw new Error('Unimplemented fighter entity request!');
        }
    }

  export function getStageMap(){
        const stage = gameState.stage;
        switch (stage) {
            case 'litex':
                return new payatasStage;
            case 'pasay':
                return new pasayStage;
            case 'bohol':
                return new boholStage;
            case 'final':
                return new finalStage;
            case 'tondo':
                return new tondoStage;
            case 'test':
                return new testStage;
            default:
                throw new Error('Unimplemented Map entity request!');
        }
    }

 export function getHitSplashClass(strength){
        switch(strength){
            case FighterAttackStrength.LIGHT:
                return LightHitSplash;
            case FighterAttackStrength.HEAVY:
                return HeavyHitSplash;
            case FighterAttackStrength.HEAVYKICK:
                return HeavyHitSplash;
            case FighterAttackStrength.KNOCKLIFT:
            case FighterAttackStrength.KNOCKUP:
            case FighterAttackStrength.KNOCKLIFTDOWN:
                return HeavyHitSplash;
            case FighterAttackStrength.SUPER1:
                return GreenHitSplash;
            case FighterAttackStrength.SUPER2:
                return FlameHitSplash;
            case FighterAttackStrength.BLOCK:
                return BlockHitSplash;
            case FighterAttackStrength.SLASH:
                return SlashHitSplash;
            default:
                throw new Error('Unknown strength requested');

        }
    }

 export function getEffectSplashClass(effect){
        switch(effect){
            case "groundShake":
                return GroundShakeSplash;
            case "groundSmoke":
                return GroundSmokeSplash;
            default:
                throw new Error('Unknown Effect requested');

        }
    }

// Draw methods
export function drawFrame(context, frameKey, x, y, direction = 1, scale = 1, alpha = 1, frames, image) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] = frames.get(frameKey);

    context.save();
    context.globalAlpha = alpha;

    // Translate to drawing position, then scale
    context.translate(x, y);
    context.scale(direction * scale, scale); // scale x and y

    // Since we already translated, draw at (0, 0) relative to transform
    context.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
    );
    
    context.restore();
}

export function drawFighters(context, camera, fighterDrawOrder, fighters){
      for(const fighterId of fighterDrawOrder){
        fighters[fighterId].draw(context, camera);
    }
}
export function drawHyperSkillBG(context, statsBar, frames, image){
        
        const hyperskillFrames = statsBar.hyperskillframe;

   if(gameState.pause) {
    drawFrame(context, `hyper${hyperskillFrames}`, 0, 0, 1, 1, 1, frames, image);
   }
}

export function drawOverlays(context, overlays, camera){
        for(const overlay of overlays){
        overlay.draw(context, camera);
    }
}

export function drawBigImage(context, names, frames, image){
        const x = gameState.pauseFrameMove;
        const x2 = -gameState.pauseFrameMove;
        const [name1, name2] = names;

   if(gameState.pause) {
   
    if(gameState.fighters[0].superAcivated)drawFrame(context,  name1, x, 20, 1, 1.5,1,frames, image);
    if(gameState.fighters[1].superAcivated)drawFrame(context,  name2, x2 + 360, 20, -1, 1.5, 1, frames, image);
   }
}