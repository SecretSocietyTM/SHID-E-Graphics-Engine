// SE: Shid-E object to hold rendering info and render

import { Image3 } from "../util/image.js";
import { Color } from "../util/color.js";
import { vec, Vec2, Vec3, Vec4 } from "../util/vector.js";
import { Matrix3x3, Matrix4x4 } from "../util/matrix.js";
import { ZBuffer } from "../util/zbuffer.js";
import * as hlp from "../util/helper.js";

import sem from "../util/sem.js";


export default class ShidE {
// TODO: change to not do this lmao
constructor(context, supersample, scene) {
    this.context = context;

    this.width = scene.camera.resolution.x;
    this.height = scene.camera.resolution.y;

    this.img = new Image3(this.context, this.width, this.height);
    this.img.zeroes();

    this.s = scene.camera.s;
    this.z_near = scene.camera.z_near;

    this.supersample = supersample;
    this.supersample_dimensions = Math.sqrt(this.supersample);
    this.frac = (1 / this.supersample_dimensions) / 2;

    // TODO: also move this elsewere
    this.vertices = scene.mesh.vertices
    this.faces = scene.mesh.faces;
    this.v_colors = scene.mesh.vertex_colors;

    // for now cam_to_world stays the same
    this.cam_to_world = scene.camera.cam_to_world;
    this.model_matrix = scene.mesh.model_matrix;
}

// need to remove this, just a hack for now
rotate(angle, axis) {
    this.model_matrix = sem.rotate(this.model_matrix, angle, axis);
}

renderTriangles() {
    const z_buf = new ZBuffer(this.width, this.height, this.supersample);

    for (let idx = 0; idx < this.faces.length; idx++) {
        let tri = {
            p0: this.vertices[this.faces[idx].x],
            p1: this.vertices[this.faces[idx].y],
            p2: this.vertices[this.faces[idx].z]
        }
        let tri_colors = {
            p0: this.v_colors[this.faces[idx].x],
            p1: this.v_colors[this.faces[idx].y],
            p2: this.v_colors[this.faces[idx].z]
        }

        let world_tri = hlp.modelToWorld(tri, this.model_matrix);
        let cam_tri = hlp.worldToCam(world_tri, this.cam_to_world);

        if (cam_tri.p0.z < this.z_near &&
            cam_tri.p1.z < this.z_near &&
            cam_tri.p2.z < this.z_near) {

            let screen_tri = hlp.perspective(cam_tri, this.width, this.height, this.s);
            let bb = hlp.computeBoundingBox(screen_tri, this.width, this.height);

            for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
                for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                    let color_sum = new Color(0, 0, 0);
                    for (let j = 0; j < 1; j += this.frac * 2) {
                        for (let i = 0; i < 1; i += this.frac * 2) {
                            let px_cntr = new Vec2(x + i + this.frac, y + j + this.frac);
                            if (hlp.withinBounds(screen_tri, px_cntr)) {
                                let {Z, color} = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, px_cntr);
                                let subpx_idx = j * this.supersample + i * this.supersample_dimensions;
                                
                                if (Z < z_buf.get(x, y, subpx_idx)) {
                                    z_buf.set(x, y, subpx_idx, Z);
                                    color_sum.addTo(color);
                                } else {
                                    color_sum.addTo(this.img.get(x,y));
                                }
                            } else {
                                color_sum.addTo(this.img.get(x, y));
                            }
                        }
                    }
                    let color_avg = color_sum.divide(this.supersample);
                    color_avg.a = 255;
                    this.img.put(x, y, color_avg);
                }
            }            
        }
    }
    this.context.putImageData(this.img.img, 0, 0);
}
}