import { Control, controls, GamepadThumbstick } from './constants/control.js';
import { FighterDirection } from './constants/fighter.js';
import { state as controlHold } from './index.js';
import { gameState } from './state/gameState.js';

const heldKeys = new Set();
const pressedKeys = new Set();
const lastAxes = new Map(); // Map<padId, number[]>

// Store *live* Gamepad objects keyed by index
const gamePads = new Map();

let tapped = true;
let holdTimer = 0;

export { heldKeys, pressedKeys };

export const state = {
  holding: 0,
};

// CHeck axis
function checkAxisTap(padId, axeId, positive, threshold) {
  const pad = gamePads.get(padId);
  if (!pad) return false;

  const value = pad.axes?.[axeId] ?? 0;
  const prev  = lastAxes.get(padId)?.[axeId] ?? 0;

  const crossed =
      positive ? (value >= threshold && prev < threshold)
               : (value <= threshold && prev > threshold);

  // save current for next frame
  const next = lastAxes.get(padId) || [];
  next[axeId] = value;
  lastAxes.set(padId, next);

  return crossed;
}

function showNotice(message) {
  const el = document.getElementById('notice');
  el.textContent = message;      // <-- change the text here
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3000);
}


/* -------------------------------------------------
   KEYBOARD
--------------------------------------------------*/
function handleKeyDown(event) {
  event.preventDefault();
  heldKeys.add(event.code);
}

function handleKeyUp(event) {
  controlHold.tapped = false;
  holdTimer = 0;
  tapped = true;
  event.preventDefault();
  heldKeys.delete(event.code);
  pressedKeys.delete(event.code);
}

export function registerKeyboardEvents() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

export function unregisterKeyboardEvents() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
}

/* -------------------------------------------------
   GAMEPAD
--------------------------------------------------*/
function handleGamepadConnected(e) {
  const pad = e.gamepad;
  gamePads.set(pad.index, pad);

  // Display the ID and index
  showNotice(`🎮 Gamepad Player ${pad.index + 1} connected: ${pad.id}`);
}

function handleGamepadDisconnected(e) {
  const pad = e.gamepad;
  gamePads.delete(pad.index);
  showNotice(`❌ Gamepad Player ${pad.index + 1} disconnected: ${pad.id}`);
}

export function registerGamepadEvents() {
  window.addEventListener('gamepadconnected', handleGamepadConnected);
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
}

// Call this every animation frame
export function pollGamepads() {
  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (!pad) continue;
    gamePads.set(pad.index, pad);
    
   holdTimer += 1;
          //controlHold.tapped = true;
          if (holdTimer === 10 || holdTimer >= 20) {
           controlHold.tapped = true;
            if (holdTimer >= 20) holdTimer = 0;
          }
  }
}

