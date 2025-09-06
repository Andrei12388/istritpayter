import { Control, controls } from './constants/control.js'; 
import { FighterDirection } from './constants/fighter.js';
import { state as controlHold } from './index.js';

const heldKeys = new Set();
const pressedKeys = new Set();
let tapped = true;
let holdTimer = 0;
export { heldKeys };
export { pressedKeys };
export const state = {
    holding: 0
};



function handleKeyDown(event){
    // if (!mappedKeys.includes(event.code)) return;
 
 event.preventDefault();
 heldKeys.add(event.code);

 //console.log(`Key "${event.code}" pressed`);
}

function handleKeyUp(event){
   
    controlHold.tapped = false;
    holdTimer = 0;
    //if (!mappedKeys.includes(event.code)) return;
    tapped = true;
    event.preventDefault();
    heldKeys.delete(event.code);
    pressedKeys.delete(event.code);
  

}

export function registerKeyboardEvents(){
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export function registerScreenButtonEvents() {
    controls.forEach((controlSet) => {
        Object.entries(controlSet.buttons).forEach(([control, elementId]) => {
            const buttonEl = document.getElementById(elementId);
            if (!buttonEl) {
                console.warn(`Missing on-screen button element with id="${elementId}"`);
                return;
            }

            const virtualKeyCode = elementId;

            const handlePress = (e) => {
                e.preventDefault();
                if (!heldKeys.has(virtualKeyCode)) {
                    heldKeys.add(virtualKeyCode);
                    controlHold.tapped = true;
                                holdTimer += 1;
                    if(holdTimer === 4){
                        controlHold.tapped = true;
                    }
                    if(holdTimer >= 10){
                        controlHold.tapped = true;
                        holdTimer = 0;
                    }
                   
                    
                 //   console.log(`On-screen button "${elementId}" pressed`);
                }
            };

            const handleRelease = (e) => {
                e.preventDefault();
                controlHold.tapped = false;
                holdTimer = 0;
                if (heldKeys.has(virtualKeyCode)) {
                    heldKeys.delete(virtualKeyCode);
                    pressedKeys.delete(virtualKeyCode);
                //    console.log(`On-screen button "${elementId}" released`);
                }
            };

            // Mouse
            buttonEl.addEventListener('mousedown', handlePress);
            buttonEl.addEventListener('mouseup', handleRelease);
            buttonEl.addEventListener('mouseleave', handleRelease);
            // Touch
            buttonEl.addEventListener('touchstart', handlePress, { passive: false });
            buttonEl.addEventListener('touchend', handleRelease);
            buttonEl.addEventListener('touchcancel', handleRelease);
        });
    });
}


export function unregisterKeyboardEvents() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}

export function disableScreenButtons() {
    const buttons = document.querySelectorAll('.move, .move1, .move2, #joystick');
    buttons.forEach(button => button.classList.add('disabled'));
}

export function enableScreenButtons() {
    const buttons = document.querySelectorAll('.move, .move1, .move2, #joystick');
    buttons.forEach(button => button.classList.remove('disabled'));
}



export function unregisterScreenButtonEvents() {
    controls.forEach((controlSet) => {
        Object.entries(controlSet.buttons).forEach(([, elementId]) => {
            const buttonEl = document.getElementById(elementId);
            if (!buttonEl) return;

            const handlePress = (e) => {
                e.preventDefault();
                heldKeys.add(elementId);
            };
            const handleRelease = (e) => {
                e.preventDefault();
                heldKeys.delete(elementId);
            };

            // Remove same handlers
            buttonEl.removeEventListener('mousedown', handlePress);
            buttonEl.removeEventListener('mouseup', handleRelease);
            buttonEl.removeEventListener('mouseleave', handleRelease);

            buttonEl.removeEventListener('touchstart', handlePress);
            buttonEl.removeEventListener('touchend', handleRelease);
            buttonEl.removeEventListener('touchcancel', handleRelease);
        });
    });
}



export const isControlDown = (id, control) => isKeyDown(controls[id].keyboard[control]) 
|| isKeyDown(controls[id].buttons[control]);

export const isControlPressed = (id, control) => isKeyPressed(controls[id].keyboard[control]) 
|| isKeyDown(controls[id].buttons[control]);

export const isControlTapped = (id, control) => isKeyTapped(controls[id].keyboard[control]) 
|| isKeyDown(controls[id].buttons[control]);

export const isKeyDown = (code) => heldKeys.has(code);
export const isKeyUp = (code) => !heldKeys.has(code);

export function isKeyPressed(code){
    if (heldKeys.has(code) && !pressedKeys.has(code)) {
        pressedKeys.add(code);
       
        
         holdTimer += 1;
         if(holdTimer === 4){
            controlHold.tapped = true;
         }
          if(holdTimer >= 10){
            controlHold.tapped = true;
            holdTimer = 0;
          }
         
        return true; // Key was pressed this frame
    }
    return false;
}

export function isKeyTapped(code){
    if (heldKeys.has(code) && !pressedKeys.has(code) && tapped === true) {
        tapped = false;
        pressedKeys.add(code);
        
        
        controlHold.tapped = true;
        return true; // Key was pressed this frame
    }
    return false;
}

//export const isLeft = (id) => isKeyDown(controls[id].keyboard[Control.LEFT]);
//export const isRight = (id) => isKeyDown(controls[id].keyboard[Control.RIGHT]);
//export const isUp = (id) => isKeyDown(controls[id].keyboard[Control.UP]);
//export const isDown = (id) => isKeyDown(controls[id].keyboard[Control.DOWN]);

export const isLeft = (id) => isKeyDown(controls[id].buttons[Control.LEFT]) || isKeyDown(controls[id].keyboard[Control.LEFT]);
export const isRight = (id) => isKeyDown(controls[id].buttons[Control.RIGHT])|| isKeyDown(controls[id].keyboard[Control.RIGHT]);
export const isUp = (id) => isKeyDown(controls[id].buttons[Control.UP])|| isKeyDown(controls[id].keyboard[Control.UP]);
export const isDown = (id) => isKeyDown(controls[id].buttons[Control.DOWN])|| isKeyDown(controls[id].keyboard[Control.DOWN]);

export const isForward = (id, direction) => direction === FighterDirection.RIGHT ? isRight(id) : isLeft(id);
export const isBackward = (id, direction) => direction === FighterDirection.RIGHT ? isLeft(id) : isRight(id);


export const isIdle = (id) => !(isLeft(id) || isRight(id) || isUp(id) || isDown(id));

export const isLightPunch = (id) => isControlPressed(id, Control.LIGHT_PUNCH);
export const isHeavyPunch = (id) => isControlPressed(id, Control.HEAVY_PUNCH);

export const isLightKick = (id) => isControlPressed(id, Control.LIGHT_KICK);
export const isHeavyKick = (id) => isControlPressed(id, Control.HEAVY_KICK);

export const isDodge = (id) => isControlPressed(id, Control.LIGHT_PUNCH && Control.LIGHT_KICK);

