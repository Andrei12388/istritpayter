
import { IntroBG, IntroScreen } from '../entities/IntroScreen.js';
import { playSound, stopSound } from '../soundHandler.js';
import { CharacterSelect } from './CharacterSelect.js';


export class Intro {
    entities = [];

    constructor(game) {
        this.game = game; // store reference to main game
        this.flashAlpha = 0;
        this.screenTimer = 0;
        this.screenTimerMax = 25;
        this.nextScene = false;
        this.musicIntro = document.querySelector('audio#music-intro');
        this.soundStart = document.querySelector('audio#game-start');
        

        this.introScreen = new IntroScreen(this.game, this.fighters);
        this.entities = [
            new IntroBG(),
            this.introScreen,
        ];
    }

    
    startTimer(){
    if (this.screenFlashTrigger === true ){
        this.flashScreen = true;
        this.screenTimer = Math.min(this.screenTimer + 1, this.screenTimerMax);
         if(this.screenTimer >= this.screenTimerMax){
            this.flashAlpha = 1;
            this.game.setScene(new CharacterSelect(this.game));
            this.flash = false;
            this.screenFlashTrigger = false;
            console.log('exit');
           }
    }
    if (this.screenFlashTrigger === false ) {
        this.screenTimer = Math.max(this.screenTimer - 1, 0);
        if(this.screenTimer <= 0){
            this.flash = false;
            this.screenFlashTrigger = false;
            this.flashScreen = false;
            this.flashAlpha = 1;
            
            console.log('False');
           }
    }

   
    }

    updateEntities(time, context) {
        for (const entity of this.entities) {
            entity.update(time, context, this.camera);
        }
    }

    handleFlash(){
        this.screenFlashTrigger = true;
        this.flashScreen = true
        this.flash = true;
        
    }

    update(time, context) {
       
        this.updateEntities(time, context);
         if(this.flashScreen)this.startTimer();

        // Check if time reached -1
        if (this.introScreen.time <= -1 && !this.nextScene) {
            console.log('times up!');
           this.handleFlash();
           playSound(this.soundStart, 1);
           stopSound(this.musicIntro);
           this.nextScene = true;
         //  this.game.setScene(new BattleScene(this.game));
        }
    }

  drawFlash(context){
    if (this.flash === true){
    this.flashAlpha = Math.min(this.flashAlpha + 0.1, 1);
    context.globalAlpha = this.flashAlpha;
     context.fillStyle = "rgb(0, 0, 0)";
     context.fillRect(0, 0, 400, 400);
     console.log('flash enable');
    }
    if (this.flash === false){
        this.screenFlashTrigger = false;
        this.flashAlpha = Math.max(this.flashAlpha - 0.1, 0);
        context.globalAlpha = this.flashAlpha;
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, 400, 400);
        console.log('flash out');
    }
     context.globalAlpha = 1;
    
}

    drawEntities(context) {
        for (const entity of this.entities) {
            entity.draw(context, this.camera);
        }
    }

    draw(context) {
        this.drawEntities(context);
         if(this.flashScreen)this.drawFlash(context);
    }
}

