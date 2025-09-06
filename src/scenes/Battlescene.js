import { Camera } from "../Camera.js";
import { FIGHTER_HURT_DELAY, FighterAttackBaseData, FighterAttackStrength, FighterDirection, FighterId } from "../constants/fighter.js";
import { FRAME_TIME } from "../constants/game.js";
import { STAGE_MID_POINT, STAGE_PADDING } from "../constants/stage.js";
import { pollControl } from "../controlHistory.js";
import { Malupiton } from "../entities/fighters/Malupiton.js";
import { Shadow } from "../entities/fighters/Shadow.js";

import { LightHitSplash, HeavyHitSplash } from "../entities/fighters/shared/index.js";

import { FpsCounter } from "../entities/FpsCounter.js";
import { StatusBar } from "../entities/overlays/StatusBar.js";

//stages import
import { payatasStage } from "../entities/stage/payatasStage.js";
import { cubaoStage } from "../entities/stage/cubaoStage.js";
import { boholStage } from "../entities/stage/boholStage.js";


import { EntityList } from "../EntityList.js";
import { unregisterKeyboardEvents } from "../inputHandler.js";
import { playSound } from "../soundHandler.js";
import { gameState } from "../state/gameState.js";
import { EnemyAI } from "../entities/fighters/EnemyAI.js";
import { HEALTH_MAX_HIT_POINTS } from "../constants/battle.js";
import { Golem } from "../entities/fighters/Golem.js";
import { createDefaultFighterState } from "../state/fighterState.js";

export class BattleScene {
    fighters = [];
    camera = undefined;
    shadows = [];
    hurtTimer = undefined;
    fighterDrawOrder = [0, 1];
    enemyAI = undefined; 
    paused = false;
    timeScale = 1;

    constructor(game, selectedCharacters){
        this.game = game;
        this.image = document.querySelector('img[alt="misc"]');
        this.selectedCharacters = selectedCharacters;
        this.selectedCharacterP1 = selectedCharacters[0].name;
        this.selectedCharacterP2 = selectedCharacters[1].name;
        console.log(this.selectedCharacterP1, this.selectedCharacterP2);
        gameState.fighters = [createDefaultFighterState(this.selectedCharacterP1),createDefaultFighterState(this.selectedCharacterP2)];

        this.entities = new EntityList();
        this.stage = this.getStageMap();
        this.fightOver = false;
        this.statsBar = new StatusBar(this.game, this.fighters);
        this.inGame = true;
        this.names = gameState.fighters.map(({ id }) => `${id.toLowerCase()}Big`)
        this.frames = new Map([
        
                    //Char Select Big imgs
                     ['unknownBig', [16, 739, 100, 100]],
                     ['malupitonBig', [117, 739, 100, 100]],
                     ['babygiantBig', [218, 739, 100, 100]],
                     ['otlumBig', [313, 739, 100, 100]],
                     ['golemBig', [17, 841, 100, 100]],

                ]);

        this.fighters = this.getFighterEntities();
        this.camera = new Camera(STAGE_MID_POINT + STAGE_PADDING - 192, 16, this.fighters);
        this.shadows = this.fighters.map(fighter => new Shadow(fighter));

        
        // Initialize AI to control player 2 (index 1)
        this.enemyAI = new EnemyAI(this.fighters[1], this.fighters[0]);
            
        this.overlays = [
           // new StatusBar(this.game, this.fighters),
            new FpsCounter(),
            this.statsBar,
        ];
        this.resetBattle();
      
    }

    getFighterEntityClass(id){
        switch (id) {
            case FighterId.MALUPITON:
                return Malupiton;
            case FighterId.GOLEM:
                return Golem;
            default:
                throw new Error('Unimplemented fighter entity request!');
        }
    }

    getStageMap(){
        const stage = gameState.stage;
        switch (stage) {
            case 'litex':
                return new payatasStage;
            case 'cubao':
                return new cubaoStage;
                case 'bohol':
                    return new boholStage;
            default:
                throw new Error('Unimplemented Map entity request!');
        }
    }

