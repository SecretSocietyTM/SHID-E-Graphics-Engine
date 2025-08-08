import { Color } from "../util/color.js";

export class Image3 {
    constructor(ctx, width, height) {
        this.img = ctx.createImageData(width, height);
        this.width = width;
        this.height = height;
    }

    get(x, y) {
        const idx = (y * this.width + x) * 4;
        return new Color(
            this.img.data[idx + 0],
            this.img.data[idx + 1],
            this.img.data[idx + 2]
        );
    }

    put(x, y, color) {
        const idx = (y * this.width + x) * 4;
        this.img.data[idx + 0] = color.r;
        this.img.data[idx + 1] = color.g;
        this.img.data[idx + 2] = color.b;
        this.img.data[idx + 3] = color.a;
    }

    zeroes() {
        for (let i = 0; i < this.img.data.length; i+=4) {
            this.img.data[i + 3] = 255;
        }
    }
}