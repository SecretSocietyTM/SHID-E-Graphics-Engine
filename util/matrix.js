import { Vec3, Vec4 } from "./vector.js";

export class Matrix3x3 {
    constructor(v00=0, v01=0, v02=0,
                v10=0, v11=0, v12=0,
                v20=0, v21=0, v22=0) {
        this.data = [[v00, v01, v02],
                     [v10, v11, v12],
                     [v20, v21, v22]];
    }

    get(x, y) {
        return this.data[x][y];
    }

    set(x, y, value) {
        this.data[x][y] = value;
    }

    // multiplication against another matrix
    multiply(m) {
        if (!(m instanceof Matrix3x3)) throw new Error("Arg m is not of type Matrix3x3");
        let ret = new Matrix3x3();
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = ret.get(i, j);
                for (let k = 0; k < 3; k++) {
                    sum += this.data[i][k] * m.get(k, j);
                }
                ret.set(i, j, sum);
            }
        }
        return ret;
    }

    // multiplication against a Vec3
    multiplyV(v) {
        if (!(v instanceof Vec3)) throw new Error("Arg v is not of type Vec3");
        let ret = new Vec3();

        for (let i = 0; i < 3; i++) {
            let sum = 0;
            for (let j = 0; j < 3; j++) {
                sum += this.data[i][j] * v.get(j);
            }
            ret.set(i, sum);
        }
        return ret;
    }

    inverse() {
        // copied from CSE167 matrix.h but swapped to row major becauase column major is weird!
        let inv = new Matrix3x3();

        let det = this.data[0][0] * (this.data[1][1] * this.data[2][2] - this.data[1][2] * this.data[2][1]) - 
                  this.data[0][1] * (this.data[1][0] * this.data[2][2] - this.data[2][0] * this.data[1][2]) +
                  this.data[0][2] * (this.data[1][0] * this.data[2][1] - this.data[2][0] * this.data[1][1]);

        if (det === 0) return inv;

        let invdet = 1 / det;

        inv.set(0, 0, (this.data[1][1] * this.data[2][2] - this.data[2][1] * this.data[1][2]) * invdet);
        inv.set(0, 1, (this.data[0][2] * this.data[2][1] - this.data[0][1] * this.data[2][2]) * invdet);
        inv.set(0, 2, (this.data[0][1] * this.data[1][2] - this.data[0][2] * this.data[1][1]) * invdet);
        inv.set(1, 0, (this.data[1][2] * this.data[2][0] - this.data[1][0] * this.data[2][2]) * invdet);
        inv.set(1, 1, (this.data[0][0] * this.data[2][2] - this.data[0][2] * this.data[2][0]) * invdet);
        inv.set(1, 2, (this.data[1][0] * this.data[0][2] - this.data[0][0] * this.data[1][2]) * invdet);
        inv.set(2, 0, (this.data[1][0] * this.data[2][1] - this.data[2][0] * this.data[1][1]) * invdet);
        inv.set(2, 1, (this.data[2][0] * this.data[0][1] - this.data[0][0] * this.data[2][1]) * invdet);
        inv.set(2, 2, (this.data[0][0] * this.data[1][1] - this.data[1][0] * this.data[0][1]) * invdet);

        return inv;
    }

    static identity() {
        let m = new Matrix3x3();
        m.data[0][0] = 1;
        m.data[1][1] = 1;
        m.data[2][2] = 1;
        return m;
    }
}

export class Matrix4x4 {
    constructor(v00=0, v01=0, v02=0, v03=0,
                v10=0, v11=0, v12=0, v13=0,
                v20=0, v21=0, v22=0, v23=0,
                v30=0, v31=0, v32=0, v33=0) {
        this.data = [[v00, v01, v02, v03],
                     [v10, v11, v12, v13],
                     [v20, v21, v22, v23],
                     [v30, v31, v32, v33]];
    }

    get(x, y) {
        return this.data[x][y];
    }

    set(x, y, value) {
        this.data[x][y] = value;
    }

