import { Image3 } from "../util/image.js";
import { Color } from "../util/color.js";
import { vec, Vec2, Vec3, Vec4 } from "../util/vector.js";
import { Matrix3x3, Matrix4x4 } from "../util/matrix.js";
import { ZBuffer } from "../util/zbuffer.js";
import * as hlp from "../util/helper.js";
import * as prs from "../util/parser.js";

import triangles from "../scenes/one.js";
import cube from "../scenes/two.js";
import scenes from "../scenes/draw3scenes.js";

const canvas = document.getElementById("canvas");


function draw1(supersample, triangle) {
    let width = 640;
    let height = 480;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    const ctx = canvas.getContext("2d");
    const img = new Image3(ctx, canvas.width, canvas.height);
    console.log(img);

    let s = 1;          // scaling factor of view frustrum
    let z_near = 1e-6;  // near clipping plane

    const bg_color = new Color(0);
    const bb_color = new Color(185);
    let frac = (1 / Math.sqrt(supersample)) / 2;

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            bg_color.a = 255;
            img.put(x, y, bg_color);
        }
    }
    if (triangle.p0.z < z_near && triangle.p1.z < z_near && triangle.p2.z < z_near) {
        
        let pcs = hlp.camToProjectCam(triangle);                // "camera space" to "project camera space"
        let ss = hlp.projectCamToScreen(width, height, s, pcs); // "projected camera space" to "screen space"
        let bb = hlp.computeBoundingBox(width, height, ss)      // compute bounding box

        for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
            for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                let color_sum = new Color(0, 0, 0);
                for (let j = 0; j < 1; j += frac * 2) {
                    for (let i = 0; i < 1; i += frac * 2) {
                        let px_cntr = new Vec2(x + i + frac, y + j + frac);
        
                        if (hlp.withinBounds(ss, px_cntr)) {
                            color_sum.addTo(triangle.color);
                        } else {
                            color_sum.addTo(bb_color);
                        }
                    }
                }
                let color_avg = color_sum.divide(supersample)
                color_avg.a = 255;
                img.put(x, y, color_avg)
            }
        }
    }
    ctx.putImageData(img.img, 0, 0);
}



function draw2(supersample, scene) {
    let width = 640;
    let height = 480;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    const ctx = canvas.getContext("2d");
    const img = new Image3(ctx, canvas.width, canvas.height);

    let s = 0.5;          // scaling factor of view frustrum
    let z_near = 1e-6;  // near clipping plane

    let ss_dim = Math.sqrt(supersample);
    let frac = (1 / ss_dim) / 2;

    const z_buf = new ZBuffer(width, height, supersample);
    img.zeroes();

    for (let idx = 0; idx < scene.faces.length; idx++) {
        let triangle = {
            p0: scene.vertices[scene.faces[idx].x],
            p1: scene.vertices[scene.faces[idx].y],
            p2: scene.vertices[scene.faces[idx].z],
            color: scene.face_colors[idx]
        }
        
        if (triangle.p0.z < z_near && triangle.p1.z < z_near && triangle.p2.z < z_near) {
            let pcs = hlp.camToProjectCam(triangle);
            let ss = hlp.projectCamToScreen(width, height, s, pcs);
            let bb = hlp.computeBoundingBox(width, height, ss);

            for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
                for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                    let color_sum = new Color(0, 0, 0);
                    for (let j = 0; j < 1; j += frac * 2) {
                        for (let i = 0; i < 1; i += frac * 2) {
                            let px_cntr = new Vec2(x + i + frac, y + j + frac);
                            if (hlp.withinBounds(ss, px_cntr)) {
                                let Z = hlp.interpolateZ(triangle, ss, px_cntr);
                                let subpx_idx = j * supersample + i * ss_dim;
                                if (Z < z_buf.get(x, y, subpx_idx)) {
                                    z_buf.set(x, y, subpx_idx, Z);
                                    color_sum.addTo(triangle.color);
                                } else {
                                    color_sum.addTo(img.get(x,y));
                                }
                            } else {
                                color_sum.addTo(img.get(x, y));
                            }
                        }
                    }
                    let color_avg = color_sum.divide(supersample)
                    color_avg.a = 255;
                    img.put(x, y, color_avg);
                }
            }
        }
    }
    ctx.putImageData(img.img, 0, 0);
}

