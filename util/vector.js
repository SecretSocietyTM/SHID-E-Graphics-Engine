export class Vec2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    get(i) {
        if (i == 0) return this.x;
        else if (i == 1) return this.y;
        else throw new Error("Arg i out of range"); 
    }

    set(i, value) {
        if (i == 0) this.x = value;
        else if (i == 1) this.y = value;
        else throw new Error("Arg i out of range");         
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    addTo(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subTo(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    divide(s) {
        return new Vec2(this.x / s, this.y / s);
    }
}

export class Vec3 {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get(i) {
        if (i == 0) return this.x;
        else if (i == 1) return this.y;
        else if (i == 2) return this.z;
        else throw new Error("Arg i out of range"); 
    }

    set(i, value) {
        if (i == 0) this.x = value;
        else if (i == 1) this.y = value;
        else if (i == 2) this.z = value;
        else throw new Error("Arg i out of range");         
    }

    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    addTo(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    subTo(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    multiply(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    divide(s) {
        return new Vec3(this.x / s, this.y / s, this.z / s);
    }    
}

export class Vec4 {
        constructor(x=0, y=0, z=0, w=0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    get(i) {
        if (i == 0) return this.x;
        else if (i == 1) return this.y;
        else if (i == 2) return this.z;
        else if (i == 3) return this.w;
        else throw new Error("Arg i out of range"); 
    }

    set(i, value) {
        if (i == 0) this.x = value;
        else if (i == 1) this.y = value;
        else if (i == 2) this.z = value;
        else if (i == 3) this.w = value;
        else throw new Error("Arg i out of range");         
    }

    add(v) {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    sub(v) {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    addTo(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    }

    subTo(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        this.w -= v.w;
        return this;
    }

    multiply(s) {
        return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    divide(s) {
        return new Vec4(this.x / s, this.y / s, this.z / s, this.w / s);
    }    
}

export const vec = {
    dotV2, dotV3, dotV4,
    cross, length_squared, length, normalize
}



// general vector functions
function dotV2(v, w) {
    return v.x * w.x + v.y * w.y; 
}

function dotV3(v, w) {
    return v.x * w.x + v.y * w.y + v.z * w.z;
}

function dotV4(v, w) {
    return v.x * w.x + v.y * w.y + v.z * w.z + v.w * w.w; 
}

function cross(v, w) {
    if ((v instanceof Vec3 && w instanceof Vec3)) {
        return new Vec3(
            v.y * w.z - v.z * w.y,
            -(v.x * w.z - v.z * w.x),
            v.x * w.y - v.y * w.x
        );
    }
    throw new Error("Args are not of type Vec3");
}

function length_squared(v) {
    if (v instanceof Vec2) return dotV2(v, v);
    else if (v instanceof Vec3) return dotV3(v,v);
    else if (v instanceof Vec4) return dotV4(v,v);
    else throw Error("Invlaid arg v");
}

function length(v) {
    return Math.sqrt(length_squared(v));
}

function normalize(v) {
    let len = length(v);
    if (len <= 0) {
        return new v.constructor(0, 0, 0, 0);
    } else {
        return v.divide(len);
    }
}