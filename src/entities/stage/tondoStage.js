import { FPS, FRAME_TIME } from "../../constants/game.js";
import { playSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { BackgroundAnimation } from "./shared/BackgroundAnimation.js";

export class tondoStage {
    constructor(){
        this.image = document.querySelector('img[alt="tondo-stage"]');
       gameState.stageMusic = 'audio#stage-tondo';
       console.log('Tondo Stage created');
    
        this.frames = new Map([
            ['stage-background', [58, 211, 769, 335]],
          
        ]);

       
       
        
    }

    
  
    update(time){
        if(gameState.pause) return;
    
    }

     drawFrame(context, frameKey, x, y, direction, alpha){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y, direction, alpha);       
    }

 

    drawBackground(context, camera){
        this.drawFrame(context, 'stage-background', Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
        
         
    }

    drawForeground(context, camera){
     
   
    }
}