function draw3(supersample, scene) {
    let scn = prs.parseScene(scene);

    let width = scn.camera.resolution.x;
    let height = scn.camera.resolution.y;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    const ctx = canvas.getContext("2d");
    const img = new Image3(ctx, canvas.width, canvas.height);

    let s = scn.camera.s;            // scaling factor of view frustrum
    let z_near = scn.camera.z_near;  // near clipping plane

    let ss_dim = Math.sqrt(supersample);
    let frac = (1 / ss_dim) / 2;

    const z_buf = new ZBuffer(width, height, supersample);
    img.zeroes();

    let vertices = scn.mesh.vertices
    let faces = scn.mesh.faces;
    let v_colors = scn.mesh.vertex_colors;
    for (let idx = 0; idx < faces.length; idx++) {
        let triangle = {
            p0: vertices[faces[idx].x],
            p1: vertices[faces[idx].y],
            p2: vertices[faces[idx].z],
        }
        let triangle_colors = {
            p0: v_colors[faces[idx].x],
            p1: v_colors[faces[idx].y],
            p2: v_colors[faces[idx].z],           
        }

        let cam_to_world = scn.camera.cam_to_world;
        let model_matrix = scn.mesh.model_matrix;

        let p0_w = model_matrix.multiplyV4(new Vec4(triangle.p0.x, triangle.p0.y, triangle.p0.z, 1));
        let p1_w = model_matrix.multiplyV4(new Vec4(triangle.p1.x, triangle.p1.y, triangle.p1.z, 1));
        let p2_w = model_matrix.multiplyV4(new Vec4(triangle.p2.x, triangle.p2.y, triangle.p2.z, 1));

        let p0_c = cam_to_world.inverse().multiplyV4(p0_w);
        let p1_c = cam_to_world.inverse().multiplyV4(p1_w);
        let p2_c = cam_to_world.inverse().multiplyV4(p2_w);
        let cameraspace_triangle = {
            p0: p0_c,
            p1: p1_c,
            p2: p2_c
        };
        
        if (p0_c.z < z_near && p1_c.z < z_near && p2_c.z < z_near) {
            let pcs = hlp.camToProjectCam(cameraspace_triangle);
            let ss = hlp.projectCamToScreen(width, height, s, pcs);
            let bb = hlp.computeBoundingBox(width, height, ss);

            for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
                for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                    let color_sum = new Color(0, 0, 0);
                    for (let j = 0; j < 1; j += frac * 2) {
                        for (let i = 0; i < 1; i += frac * 2) {
                            let px_cntr = new Vec2(x + i + frac, y + j + frac);
                            if (hlp.withinBounds(ss, px_cntr)) {
                                let {Z, color} = hlp.interpolatePoint(cameraspace_triangle, triangle_colors, ss, px_cntr);
                                let subpx_idx = j * supersample + i * ss_dim;
                                
                                if (Z < z_buf.get(x, y, subpx_idx)) {
                                    z_buf.set(x, y, subpx_idx, Z);
                                    color_sum.addTo(color);
                                } else {
                                    color_sum.addTo(img.get(x,y));
                                }
                            } else {
                                color_sum.addTo(img.get(x, y));
                            }
                        }
                    }
                    let color_avg = color_sum.divide(supersample)
                    color_avg.a = 255;
                    img.put(x, y, color_avg);
                }
            }
        }
    }
    ctx.putImageData(img.img, 0, 0);
}


function run(draw, supersample, scene) {
    let start = performance.now();
    switch (draw) {
        case 1: 
            draw1(supersample, triangles[scene]);
            break;
        case 2:
            draw2(supersample, cube);
            break;
        case 3:
            draw3(supersample, scenes[scene]);
            break;
    }
    const end = performance.now();
    console.log(`draw(${draw}) took ${end - start} ms`);
}


run(3, 1, 3);