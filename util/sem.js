// SEM: Shid-E Graphics Engine Math (just copying OpenGL GLM)

import { vec, Vec2, Vec3, Vec4 } from "../util/vector.js";
import { Matrix3x3, Matrix4x4 } from "../util/matrix.js";

export default 
{
vec,
Vec2,
Vec3,
Vec4,

Matrix3x3,
Matrix4x4,





/**
 * 
 * @param {Matrix4x4} matrix 
 * @param {*} angle in radians
 * @param {Vec3} axis 
 */
rotate(matrix, angle, axis) {
    let m = Matrix4x4.identity();

    // first column
    let v00 = axis.x * axis.x + (1 - axis.x * axis.x) * Math.cos(angle);
    let v10 = axis.x * axis.y * (1 - Math.cos(angle))  + axis.z * Math.sin(angle);
    let v20 = axis.x * axis.z * (1 - Math.cos(angle))  - axis.y * Math.sin(angle);
    let v30 = 0;

    // second column
    let v01 = axis.y * axis.x * (1 - Math.cos(angle)) - axis.z * Math.sin(angle);
    let v11 = axis.y * axis.y + (1 - axis.y * axis.y)   * Math.cos(angle);
    let v21 = axis.y * axis.z * (1 - Math.cos(angle)) + axis.x * Math.sin(angle);
    let v31 = 0;

    // third column
    let v02 = axis.z * axis.x * (1 - Math.cos(angle)) + axis.y * Math.sin(angle);
    let v12 = axis.z * axis.y * (1 - Math.cos(angle)) - axis.x * Math.sin(angle);
    let v22 = axis.z * axis.z + (1 - axis.z * axis.z)   * Math.cos(angle);
    let v32 = 0;

    m.set(0, 0, v00);
    m.set(1, 0, v10);
    m.set(2, 0, v20);
    m.set(3, 0, v30);

    m.set(0, 1, v01);
    m.set(1, 1, v11);
    m.set(2, 1, v21);
    m.set(3, 1, v31);

    m.set(0, 2, v02);
    m.set(1, 2, v12);
    m.set(2, 2, v22);
    m.set(3, 2, v32);

    matrix = m.multiply(matrix);
    return matrix
}

}