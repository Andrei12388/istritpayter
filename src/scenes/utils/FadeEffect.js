// utils/FadeEffect.js
export class FadeEffect {
    constructor({ color = 'black', speed = 0.1, maxAlpha = 1 } = {}) {
        this.color = color;
        this.speed = speed;
        this.maxAlpha = maxAlpha;
        this.alpha = 0;
        this.active = false;
        this.fadingIn = false;
        this.fadingOut = false;
        this.done = false;
    }

    fadeIn() {
        this.active = true;
        this.fadingIn = true;
        this.fadingOut = false;
        this.done = false;
        this.alpha = 0;
    }

    fadeOut() {
        this.active = true;
        this.fadingIn = false;
        this.fadingOut = true;
        this.done = false;
        this.alpha = this.maxAlpha;
    }

    update() {
        if (!this.active) return;
        console.log('fading');
        if (this.fadingIn) {
            this.alpha += this.speed;
            if (this.alpha >= this.maxAlpha) {
                this.alpha = this.maxAlpha;
                this.fadingIn = false;
                this.done = true;
            }
        } else if (this.fadingOut) {
            this.alpha -= this.speed;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this.fadingOut = false;
                this.active = false;
                this.done = true;
            }
        }
    }

    draw(context, width, height) {
        if (!this.active && this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.fillRect(0, 0, width, height);
        context.restore();
    }
}
