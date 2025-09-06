import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";
import { BattleScene } from "../scenes/Battlescene.js";
import { playSound } from "../soundHandler.js";
import { gameState } from "../state/gameState.js";
import { StreetFighterGame } from "../StreetFighterGame.js";

export class IntroBG {
    constructor(){
        this.image = document.querySelector('img[alt="intro"]');
    }
    update(){
        
    }
    draw(context){
        context.drawImage(this.image, 0, 0);
    }
}

export class IntroScreen {
    constructor(game, fighters){
        this.game = game; 
        this.image = document.querySelector('img[alt="misc"]');
        this.soundStart = document.querySelector('audio#game-start2');
        this.musicIntro = document.querySelector('audio#music-intro');
        this.introDone = false;
        this.alphaSet = 0;
        this.blink = -1;
        this.blinkTimer = 0;
        this.stopwatch = 0;
        this.startSound = true;
        this.time = 25;
        this.timeDraw = false;
        this.insertCoin = false;
        this.timeTimer = 0;
        this.fighters = fighters;
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;

        this.frames = new Map([
            ['kapecom', [359,163,127,35]],
            ['push-start', [369,8,110,14]],
            ['insert-coin', [375,207,95,9]],
            ['title-screen', [16, 231, 384, 224]],
                       
            [`${TIME_FRAME_KEYS[0]}-0`, [16,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-1`, [32,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-2`, [48,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-3`, [64,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-4`, [80,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-5`, [96,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-6`, [112,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-7`, [128,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-8`, [144,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-9`, [160,32,14,16]],


            [`${TIME_FRAME_KEYS[0]}-0`, [16,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-1`, [32,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-2`, [48,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-3`, [64,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-4`, [80,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-5`, [96,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-6`, [112,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-7`, [128,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-8`, [144,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-9`, [160,192,10,12]],

            //Numerics
            ['score-0', [17,101, 10, 10]],
            ['score-3', [53,101, 10, 10]],
            ['score-4', [65,101, 10, 10]],
            ['score-5', [77,101, 10, 10]],
            ['score-6', [89,101, 10, 10]],
            ['score-7', [101,101, 10, 10]],
            ['score-8', [113,101, 10, 10]],
            ['score-9', [125,101, 10, 10]],

            //Score
            ['score-1', [29,101, 10, 10]],
            ['score-2', [41,101, 10, 10]],

            //Alphabet
            ['score-A', [29,113, 10, 10]],
            ['score-B', [41,113, 10, 10]],
            ['score-C', [53,113, 10, 10]],
            ['score-D', [65,113, 10, 10]],
            ['score-E', [77,113, 10, 10]],
            ['score-F', [89,113, 10, 10]],
            ['score-G', [101,113, 10, 10]],
            ['score-H', [113,113, 10, 10]],
            ['score-I', [125,113, 9, 10]],
            ['score-J', [136,113, 10, 10]],
            ['score-K', [149,113, 10, 10]],
            ['score-L', [161,113, 10, 10]],
            ['score-M', [173,113, 10, 10]],
            ['score-N', [185,113, 10, 10]],
            ['score-O', [197,113, 10, 10]],
            ['score-P', [17,125, 10, 10]],
            ['score-Q', [29,125, 10, 10]],
            ['score-R', [41,125, 10, 10]],
            ['score-S', [53,125, 10, 10]],
            ['score-T', [65,125, 10, 10]],
            ['score-U', [77,125, 10, 10]],
            ['score-V', [89,125, 10, 10]],
            ['score-W', [101,125, 10, 10]],
            ['score-X', [113,125, 10, 10]],
            ['score-Y', [125,125, 10, 10]],
            ['score-Z', [136,125, 10, 10]],
            ['score-@', [17,113, 10, 10]], 
            ['score-.', [172,87, 10, 10]], 
            ['score- ', [105,54, 18, 12]], 


            //Character Names
            ['tag-malupiton', [15,56,83,9]],
            ['tag-ryu', [16,56,28,9]],
        ]);
        
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


    updateTime(time){
         this.blinkTimer += 1;
        if(time.previous > this.timeTimer + TIME_DELAY){
            this.time -=1;
            this.timeTimer = time.previous;
            this.stopwatch += 1;
            if (this.alphaSet <= 0.1) {
                this.alphaSet = 0

            }else if (this.alphaSet >= 1){
                this.alphaSet = 1;
            };
           // console.log(this.alphaSet);
            //console.log(this.stopwatch);
        }

        if(
            this.time < 15 && this.time > -1 
            && time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
        ) {
            
           // this.useFlashFrames = !this.useFlashFrames;
            this.timeFlashTimer = time.previous;
        }
        

    }

    updateScreenScene(){
        //Present Title intro
         if (this.stopwatch === 3){
            this.alphaSet += .05;
            this.kapecomPresent = true;
        }
        if (this.stopwatch === 3 && this.startSound){
               playSound(this.soundStart, 1);
                this.startSound = false;
            }
            if(this.stopwatch === 6)this.startSound = true;
            if (this.stopwatch === 7 && this.startSound){
               playSound(this.musicIntro, 0.6);
                this.startSound = false;
            }
        if (this.stopwatch === 7){
            this.alphaSet -= .05;
            if (this.alphaSet <= 0.10){
                this.kapecomPresent = false;
            }
        }
        //Present GameStart and remove kapecom title
         if (this.stopwatch === 8){
            this.kapecomPresent = false;
            this.insertCoin = true;
            
        }
        if (this.stopwatch === 11){
            this.gameStart = true;
        }

        if(this.blinkTimer >= 15){
            this.blink *= -1;
            this.blinkTimer = 0;
        }
        if(this.stopwatch === 15){
            this.timeDraw = true;
        }

    }

    update(time){
        this.updateTime(time);
        this.updateScreenScene();
    }

    drawTextLabel(context, label, x, y, direction, scale){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 9, y, direction, scale);
        }
    }

     drawTexts(context){
            this.drawTextLabel(context, '@KAPECOM..LTD2025', 90,190, 1, 0.7);
            this.drawTextLabel(context, '@ANDREIBARDOQUILLO..2025', 90,210, 1, 0.7);
        }

  drawScreenTitle(context){
    this.drawFrame(context, 'title-screen', 0, 0);
     
  }

   drawKapeComTitle(context){
     const alpha = this.alphaSet;
    this.drawFrame(context, 'kapecom', 133, 102, 1, 1, alpha);

  }

  drawInsertCoin(context){
        // this.drawFrame(context, 'insert-coin', 147, 145);
         this.drawFrame(context, 'push-start', 137, 145);
  }
    
    drawTime(context){
 const timeString = String(Math.max(this.time, 0)).padStart(2,'00');
 const flashFrame = TIME_FRAME_KEYS[Number(this.useFlashFrames)];


        this.drawFrame(context, `${flashFrame}-${timeString.charAt(0)}`, 178, 123);
        this.drawFrame(context, `${flashFrame}-${timeString.charAt(1)}`, 194, 123);
    }

    drawCredits(context){
        this.drawTextLabel(context, 'CREDITS' + ' ' + `${gameState.credits}`, 270,10, 1, 0.7);
    }
    draw(context){
        
         if (this.gameStart === true){
                 this.drawScreenTitle(context);
                    this.drawTexts(context);
                 
            }
            if (this.timeDraw === true){
                 this.drawTime(context);
            }
            if(this.insertCoin === true){
                this.drawCredits(context);
                if(this.blink === 1){
                    this.drawInsertCoin(context);
               //  this.drawFrame(context, 'push-start', 31, 160);
               //  this.drawFrame(context, 'push-start', 240, 160);
                    
                }
            }
            if(this.kapecomPresent === true){
                this.drawKapeComTitle(context);
            }
           
        }
}