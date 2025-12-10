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

        const key = `${pixels[i]},${pixels[i+1]},${pixels[i+2]}`;

        if (colorMap.has(key)) {
            const [nr, ng, nb] = colorMap.get(key);
            pixels[i]     = nr;
            pixels[i + 1] = ng;
            pixels[i + 2] = nb;
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}


