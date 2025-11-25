import { FRAME_TIME } from '../../../constants/game.js';

export class EffectSplash {
    constructor(args, time, entityListForeground){
        // args is expected to be [x, y, playerId, scale?]
        // keep backward-compatibility with older call sites by defaulting scale to 1
        const [x, y, playerId, scale = 1] = args;

        this.image = document.querySelector('img[alt="fxSplash"]');
        this.position = { x, y };
        this.playerId = playerId;
        this.entityList = entityListForeground;

        this.frames = [];
        // scale to apply to frame width/height and origin when drawing
        this.scale = Number.isFinite(scale) ? scale : 1;
        this.animationFrame = -1;
        this.animationTimer = 0;
    }

    update(time){
        if (time.previous < this.animationTimer + 4 * FRAME_TIME) return;
        this.animationFrame += 1;
        this.animationTimer = time.previous;

        if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
    }

    draw(context, camera) {
        // guard against invalid animationFrame (can be -1 if update hasn't run yet)
        if (this.animationFrame < 0 || this.animationFrame >= this.frames.length) return;

        const [
            [x, y, width, height], [originX, originY],
        ] = this.frames[this.animationFrame];

        // apply scale to origin and sprite size
        const scaledWidth = Math.floor(width * this.scale);
        const scaledHeight = Math.floor(height * this.scale);

        const drawX = Math.floor(this.position.x - camera.position.x - originX * this.scale);
        const drawY = Math.floor(this.position.y - camera.position.y - originY * this.scale);

    context.save();

        if (this.playerId == 1) {
            // Flip horizontally around the sprite center
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                x, y,
                width, height,
                -(drawX + scaledWidth), // negative X because of the flipped scale
                drawY,
                scaledWidth, scaledHeight,
            );
    } else {
        // Normal drawing
        context.drawImage(
            this.image,
            x, y,
            width, height,
                drawX, drawY,
                scaledWidth, scaledHeight,
        );
    }

    context.restore();
}

}