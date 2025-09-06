import { Intro } from './scenes/Intro.js';
import { StreetFighterGame } from './StreetFighterGame.js';
import { FighterState } from './constants/fighter.js';
import { heldKeys } from './inputHandler.js'; 
import { state as controlHold } from './inputHandler.js';



function populateMoveDropdown(){
    const dropdown = document.getElementById('state-dropdown');

    Object.entries(FighterState).forEach(([, value]) => {
    const option = document.createElement('option');
    option.setAttribute('value', value);
    option.innerText = value;
    dropdown.appendChild(option);
    });
}


window.addEventListener('load',function (){
  window.addEventListener('click', function (){
    populateMoveDropdown();
  new StreetFighterGame().start();
   //new Intro().start();
  }, {once: true});
    
});


//Onscreen Joystick

const joystick = document.getElementById('joystick');
const knob = document.getElementById('knob');
const maxDistance = 60;

export const state = {
    tapped: false
};
let holdTimer = 0;
let dragging = false;

function startDrag(e) {
  e.preventDefault();
  holdTimer = 0;
  dragging = true;
  state.tapped = true;
  console.log(state.tapped);
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
  holdTimer += 1;
  if(holdTimer === 4){
    controlHold.tapped = true;
  }
  if(holdTimer >= 10){
    state.tapped = true;
    holdTimer = 0;
  }
  console.log(holdTimer);
  if (!dragging) return;

  const touch = e.touches ? e.touches[0] : e;
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height/2;

  const dx = touch.clientX - centerX;
  const dy = touch.clientY - centerY;

  const distance = Math.min(Math.sqrt(dx*dx + dy*dy), maxDistance);
  const angle = Math.atan2(dy, dx);

  // move knob visually
  const x = -15 + distance * Math.cos(angle);
  const y = -12 + distance * Math.sin(angle);
  knob.style.transform = `translate(${x}px, ${y}px)`;

  // clear previous active states
  // Clear all first
['jump','mFor','mBack','crouchDown'].forEach(id => {
  document.getElementById(id).classList.remove('active');
  heldKeys.delete(id);
});

if (distance > 10) {
  if (angle > -Math.PI/8 && angle <= Math.PI/8) {
    // Right
    console.log('Right');
    document.getElementById('mFor').classList.add('active');
    heldKeys.add('mFor');
    
  } else if (angle > Math.PI/8 && angle <= 3*Math.PI/8) {
    // Down-Right
   // console.log('Down-Right');
    document.getElementById('mFor').classList.add('active');
    document.getElementById('crouchDown').classList.add('active');
    heldKeys.add('mFor');
    heldKeys.add('crouchDown');
   
  } else if (angle > 3*Math.PI/8 && angle <= 5*Math.PI/8) {
    // Down
  //  console.log('Down');
    document.getElementById('crouchDown').classList.add('active');
    heldKeys.add('crouchDown');
    
  } else if (angle > 5*Math.PI/8 && angle <= 7*Math.PI/8) {
    // Down-Left
   // console.log('Down-Left');
    document.getElementById('mBack').classList.add('active');
    document.getElementById('crouchDown').classList.add('active');
    heldKeys.add('mBack');
    heldKeys.add('crouchDown');
    
  } else if (angle > 7*Math.PI/8 || angle <= -7*Math.PI/8) {
    // Left
    console.log('Left');
    document.getElementById('mBack').classList.add('active');
    heldKeys.add('mBack');
   
  } else if (angle > -7*Math.PI/8 && angle <= -5*Math.PI/8) {
    // Up-Left
  //  console.log('Up-Left');
    document.getElementById('mBack').classList.add('active');
    document.getElementById('jump').classList.add('active');
    heldKeys.add('mBack');
    heldKeys.add('jump');
   
  } else if (angle > -5*Math.PI/8 && angle <= -3*Math.PI/8) {
    // Up
  //  console.log('Up');
    document.getElementById('jump').classList.add('active');
    heldKeys.add('jump');
   
  } else if (angle > -3*Math.PI/8 && angle <= -Math.PI/8) {
    // Up-Right
  //  console.log('Up-Right');
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
  knob.style.left = '18%';
  knob.style.top = '24%';
  knob.style.transform = 'translate(-18%, -24%)';
}

function endDrag() {
  holdTimer = 0;
  state.tapped = false;
  dragging = false;
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



  const scrbuttons1 = document.querySelector('.scrninput');
  const radios = document.querySelectorAll('input[name="joystickToggle"]');

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "on") {
        joystick.style.display = "block";
        scrbuttons1.style.display = "block";
      } else {
        joystick.style.display = "none";
        scrbuttons1.style.display = "none";
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