    getFighterEntity(fighterState, index){
        const FighterEntityClass = this.getFighterEntityClass(fighterState.id, this.game);

        return new FighterEntityClass(index, this.handleAttackHit.bind(this), this.entities);
    }

    getFighterEntities(){
        const fighterEntities = gameState.fighters.map(this.getFighterEntity.bind(this));
        fighterEntities[0].opponent = fighterEntities[1];
        fighterEntities[1].opponent = fighterEntities[0];

        return fighterEntities;
    }

    getHitSplashClass(strength){
        switch(strength){
            case FighterAttackStrength.LIGHT:
                return LightHitSplash;
            case FighterAttackStrength.HEAVY:
                return HeavyHitSplash;
            default:
                throw new Error('Unknown strength requested');

        }
    }

    resetBattle() {
    this.fighters = this.getFighterEntities();
    this.camera = new Camera(STAGE_MID_POINT + STAGE_PADDING - 192, 16, this.fighters);
    this.shadows = this.fighters.map(fighter => new Shadow(fighter));
    this.hurtTimer = undefined;
    this.fighterDrawOrder = [0, 1];
    this.enemyAI = new EnemyAI(this.fighters[1], this.fighters[0]);
    this.statsBar = new StatusBar(this.game, this.fighters);
    this.overlays = [new FpsCounter(), this.statsBar];
    this.fightOver = false;
    this.inGame = true;
    console.log('Reset Battle');
}


    handleAttackHit(time, playerId, opponentId, position, strength){
        gameState.fighters[playerId].score += FighterAttackBaseData[strength].score;
        gameState.fighters[opponentId].hitPoints -= FighterAttackBaseData[strength].damage;
        gameState.fighters[opponentId].skillPoints += 2;

        this.hurtTimer = time.previous + (FIGHTER_HURT_DELAY * FRAME_TIME);
        this.fighterDrawOrder = [opponentId, playerId];
        if(!position) return;
        this.entities.add(this.getHitSplashClass(strength), time, position.x, position.y, playerId);
    }

    updateFighters(time, context) {
        if (this.paused) {
            // Optional: still draw overlays like pause text
            return;
        }
    // Let AI control fighter 1 (index 1)
    if(this.statsBar.enemyStart === true){
     //    this.enemyAI.update(time);
    }
   

    for (const fighter of this.fighters) {
        pollControl(time, fighter.playerId, FighterDirection);

        if (time.previous < this.hurtTimer) {
            fighter.updateHurtShake(time, this.hurtTimer);
        } else {
            fighter.update(time, context, this.camera);
        }
    }
}

    updateShadows(time, context){
        for (const shadow of this.shadows){
            shadow.update(time, context, this.camera);
        }
    }

    updateOverlays(time, context){
        for (const overlay of this.overlays){
            overlay.update(time, context, this.camera);
        }
    }

    

    update(time, context){

        const scaledTime = {
            ...time,
            secondsPassed: time.secondsPassed * this.timeScale
        };
        this.updateFighters(scaledTime, context);
        this.updateShadows(scaledTime, context);
        this.stage.update(scaledTime);
        this.entities.update(scaledTime, context, this.camera);
        this.camera.update(scaledTime, context);
        this.updateOverlays(scaledTime, context);
        if(this.statsBar.fightOverTimer === 9 && this.statsBar.fightOver){
            this.statsBar.fightOver = false;
             gameState.fighters[0].hitPoints = HEALTH_MAX_HIT_POINTS;
             gameState.fighters[1].hitPoints = HEALTH_MAX_HIT_POINTS;
            this.game.setScene(new BattleScene(this.game, this.selectedCharacters));
        }
    }

