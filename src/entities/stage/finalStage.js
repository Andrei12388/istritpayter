import { FRAME_TIME } from "../../constants/game.js";
import { playSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { BackgroundAnimation } from "./shared/BackgroundAnimation.js";

export class finalStage {
    constructor(){
        this.image = document.querySelector('img[alt="final-stage"]');
       gameState.stageMusic = 'audio#stage-boss';
       console.log('Final Stage created');
    
        this.frames = new Map([
            
            ['grass', [59, 578, 768, 234]],
            ['carabaoShadow', [26, 928, 127, 10]],
            ['carabaoPoo', [176, 915, 44, 22]],
        ]);
        this.stageBackground = new BackgroundAnimation(
             this.image,
            [
            ['stage-background', [120, 220, 777, 341]],
            ['stage-background2', [918, 220, 778, 338]],
            ['stage-background3', [1708, 220, 777, 341]],
            ['stage-background4', [2496, 220, 777, 341]],
            ],
            [
                ['stage-background', 20],['stage-background', 2000], ['stage-background2', 100], ['stage-background', 60], ['stage-background2', 100],['stage-background', 5000],
                ['stage-background', 20],['stage-background', 2000], ['stage-background3', 100], ['stage-background', 60], ['stage-background3', 100],['stage-background', 5000],
                ['stage-background', 20],['stage-background', 2000], ['stage-background4', 100], ['stage-background', 60], ['stage-background4', 100],['stage-background', 5000],
        ],
        )
        
        
    }

   

   
  
    update(time){
        if(gameState.pause) return;
       
        this.stageBackground.update(time);
        
        
    }

     drawFrame(context, frameKey, x, y, direction, alpha){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y, direction, alpha);       
    }

    

    drawBackground(context, camera){
        this.stageBackground.draw(context, Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
        
        
         
    }

    drawForeground(context, camera){
       // this.drawFrame(context, 'grass', Math.floor(15 - (camera.position.x/ 1.61445)), 130 -camera.position.y);
   
    }
}