export function extractPalette(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const set = new Set();

    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue; // ignore transparent
        set.add(`${data[i]},${data[i+1]},${data[i+2]}`);
    }
    return [...set]; // palette array
}

export function buildSingleColorMap(sourceRGB, targetRGB) {
    // sourceRGB = [r,g,b]
    // targetRGB = [nr,ng,nb]
    const key = `${sourceRGB[0]},${sourceRGB[1]},${sourceRGB[2]}`;
    const map = new Map();
    map.set(key, targetRGB);
    return map;
}


export function buildPaletteMap(originalPalette, targetPalette) {
    const map = new Map();
    for (let i = 0; i < originalPalette.length; i++) {
        // if palette lengths mismatch, safely clamp
        const [r, g, b] = originalPalette[i].split(",").map(Number);
        const [nr, ng, nb] = targetPalette[Math.min(i, targetPalette.length - 1)];
        map.set(`${r},${g},${b}`, [nr, ng, nb]);
    }
    return map;
}

function isCloseColor(r, g, b, target, tolerance) {
    return (
        Math.abs(r - target[0]) <= tolerance &&
        Math.abs(g - target[1]) <= tolerance &&
        Math.abs(b - target[2]) <= tolerance
    );
}




export function paletteSwap(image, colorMap, tolerance = 3) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        for (const [key, newColor] of colorMap.entries()) {
            const [tr, tg, tb] = key.split(",").map(Number);

            if (isCloseColor(pixels[i], pixels[i+1], pixels[i+2], [tr, tg, tb], tolerance)) {
                pixels[i]     = newColor[0];
                pixels[i + 1] = newColor[1];
                pixels[i + 2] = newColor[2];
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

function isNearWhite(r, g, b, threshold = 200) {
    return r >= threshold && g >= threshold && b >= threshold;
}

export function paletteSwapReplaceWhite(image, newColor) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue;

        if (isNearWhite(r, g, b, 210)) {
            pixels[i]     = newColor[0];
            pixels[i + 1] = newColor[1];
            pixels[i + 2] = newColor[2];
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

export function invertSprite(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        // invert colors
        pixels[i]     = 255 - pixels[i];     // R
        pixels[i + 1] = 255 - pixels[i + 1]; // G
        pixels[i + 2] = 255 - pixels[i + 2]; // B
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

export function hueShiftSprite(image, hueShiftDegrees) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        let r = pixels[i] / 255;
        let g = pixels[i + 1] / 255;
        let b = pixels[i + 2] / 255;

        // convert to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;

        let h, s;

        if (max === min) {
            h = 0;
            s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        // shift hue
        h = (h + hueShiftDegrees / 360) % 1;

        // convert back to RGB
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let r2, g2, b2;

        if (s === 0) {
            r2 = g2 = b2 = l; // gray
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1/3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1/3);
        }

        pixels[i]     = Math.round(r2 * 255);
        pixels[i + 1] = Math.round(g2 * 255);
        pixels[i + 2] = Math.round(b2 * 255);
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}