    // multiplication against another matrix
    multiply(m) {
        if (!(m instanceof Matrix4x4)) throw new Error("Arg m is not of type Matrix3x3");
        let ret = new Matrix4x4();
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = ret.get(i, j);
                for (let k = 0; k < 4; k++) {
                    sum += this.data[i][k] * m.get(k, j);
                }
                ret.set(i, j, sum);
            }
        }
        return ret;
    }

    // multiplication against a Vec4
    multiplyV4(v) {
        if (!(v instanceof Vec4)) throw new Error("Arg v is not of type Vec3");
        let ret = new Vec4();

        for (let i = 0; i < 4; i++) {
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                sum += this.data[i][j] * v.get(j);
            }
            ret.set(i, sum);
        }
        return ret;
    }

    inverse() {
        // copied from CSE167 matrix.h but swapped to row major becauase column major is weird!
        let inv = new Matrix4x4();

        let val00 = this.data[1][1] * this.data[2][2] * this.data[3][3] -
                    this.data[1][1] * this.data[3][2] * this.data[2][3] -
                    this.data[1][2] * this.data[2][1] * this.data[3][3] +
                    this.data[1][2] * this.data[3][1] * this.data[2][3] +
                    this.data[1][3] * this.data[2][1] * this.data[3][2] -
                    this.data[1][3] * this.data[3][1] * this.data[2][2];
        inv.set(0, 0, val00);

        let val01 = -this.data[0][1] * this.data[2][2] * this.data[3][3] +
                     this.data[0][1] * this.data[3][2] * this.data[2][3] +
                     this.data[0][2] * this.data[2][1] * this.data[3][3] -
                     this.data[0][2] * this.data[3][1] * this.data[2][3] -
                     this.data[0][3] * this.data[2][1] * this.data[3][2] +
                     this.data[0][3] * this.data[3][1] * this.data[2][2];
        inv.set(0, 1, val01);

        let val02 = this.data[0][1] * this.data[1][2] * this.data[3][3] -
                    this.data[0][1] * this.data[3][2] * this.data[1][3] -
                    this.data[0][2] * this.data[1][1] * this.data[3][3] +
                    this.data[0][2] * this.data[3][1] * this.data[1][3] +
                    this.data[0][3] * this.data[1][1] * this.data[3][2] -
                    this.data[0][3] * this.data[3][1] * this.data[1][2];
        inv.set(0, 2, val02);

        let val03 = -this.data[0][1] * this.data[1][2] * this.data[2][3] +
                     this.data[0][1] * this.data[2][2] * this.data[1][3] +
                     this.data[0][2] * this.data[1][1] * this.data[2][3] -
                     this.data[0][2] * this.data[2][1] * this.data[1][3] -
                     this.data[0][3] * this.data[1][1] * this.data[2][2] +
                     this.data[0][3] * this.data[2][1] * this.data[1][2];
        inv.set(0, 3, val03);

        let val10 = -this.data[1][0] * this.data[2][2] * this.data[3][3] +
                     this.data[1][0] * this.data[3][2] * this.data[2][3] +
                     this.data[1][2] * this.data[2][0] * this.data[3][3] -
                     this.data[1][2] * this.data[3][0] * this.data[2][3] -
                     this.data[1][3] * this.data[2][0] * this.data[3][2] +
                     this.data[1][3] * this.data[3][0] * this.data[2][2];
        inv.set(1, 0, val10);

        let val11 = this.data[0][0] * this.data[2][2] * this.data[3][3] -
                    this.data[0][0] * this.data[3][2] * this.data[2][3] -
                    this.data[0][2] * this.data[2][0] * this.data[3][3] +
                    this.data[0][2] * this.data[3][0] * this.data[2][3] +
                    this.data[0][3] * this.data[2][0] * this.data[3][2] -
                    this.data[0][3] * this.data[3][0] * this.data[2][2];
        inv.set(1, 1, val11);

        let val12 = -this.data[0][0] * this.data[1][2] * this.data[3][3] +
                     this.data[0][0] * this.data[3][2] * this.data[1][3] +
                     this.data[0][2] * this.data[1][0] * this.data[3][3] -
                     this.data[0][2] * this.data[3][0] * this.data[1][3] -
                     this.data[0][3] * this.data[1][0] * this.data[3][2] +
                     this.data[0][3] * this.data[3][0] * this.data[1][2];
        inv.set(1, 2, val12);

        let val13 = this.data[0][0] * this.data[1][2] * this.data[2][3] -
                    this.data[0][0] * this.data[2][2] * this.data[1][3] -
                    this.data[0][2] * this.data[1][0] * this.data[2][3] +
                    this.data[0][2] * this.data[2][0] * this.data[1][3] +
                    this.data[0][3] * this.data[1][0] * this.data[2][2] -
                    this.data[0][3] * this.data[2][0] * this.data[1][2];
        inv.set(1, 3, val13);

        let val20 = this.data[1][0] * this.data[2][1] * this.data[3][3] -
                    this.data[1][0] * this.data[3][1] * this.data[2][3] -
                    this.data[1][1] * this.data[2][0] * this.data[3][3] +
                    this.data[1][1] * this.data[3][0] * this.data[2][3] +
                    this.data[1][3] * this.data[2][0] * this.data[3][1] -
                    this.data[1][3] * this.data[3][0] * this.data[2][1];
        inv.set(2, 0, val20);

        let val21 = -this.data[0][0] * this.data[2][1] * this.data[3][3] +
                     this.data[0][0] * this.data[3][1] * this.data[2][3] +
                     this.data[0][1] * this.data[2][0] * this.data[3][3] -
                     this.data[0][1] * this.data[3][0] * this.data[2][3] -
                     this.data[0][3] * this.data[2][0] * this.data[3][1] +
                     this.data[0][3] * this.data[3][0] * this.data[2][1];
        inv.set(2, 1, val21);

        let val22 = this.data[0][0] * this.data[1][1] * this.data[3][3] -
                    this.data[0][0] * this.data[3][1] * this.data[1][3] -
                    this.data[0][1] * this.data[1][0] * this.data[3][3] +
                    this.data[0][1] * this.data[3][0] * this.data[1][3] +
                    this.data[0][3] * this.data[1][0] * this.data[3][1] -
                    this.data[0][3] * this.data[3][0] * this.data[1][1];
        inv.set(2, 2, val22);

        let val23 = -this.data[0][0] * this.data[1][1] * this.data[2][3] +
                     this.data[0][0] * this.data[2][1] * this.data[1][3] +
                     this.data[0][1] * this.data[1][0] * this.data[2][3] -
                     this.data[0][1] * this.data[2][0] * this.data[1][3] -
                     this.data[0][3] * this.data[1][0] * this.data[2][1] +
                     this.data[0][3] * this.data[2][0] * this.data[1][1];
        inv.set(2, 3, val23);

        let val30 = -this.data[1][0] * this.data[2][1] * this.data[3][2] +
                     this.data[1][0] * this.data[3][1] * this.data[2][2] +
                     this.data[1][1] * this.data[2][0] * this.data[3][2] -
                     this.data[1][1] * this.data[3][0] * this.data[2][2] -
                     this.data[1][2] * this.data[2][0] * this.data[3][1] +
                     this.data[1][2] * this.data[3][0] * this.data[2][1];
        inv.set(3, 0, val30);

        let val31 = this.data[0][0] * this.data[2][1] * this.data[3][2] -
                    this.data[0][0] * this.data[3][1] * this.data[2][2] -
                    this.data[0][1] * this.data[2][0] * this.data[3][2] +
                    this.data[0][1] * this.data[3][0] * this.data[2][2] +
                    this.data[0][2] * this.data[2][0] * this.data[3][1] -
                    this.data[0][2] * this.data[3][0] * this.data[2][1];
        inv.set(3, 1, val31);

        let val32 = -this.data[0][0] * this.data[1][1] * this.data[3][2] +
                     this.data[0][0] * this.data[3][1] * this.data[1][2] +
                     this.data[0][1] * this.data[1][0] * this.data[3][2] -
                     this.data[0][1] * this.data[3][0] * this.data[1][2] -
                     this.data[0][2] * this.data[1][0] * this.data[3][1] +
                     this.data[0][2] * this.data[3][0] * this.data[1][1];
        inv.set(3, 2, val32);

        let val33 = this.data[0][0] * this.data[1][1] * this.data[2][2] -
                    this.data[0][0] * this.data[2][1] * this.data[1][2] -
                    this.data[0][1] * this.data[1][0] * this.data[2][2] +
                    this.data[0][1] * this.data[2][0] * this.data[1][2] +
                    this.data[0][2] * this.data[1][0] * this.data[2][1] -
                    this.data[0][2] * this.data[2][0] * this.data[1][1];
        inv.set(3, 3, val33);

        let det = this.data[0][0] * inv.get(0, 0) +
                  this.data[1][0] * inv.get(0, 1) +
                  this.data[2][0] * inv.get(0, 2) +
                  this.data[3][0] * inv.get(0, 3);

        if (det === 0) return inv;

        let invdet = 1 / det;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let res = inv.get(i, j);
                res *= invdet;
                inv.set(i, j, res);
            }
        }

        return inv;
    }

    static identity() {
        let m = new Matrix4x4();
        m.data[0][0] = 1;
        m.data[1][1] = 1;
        m.data[2][2] = 1;
        m.data[3][3] = 1;
        return m;
    }
}