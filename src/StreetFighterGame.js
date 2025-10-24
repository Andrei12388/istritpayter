
import { pollGamepads, registerGamepadEvents, registerKeyboardEvents } from './inputHandler.js';

import { registerScreenButtonEvents } from './inputHandler.js';
import * as control from './inputHandler.js'; 
import { getContext } from './utils/context.js';
import { BattleScene } from './scenes/Battlescene.js';
import { Intro } from './scenes/Intro.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { PrePostMatch } from './scenes/PrePostMatch.js';

const selectedCharacters = [
    { 
        name: "Malupiton", 
        namePos: 5,
        color: "gray", 
        imageSml: 'malupitonSmall', 
        imageBig: 'malupitonBig' 
    },
    { 
        name: "Malupiton", 
        color: "gray", 
        namePos: 5,
        imageSml: 'malupitonSmall', 
        imageBig: 'malupitonBig' 
    }
];

export class StreetFighterGame{
     context = getContext();
    
    frameTime ={
        previous: 0,
        secondsPassed: 0,
    };

    constructor(){
        
 //this.scene = new Intro(this);
// this.scene = new BattleScene(this, selectedCharacters);
 //this.scene = new CharacterSelect(this);
 this.scene = new PrePostMatch(this, selectedCharacters);
    }

    setScene(newScene) {
        this.scene = newScene;
    };
    

frame(time){
    window.requestAnimationFrame(this.frame.bind(this));
    
    this.frameTime ={
        secondsPassed: (time - this.frameTime.previous)/1000,
        previous: time,
    }
    control.pollGamepads();
   this.scene.update(this.frameTime, this.context);
   this.scene.draw(this.context);
    }

start(){
    control.registerGamepadEvents();
    //document.addEventListener('submit', this.handleFormSubmit.bind(this));
    window.requestAnimationFrame(this.frame.bind(this));
}
}