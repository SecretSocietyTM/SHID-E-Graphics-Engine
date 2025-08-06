export class Color {
        // TODO: can probably use default vals for shorthand!
        constructor(r, g = r, b = r, wasMathed=false) {
        if (r < 1 && g < 1 && b < 1 && !wasMathed) {
            this.r = r * 255;
            this.g = g * 255;
            this.b = b * 255;
        }
        else {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    add(v) {
        return new Color(this.r + v.r, this.g + v.g, this.b + v.b, true);
    }

    sub(v) {
        return new Color(this.r - v.r, this.g - v.g, this.b - v.b, true);
    }

    addTo(v) {
        this.r += v.r;
        this.g += v.g;
        this.b += v.b;
        return this;
    }

    subTo(v) {
        this.r -= v.r;
        this.g -= v.g;
        this.b -= v.b;
        return this;
    }

    multiply(s) {
        let r = this.r * s;
        let g = this.g * s;
        let b = this.b * s;

        return new Color(r, g, b, true);
    }

    divide(s) {
        return new Color(this.r / s, this.g / s, this.b / s, true);
    }    
}