export const Control = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down',

    LIGHT_PUNCH: 'lightPunch',
    LIGHT_KICK: 'lightKick',
    HEAVY_PUNCH: 'heavyPunch',
    HEAVY_KICK: 'heavyKick',
    MEDIUM_PUNCH: 'mediumPunch',
    MEDIUM_KICK: 'mediumKick',
};

export const controls = [
    {
         keyboard: {
            [Control.LEFT]: 'KeyA',
            [Control.RIGHT]: 'KeyD',
            [Control.UP]: 'KeyW',
            [Control.DOWN]: 'KeyS',
            [Control.LIGHT_PUNCH]: 'KeyT',
            [Control.HEAVY_PUNCH]: 'KeyY',
            [Control.LIGHT_KICK]: 'KeyG',
            [Control.HEAVY_KICK]: 'KeyH',
        },
        buttons: {
            [Control.LEFT]: 'mBack',    // your div id for left
            [Control.RIGHT]: 'mFor',  // your div id for right
            [Control.UP]: 'jump',             // your div id for up
            [Control.DOWN]: 'crouchDown',  
            [Control.LIGHT_PUNCH]: 'AP1',    // your div id for down
            [Control.HEAVY_PUNCH]: 'BP1',
            [Control.LIGHT_KICK]: 'CP1',    // your div id for down
            [Control.HEAVY_KICK]: 'DP1',    // your div id for down
        }
    },
    {
        keyboard: {
            [Control.LEFT]: 'ArrowLeft',
            [Control.RIGHT]: 'ArrowRight',
            [Control.UP]: 'ArrowUp',
            [Control.DOWN]: 'ArrowDown',
            [Control.LIGHT_PUNCH]: 'KeyJ',
            [Control.HEAVY_PUNCH]: 'KeyK',
            [Control.LIGHT_KICK]: 'KeyN',
            [Control.HEAVY_KICK]: 'KeyM',
        },
       
        buttons: {
            [Control.LEFT]: 'mBackP2',    // your div id for left
            [Control.RIGHT]: 'mForP2',  // your div id for right
            [Control.UP]: 'jumpP2',             // your div id for up
            [Control.DOWN]: 'crouchDownP2', 
            [Control.LIGHT_PUNCH]: 'AP2',    // your div id for down
            [Control.HEAVY_PUNCH]: 'BP2',
            [Control.LIGHT_KICK]: 'CP2',    // your div id for down
            [Control.HEAVY_KICK]: 'DP2',    // your div id for down
        }
    },
];
