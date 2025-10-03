import { FRAME_TIME } from '../../../constants/game.js';

export class HitSplash {
    constructor(args, time, entityList){
        const [x, y, playerId] = args;

        this.image = document.querySelector('img[alt="hitsplash"]');
        this.position = { x, y };
        this.playerId = playerId;
        this.entityList = entityList;

        this.frames = [];
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
    const [
        [x, y, width, height], [originX, originY],
    ] = this.frames[this.animationFrame];

    const drawX = Math.floor(this.position.x - camera.position.x - originX);
    const drawY = Math.floor(this.position.y - camera.position.y - originY);

    context.save();

    if (this.playerId == 1) {
        // Flip horizontally around the sprite center
        context.scale(-1, 1);
        context.drawImage(
            this.image,
            x, y,
            width, height,
            -(drawX + width), // negative X because of the flipped scale
            drawY,
            width, height,
        );
    } else {
        // Normal drawing
        context.drawImage(
            this.image,
            x, y,
            width, height,
            drawX, drawY,
            width, height,
        );
    }

    context.restore();
}

}