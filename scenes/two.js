import {Vec3} from "../util/vector.js";
import { Color } from "../util/color.js";

export default{
    vertices: [
        new Vec3(-0.492931, 0.128937, -10.741019), 
        new Vec3(0.025111, -1.847709, -9.584261), 
        new Vec3(-1.253942, -1.113622, -7.757049), 
        new Vec3(-1.771980, 0.863028, -8.913807),
        new Vec3(0.645860, -0.080392, -6.842286), 
        new Vec3(0.127818, 1.896260, -7.999044), 
        new Vec3(1.924910, -0.814484, -8.669510),
        new Vec3(1.406871, 1.162166, -9.826268)
    ],
    faces: [
        new Vec3(0, 1, 2), new Vec3(0, 2, 3),
        new Vec3(3, 2, 4), new Vec3(3, 4, 5),
        new Vec3(5, 4, 6), new Vec3(5, 6, 7),
        new Vec3(7, 6, 1), new Vec3(7, 1, 0),
        new Vec3(3, 5, 7), new Vec3(3, 7, 0),
        new Vec3(4, 2, 1), new Vec3(4, 1, 6)
    ],
    face_colors: [
     new Color(0.2, 0.5, 0.8), new Color(0.2, 0.5, 0.8),
     new Color(0.2, 0.8, 0.5), new Color(0.2, 0.8, 0.5),
     new Color(0.8, 0.2, 0.5), new Color(0.8, 0.2, 0.5),
     new Color(0.8, 0.8, 0.2), new Color(0.8, 0.8, 0.2),
     new Color(0.2, 0.8, 0.8), new Color(0.2, 0.8, 0.8),
     new Color(0.8, 0.2, 0.8), new Color(0.8, 0.2, 0.8)
    ]
};