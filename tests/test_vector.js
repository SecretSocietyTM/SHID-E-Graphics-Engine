import { vec, Vec2, Vec3 } from "../util/vector.js";

let v = new Vec2(5, 7);
console.log("v = ", v);
let w = new Vec2(3, 4);
console.log("w = ", w);
let u = v.add(w);
console.log("u = ", u);
let z = v.sub(w);
console.log("z = ", z);

let a = v.multiply(4);
console.log("a = ", a);
let b = a.divide(4);
console.log("b = ", b);

let val = vec.dot(v, w);
console.log(val);

let v1 = new Vec3(2, 0, 1);
let w1 = new Vec3(0, 3, 5);
let val2 = vec.cross(v1, w1);
console.log(val2);

let val3 = vec.length_squared(v);
console.log(val3);

let val4 = vec.length(v);
console.log(val4);

let val5 = vec.normalize(new Vec2(4, -9));
console.log(val5);