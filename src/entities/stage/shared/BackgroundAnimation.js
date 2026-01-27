export class BackgroundAnimation {
    constructor(image, frames, animation, startFrame = 0) {
        this.image = image;
        this.frames = new Map(frames);
        this.animation = animation;
        this.animationFrame = startFrame;
        this.animationTimer = 0;
        this.frameDelay = animation[this.animationFrame][1]; // ✅ Fixed
    }

    update(time) {
        this.animationTimer += time.secondsPassed;
        if (this.animationTimer < this.frameDelay / 1000) return;
        this.animationFrame += 1;

        if (this.animationFrame >= this.animation.length) {
            this.animationFrame = 0;
        }

        this.frameDelay = this.animation[this.animationFrame][1]; // ✅ Fixed
        this.animationTimer = 0;
    }

     drawWithOrigin(context, x, y, direction = 1, scaleY = 1) {
        const [frameKey] = this.animation[this.animationFrame];
        const [[frameX, frameY, frameWidth, frameHeight], [originX, originY]] = this.frames.get(frameKey);
        context.save();
        context.scale(direction, scaleY);
        context.drawImage(
            this.image,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
            Math.floor((x)*direction - originX),
            Math.floor(y - originY),
            frameWidth,
            frameHeight
        );
        context.setTransform(1,0,0,1,0,0);
    }

    draw(context, x, y, direction = 1) {
        const [frameKey] = this.animation[this.animationFrame];
        const [frameX, frameY, frameWidth, frameHeight] = this.frames.get(frameKey);
        context.scale(direction,1);
        context.drawImage(
            this.image,
            frameX, frameY, frameWidth, frameHeight,
            x*direction, y, frameWidth, frameHeight,
        );
        context.setTransform(1,0,0,1,0,0);
    }
}