/* -------------------------------------------------
   ON-SCREEN BUTTONS (touch / mouse)
--------------------------------------------------*/
export function registerScreenButtonEvents() {
  controls.forEach((controlSet) => {
    Object.entries(controlSet.buttons).forEach(([_, elementId]) => {
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
          holdTimer += 1;
          if(gameState.characterSelectMode){
            controlHold.tapped = true;
            console.log('Control Hold Tapped!');
          }
          if (holdTimer === 10 || holdTimer >= 20) {
            tapped = true;
            if (holdTimer >= 20) holdTimer = 0;
          }
        }
        buttonEl.classList.add('clicked');
      };

      const handleRelease = (e) => {
        e.preventDefault();
        controlHold.tapped = false;
        holdTimer = 0;
        heldKeys.delete(virtualKeyCode);
        pressedKeys.delete(virtualKeyCode);
        buttonEl.classList.remove('clicked');
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

export function unregisterScreenButtonEvents() {
  controls.forEach((controlSet) => {
    Object.entries(controlSet.buttons).forEach(([_, elementId]) => {
      const buttonEl = document.getElementById(elementId);
      if (!buttonEl) return;

      // remove by cloning element (simpler than storing handlers)
      const newEl = buttonEl.cloneNode(true);
      buttonEl.parentNode.replaceChild(newEl, buttonEl);
    });
  });
}

export function disableScreenButtons() {
  document.querySelectorAll('.move, .move1, .move2, #joystick')
    .forEach(btn => btn.classList.add('disabled'));
}

export function enableScreenButtons() {
  document.querySelectorAll('.move, .move1, .move2, #joystick')
    .forEach(btn => btn.classList.remove('disabled'));
}

/* -------------------------------------------------
   STATE HELPERS
--------------------------------------------------*/
export const isKeyDown   = (code) => heldKeys.has(code);
export const isKeyUp     = (code) => !heldKeys.has(code);

export function isKeyPressed(code) {
  if (heldKeys.has(code) && !pressedKeys.has(code)) {
    pressedKeys.add(code);
    holdTimer += 1;
    if (holdTimer === 4 || holdTimer >= 10) {
      controlHold.tapped = true;
      if (holdTimer >= 10) holdTimer = 0;
    }
    return true;
  }
  return false;
}

export function isKeyTapped(code) {
  if (heldKeys.has(code) && !pressedKeys.has(code) && tapped) {
    tapped = false;
    pressedKeys.add(code);
    controlHold.tapped = true;
    return true;
  }
  return false;
}

/* -------------------------------------------------
   COMPOSITE CONTROLS
--------------------------------------------------*/
export const isControlDown = (id, ctl) =>
  isKeyDown(controls[id].keyboard[ctl]) ||
  isKeyDown(controls[id].buttons[ctl]) ||
  isButtonDown(id, controls[id].gamePad[ctl]);

export const isControlPressed = (id, ctl) => {
  // normal keys/buttons
  if (
    isKeyPressed(controls[id].keyboard[ctl]) ||
    isKeyDown(controls[id].buttons[ctl])    ||
    isButtonDown(id, controls[id].gamePad[ctl])
  ) return true;

  // --- Axis directions ---
  // If this control is a direction, check the stick
  switch (ctl) {
    case Control.LEFT:
      return isAxeLower(
        id,
        controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
        -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
      );
    case Control.RIGHT:
      return isAxeGreater(
        id,
        controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
        controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
      );
    case Control.UP:
      return isAxeLower(
        id,
        controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
        -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
      );
    case Control.DOWN:
      return isAxeGreater(
        id,
        controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
        controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
      );
    default:
      return false;
  }
};


export const isControlTapped = (id, ctl) =>
  isKeyTapped(controls[id].keyboard[ctl]) ||
  isKeyDown(controls[id].buttons[ctl]) ||
  isButtonDown(id, controls[id].gamePad[ctl]);

export const isLeft  = (id) => isKeyDown(controls[id].buttons[Control.LEFT])  || isKeyDown(controls[id].keyboard[Control.LEFT])
                          || isButtonDown(id, controls[id].gamePad[Control.LEFT])
                          || isAxeLower(id, controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
                                         -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]);

export const isRight = (id) => isKeyDown(controls[id].buttons[Control.RIGHT]) || isKeyDown(controls[id].keyboard[Control.RIGHT])
                          || isButtonDown(id, controls[id].gamePad[Control.RIGHT])
                          || isAxeGreater(id, controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
                                          controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]);

export const isUp    = (id) => isKeyDown(controls[id].buttons[Control.UP])    || isKeyDown(controls[id].keyboard[Control.UP])
                          || isButtonDown(id, controls[id].gamePad[Control.UP])
                          || isAxeLower(id, controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
                                        -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]);

export const isDown  = (id) => isKeyDown(controls[id].buttons[Control.DOWN])  || isKeyDown(controls[id].keyboard[Control.DOWN])
                          || isButtonDown(id, controls[id].gamePad[Control.DOWN])
                          || isAxeGreater(id, controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
                                          controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]);

export const isForward  = (id, dir) => dir === FighterDirection.RIGHT ? isRight(id) : isLeft(id);
export const isBackward = (id, dir) => dir === FighterDirection.RIGHT ? isLeft(id)  : isRight(id);
export const isIdle     = (id) => !(isLeft(id) || isRight(id) || isUp(id) || isDown(id));

export const isLightPunch = (id) => isControlPressed(id, Control.LIGHT_PUNCH);
export const isHeavyPunch = (id) => isControlPressed(id, Control.HEAVY_PUNCH);
export const isLightKick  = (id) => isControlPressed(id, Control.LIGHT_KICK);
export const isHeavyKick  = (id) => isControlPressed(id, Control.HEAVY_KICK);
export const isDodge      = (id) => isControlPressed(id, Control.LIGHT_PUNCH) &&
                                    isControlPressed(id, Control.LIGHT_KICK);

/* -------------------------------------------------
   GAMEPAD HELPERS
--------------------------------------------------*/
export const isButtonDown = (padId, buttonIndex) =>
  (buttonIndex !== '' && gamePads.get(padId)?.buttons?.[buttonIndex]?.pressed) || false;

export const isButtonUp = (padId, buttonIndex) =>
  (buttonIndex !== '' && !gamePads.get(padId)?.buttons?.[buttonIndex]?.pressed) || false;

export const isAxeGreater = (padId, axeId, value) =>
  gamePads.get(padId)?.axes?.[axeId] >= value;

export const isAxeLower = (padId, axeId, value) =>
  gamePads.get(padId)?.axes?.[axeId] <= value;
