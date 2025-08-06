import {Vec2, Vec3} from "../util/vector.js";
import { Color } from "../util/color.js";

export const triangles = [
{
    color: new Color(255, 0, 0),
    alpha: 255,
    p0: new Vec3(0, 0, -1),
    p1: new Vec3(1, 0, -1),
    p2: new Vec3(0, 1, -1)
},
{
    color: new Color(25, 75, 200),
    alpha: 255,
    p0: new Vec3(-1,  0, -3),
    p1: new Vec3(0,   1, -3),
    p2: new Vec3(1,  -1, -3)
},
{
    color: new Color(175, 75, 200),
    alpha: 255,
    p0: new Vec3(-1,  0, -2),
    p1: new Vec3(0,   2, -4),
    p2: new Vec3(1,  -2, -5)
},
{
    color: new Color(75, 200, 50),
    alpha: 255,
    p0: new Vec3(2,  2,  -1),
    p1: new Vec3(-1, -1, -2),
    p2: new Vec3(2,  0,  -3)
},
{
    color: new Color(200, 25, 75),
    alpha: 255,
    p0: new Vec3(200, 200, -100),
    p1: new Vec3(1, 3, -4),
    p2: new Vec3(-2, -2, -2)
}
];