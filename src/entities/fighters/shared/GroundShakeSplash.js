import { EffectSplash } from './EffectSplash.js';

export class GroundShakeSplash extends EffectSplash{
    constructor(args, time, entityListForeground){
        // allow an optional scale in the args: [x, y, playerId, scale]
        const [x, y, playerId, scale = 0.8] = args;
        // pass normalized args to the base so it can initialize scale and other props
        super([x, y, playerId, scale], time, entityListForeground);
        this.frameNumber = 4;
        this.frames = [
            //Player1
             [[1362, 773, 120, 25], [60, 23]],
             [[1344, 819, 151, 25], [75, 23]],
             [[1333, 865, 164, 27], [82, 25]],
             [[1313, 916, 184, 22], [92, 20]],

            //Player2
             [[1362, 773, 120, 25], [60, 23]],
             [[1344, 819, 151, 25], [75, 23]],
             [[1333, 865, 164, 27], [82, 25]],
             [[1313, 916, 184, 22], [92, 20]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}