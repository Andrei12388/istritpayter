import { Intro } from './scenes/Intro.js';
import { StreetFighterGame } from './StreetFighterGame.js';
import { FighterState } from './constants/fighter.js';
import { heldKeys } from './inputHandler.js'; 
import { state as controlHold } from './inputHandler.js';
import { gameState } from './state/gameState.js';
import { initOnscreenControlsSliders, updateOnscreenControls } from './onscreenControlsSlider.js';
import { unlockAudio } from './inputHandler.js';



function populateMoveDropdown(){
    const dropdown = document.getElementById('state-dropdown');

    Object.entries(FighterState).forEach(([, value]) => {
        const option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerText = value;
        dropdown.appendChild(option);
    });
}


window.addEventListener('load', function () {
    initOnscreenControlsSliders();
    updateOnscreenControls();

    function startOnce(e) {
        unlockAudio(); // 🔓 audio is now legal

        console.log('🎮 User interaction detected — Starting Game');

        populateMoveDropdown();
        new StreetFighterGame().start();

        window.removeEventListener('keydown', startOnce);
        window.removeEventListener('mousedown', startOnce);
        window.removeEventListener('touchstart', startOnce);
    }

    // Valid user gestures
    window.addEventListener('keydown', startOnce, { once: true });
    window.addEventListener('mousedown', startOnce, { once: true });
    window.addEventListener('touchstart', startOnce, { once: true });
});




// Onscreen Joystick

const joystick = document.getElementById('joystick');
const knob = document.getElementById('knob');
const maxDistance = 70;

export const state = {
    tapped: false
};
let holdTimer = 0;
let dragging = false;
let activePointerId = null; // track the pointer/touch id


function startDrag(e) {
    e.preventDefault();
    holdTimer = 0;
    dragging = true;

    const touch = e.touches ? e.touches[0] : e;
    activePointerId = touch.identifier !== undefined ? touch.identifier : "mouse";

    state.tapped = true;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
    if (!dragging) return;

    let touch;
    if (e.touches) {
        // Only track the active touch
        touch = [...e.touches].find(t => t.identifier === activePointerId);
        if (!touch) return;
    } else {
        if (activePointerId !== "mouse") return;
        touch = e;
    }

    holdTimer += 1;
    if (holdTimer === 4) {
        state.tapped = true;
    }
    if (holdTimer >= 10) {
        state.tapped = true;
        holdTimer = 0;
    }

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;

    const distance = Math.min(Math.sqrt(dx*dx + dy*dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    // move knob visually
   const x = distance * Math.cos(angle);
const y = distance * Math.sin(angle);
knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

    // clear previous active states
    ['jump','mFor','mBack','crouchDown'].forEach(id => {
        document.getElementById(id).classList.remove('active');
        heldKeys.delete(id);
    });

    if (distance > 10) {
        if (angle > -Math.PI/8 && angle <= Math.PI/8) {
            // Right
            document.getElementById('mFor').classList.add('active');
            heldKeys.add('mFor');
            gameState.buttonHold = true;
        } else if (angle > Math.PI/8 && angle <= 3*Math.PI/8) {
            // Down-Right
            document.getElementById('mFor').classList.add('active');
            document.getElementById('crouchDown').classList.add('active');
            heldKeys.add('mFor');
            heldKeys.add('crouchDown');
            
        } else if (angle > 3*Math.PI/8 && angle <= 5*Math.PI/8) {
            // Down
            document.getElementById('crouchDown').classList.add('active');
            heldKeys.add('crouchDown');
            gameState.buttonHold = true;
        } else if (angle > 5*Math.PI/8 && angle <= 7*Math.PI/8) {
            // Down-Left
            document.getElementById('mBack').classList.add('active');
            document.getElementById('crouchDown').classList.add('active');
            heldKeys.add('mBack');
            heldKeys.add('crouchDown');
            
        } else if (angle > 7*Math.PI/8 || angle <= -7*Math.PI/8) {
            // Left
            document.getElementById('mBack').classList.add('active');
            heldKeys.add('mBack');
            gameState.buttonHold = true;
        } else if (angle > -7*Math.PI/8 && angle <= -5*Math.PI/8) {
            // Up-Left
            document.getElementById('mBack').classList.add('active');
            document.getElementById('jump').classList.add('active');
            heldKeys.add('mBack');
            heldKeys.add('jump');
            
        } else if (angle > -5*Math.PI/8 && angle <= -3*Math.PI/8) {
            // Up
            document.getElementById('jump').classList.add('active');
            heldKeys.add('jump');
            gameState.buttonHold = true;
        } else if (angle > -3*Math.PI/8 && angle <= -Math.PI/8) {
            // Up-Right
            document.getElementById('mFor').classList.add('active');
            document.getElementById('jump').classList.add('active');
            heldKeys.add('mFor');
            heldKeys.add('jump');
            
        }
    }
}

function resetKnob() {
    holdTimer = 0;
    state.tapped = false;
    knob.style.transform = 'translate(-50%, -50%)';
}

function endDrag(e) {
    let touch;
    if (e && e.changedTouches) {
        touch = [...e.changedTouches].find(t => t.identifier === activePointerId);
        if (!touch) return; // ignore unrelated touchend
    } else {
        if (activePointerId !== "mouse") return;
    }

    holdTimer = 0;
    state.tapped = false;
    dragging = false;
    activePointerId = null;

    resetKnob();  
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);

    ['jump','mFor','mBack','crouchDown'].forEach(id => {
        document.getElementById(id).classList.remove('active');
        heldKeys.delete(id); 
    });
}

knob.addEventListener('mousedown', startDrag);
knob.addEventListener('touchstart', startDrag, { passive: false });


// Toggle inputs

const scrbuttons1 = document.querySelector('.scrninput');
const radios = document.querySelectorAll('input[name="joystickToggle"]');
const display1 = document.querySelector('.screenJoystickController');
const display2 = document.querySelector('.screenJoystickP2');

radios.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            joystick.style.display = "block";
            scrbuttons1.style.display = "block";
            display1.style.display = "block";
            display2.style.display = "block";
        } else {
            joystick.style.display = "none";
            scrbuttons1.style.display = "none";
            display1.style.display = "none";
            display2.style.display = "none";
        }
    });
});

const scrbuttons2 = document.querySelector('.moveListsP2');
const radios2 = document.querySelectorAll('input[name="joystick2Toggle"]');

radios2.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            scrbuttons2.style.display = "block";
        } else {
            scrbuttons2.style.display = "none";
        }
    });
});

const onscreenSettings = document.querySelector('.onscreen-controls-panel');
const radios3 = document.querySelectorAll('input[name="controlPanelToggle"]');

radios3.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "on") {
            onscreenSettings.style.display = "block";
        } else {
            onscreenSettings.style.display = "none";
        }
    });
});




