export class ZBuffer {
    constructor(width, height, supersample) {
        this.width = width;
        this.height = height;
        this.supersample = supersample;
        this.buffer = new Float32Array(width * height * supersample);
        this.buffer.fill(Infinity);
    }

    get(x, y, z) {
        const idx = ((y * this.width + x) * this.supersample) + z;
        return this.buffer[idx];
    }

    set(x, y, z, value) {
        const idx = ((y * this.width + x) * this.supersample) + z;
        this.buffer[idx] = value;
    }
}