     drawFrame(context, frameKey, x, y, direction = 1, scale = 1, alpha = 1) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] = this.frames.get(frameKey);

    context.save();
    context.globalAlpha = alpha;

    // Translate to drawing position, then scale
    context.translate(x, y);
    context.scale(direction * scale, scale); // scale x and y

    // Since we already translated, draw at (0, 0) relative to transform
    context.drawImage(
        this.image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
    );

    context.restore();
}

    drawFighters(context){
      for(const fighterId of this.fighterDrawOrder){
        this.fighters[fighterId].draw(context, this.camera);
    }
}
    drawShadows(context){
        for(const shadow of this.shadows){
        shadow.draw(context, this.camera);
    }
    }

    drawOverlays(context){
        for(const overlay of this.overlays){
        overlay.draw(context, this.camera);
    }
    }

    drawBigImage(context){
        const x = gameState.pauseFrameMove;
        const x2 = -gameState.pauseFrameMove;
        const [name1, name2] = this.names;

   if(gameState.pause) {
    if(gameState.fighters[0].superAcivated)this.drawFrame(context,  name1, x, 20, 1, 1.5);
    if(gameState.fighters[1].superAcivated)this.drawFrame(context,  name2, x2 + 360, 20, -1, 1.5);
   }
}

    WinCondition(){
    if (gameState.fighters[1].hitPoints <= 0 && !this.fightOver && !this.statsBar.fightOver) {
        
        this.statsBar.fightOverTimer = 0;
        
        this.statsBar.enemyStart = false;
        this.statsBar.fightOver = true;
        this.fightOver = true;
         this.statsBar.winSituation = 'P1WIN';
        console.log('P1 Win');
        this.statsBar.gameIn = false;
        gameState.fighters[0].wins += 1;
        return;
    }
    if (gameState.fighters[0].hitPoints <= 0 && !this.statsBar.fightOver && !this.fightOver) {
        
       
        this.statsBar.fightOverTimer = 0;
        
        this.statsBar.enemyStart = false;
        this.statsBar.fightOver = true;
        this.fightOver = true;
         this.statsBar.winSituation = 'P2WIN';
        console.log('P2 Win');
        this.statsBar.gameIn = false;
        gameState.fighters[1].wins += 1;
        return;
    }
    
    if(this.statsBar.time < 0 && !this.statsBar.fightOver && !this.fightOver){
      
        if(gameState.fighters[0].hitPoints === gameState.fighters[1].hitPoints){
            this.statsBar.fightOver = true;
            this.fightOver = true;
            this.statsBar.enemyStart = false;
            console.log('draw');
            this.statsBar.winSituation = 'DRAW';
           
            console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
            console.log(gameState.fighters[1].wins, "P2win");
        }
        if(gameState.fighters[0].hitPoints > gameState.fighters[1].hitPoints){
            gameState.fighters[0].wins += 1;
            this.statsBar.fightOver = true;
            this.fightOver = true;
           
            this.statsBar.winSituation = 'P1WIN';
            this.statsBar.enemyStart = false;
             console.log('P1 win');
             console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
        console.log(gameState.fighters[1].wins, "P2win");
        } else if (gameState.fighters[0].hitPoints < gameState.fighters[1].hitPoints){
            gameState.fighters[1].wins += 1;
            this.statsBar.fightOver = true;
            this.fightOver = true;
            
            this.statsBar.winSituation = 'P2WIN';
            this.statsBar.enemyStart = false;
            console.log('P2 win');
             console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
        console.log(gameState.fighters[1].wins, "P2win");
        }
    }
}

    draw(context){
        this.stage.drawBackground(context, this.camera);
        //When Super Activates
         if (gameState.pause) { // P or ESC to pause
            this.paused = true;
               // this.timeScale = 0.3;
                context.fillStyle = 'rgba(0, 0, 0, 0.40)';
              context.fillRect(0, 0, 400, 400);
               console.log('paused');
            } else {
                this.paused = false;
               // this.timeScale = 1;
            }

        this.drawBigImage(context);
        this.drawShadows(context);
        this.drawFighters(context);

        this.entities.draw(context, this.camera);
        this.stage.drawForeground(context, this.camera);

        this.drawOverlays(context);
        
        this.WinCondition();
    }
}



