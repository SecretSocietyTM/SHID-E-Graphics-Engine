import { Color } from "../util/color.js";
import { vec, Vec2, Vec3, Vec4 } from "./vector.js";
import { Matrix3x3, Matrix4x4 } from "./matrix.js";
import * as hlp from "../util/helper.js";

function parseTransformation(object) {
    let F = Matrix4x4.identity();

    let transforms = object.transform;
    if (!transforms) {
        return F;
    }

    for (const trans in transforms) {
        let m = Matrix4x4.identity();
        if (trans === "scale") {
            let scale = new Vec3(
                transforms[trans][0], 
                transforms[trans][1], 
                transforms[trans][2]);

            m.set(0, 0, scale.x);
            m.set(1, 1, scale.y);
            m.set(2, 2, scale.z);
            F = m.multiply(F);
        } else if (trans === "rotate") {
            let angle = transforms[trans][0];
            let rads = angle * Math.PI / 180;
            let axis = vec.normalize(new Vec3(
                transforms[trans][1],
                transforms[trans][2],
                transforms[trans][3]));

            // first column
            let v00 = axis.x * axis.x + (1 - axis.x * axis.x) * Math.cos(rads);
            let v10 = axis.x * axis.y * (1 - Math.cos(rads))  + axis.z * Math.sin(rads);
            let v20 = axis.x * axis.z * (1 - Math.cos(rads))  - axis.y * Math.sin(rads);
            let v30 = 0;

            // second column
            let v01 = axis.y * axis.x * (1 - Math.cos(rads)) - axis.z * Math.sin(rads);
            let v11 = axis.y * axis.y + (1 - axis.y * axis.y)   * Math.cos(rads);
            let v21 = axis.y * axis.z * (1 - Math.cos(rads)) + axis.x * Math.sin(rads);
            let v31 = 0;
 
            // third column
            let v02 = axis.z * axis.x * (1 - Math.cos(rads)) + axis.y * Math.sin(rads);
            let v12 = axis.z * axis.y * (1 - Math.cos(rads)) - axis.x * Math.sin(rads);
            let v22 = axis.z * axis.z + (1 - axis.z * axis.z)   * Math.cos(rads);
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
            F = m.multiply(F);
        } else if (trans === "translate") {
            let translate = new Vec3(
                transforms[trans][0], 
                transforms[trans][1], 
                transforms[trans][2]);

            m.set(0, 3, translate.x);
            m.set(1, 3, translate.y);
            m.set(2, 3, translate.z);
            F = m.multiply(F);
        } else if (trans === "lookat") {
            let position = new Vec3(0, 0, 0);
            let target = new Vec3(0, 0, -1);
            let up = new Vec3(0, 1, 0);
        
            position = new Vec3(
                transforms[trans].position[0],
                transforms[trans].position[1],
                transforms[trans].position[2]);

            target = new Vec3(
                transforms[trans].target[0],
                transforms[trans].target[1],
                transforms[trans].target[2]);

            up = new Vec3(
                transforms[trans].up[0],
                transforms[trans].up[1],
                transforms[trans].up[2]);

            let d = vec.normalize(target.sub(position));
            let r = vec.normalize(vec.cross(d, up));
            let up_p = vec.cross(r, d);

            m.set(0, 0, r.x);
            m.set(1, 0, r.y);
            m.set(2, 0, r.z);

            m.set(0,1, up_p.x);
            m.set(1,1, up_p.y);
            m.set(2,1, up_p.z);

            // third column
            m.set(0,2, -d.x);
            m.set(1,2, -d.y);
            m.set(2,2, -d.z);

            // fourth column
            m.set(0,3, position.x);
            m.set(1,3, position.y);
            m.set(2,3, position.z);
            F = m.multiply(F);
        }
    }
    return F;
}

export function parseScene(scene) {
    let result = {
        camera: {},
        bg_color: null,
        mesh: {}
    };

    let camera = scene.camera;
    if (!camera) {
        throw new Error("Scene does not contain the field \"camera\".");
    }

    let res = camera.resolution;
    if (!res) {
        throw new Error("Camera does not contain the field \"resolution\".");
    }

    result.camera.resolution = res;
    result.camera.cam_to_world = parseTransformation(camera);
    result.camera.s = 1;
    if (camera.s) {
        result.camera.s = camera.s;
    }
    result.camera.z_near = 1e-6;
    if (camera.z_near) {
        result.camera.z_near = camera.z_near;
    }

    result.bg_color = new Color(255);
    let background = scene.background;
    if (background) {
        result.bg_color = background;
    }
    
    let mesh = {};
    let objects = scene.objects;

    let vertices = objects.vertices;
    let num_vertices = vertices.length / 3;
    mesh.vertices = new Array(num_vertices);
    for (let i = 0; i < num_vertices; i++) {
        mesh.vertices[i] = new Vec3(
            vertices[3 * i + 0], 
            vertices[3 * i + 1], 
            vertices[3 * i + 2]);
    }

    let faces = objects.faces;
    let num_faces = faces.length / 3;
    mesh.faces = new Array(num_faces);
    for (let i = 0; i < num_faces; i++) {
        mesh.faces[i] = new Vec3(
            faces[3 * i + 0],
            faces[3 * i + 1],
            faces[3 * i + 2]);
    }

    let vertex_colors = objects.vertex_colors;
    mesh.vertex_colors = new Array(num_vertices);
    for (let i = 0; i < num_vertices; i++) {
        mesh.vertex_colors[i] = new Color(
            vertex_colors[3 * i + 0],
            vertex_colors[3 * i + 1],
            vertex_colors[3 * i + 2]);
    }
    mesh.model_matrix = parseTransformation(objects);
    result.mesh = mesh;

    console.log(result.camera.cam_to_world);
    console.log(result.mesh.model_matrix);
    return result;
}