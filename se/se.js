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
constructor(context) {
    this.context = context;

    this.supersample = 1;
    this.supersample_dimensions = Math.sqrt(this.supersample);
    this.frac = (1 / this.supersample_dimensions) / 2;
}

setSupersample(supersample) {
    this.supersample = supersample;
    this.supersample_dimensions = Math.sqrt(this.supersample);

    // would still like to find a more efficient way of computing 
    // zbuffer indices / sub_pixel indices without this frac
    this.frac = (1 / this.supersample_dimensions) / 2;
}

// for use when an entire scene is provided
setScene(scene) {
    this.width = scene.camera.resolution.x;
    this.height = scene.camera.resolution.y;

    this.img = new Image3(this.context, this.width, this.height);
    this.img.zeroes();

    this.s = scene.camera.s;
    this.z_near = scene.camera.z_near;

    this.vertices = scene.mesh.vertices
    this.faces = scene.mesh.faces;
    this.v_colors = scene.mesh.vertex_colors;

    this.model = scene.mesh.model_matrix;
    this.view = scene.camera.cam_to_world;
}


createImg(width, height) {
    this.width = width;
    this.height = height;

    this.img = new Image3(this.context, this.width, this.height);
}

setScalingFactor(s) {
    this.s = s;
}

setZNear(z_near) {
    this.z_near = z_near;
}

setZFar(z_far) {
    this.z_far = z_far;
}

// for use when only a mesh is provided
setMesh(mesh) {
    // ideally add checks here to crash if mesh doesnt have vertices, faces
    // v_colors.

    this.vertices = mesh.vertices
    this.faces = mesh.faces;
    this.v_colors = mesh.vertex_colors;    
}

// TODO: add a way to customize this instead of just zeroing out the bg;
clearColor(r, g, b, a) {
    this.img.zeroes();
}

getViewMatrix() {
    return this.view;
}

// Temp, would prefer to make use of a "vertex shader" for which I could simply use 
// model, view, projection to generate the final "se_position" (like gl_position)
// for now make due with this:

// currently, this isnt actually the view matrix per se, its the cam_to_world, which
// may verywell be the same as a view matrix, but I still need to read more about this
setModelMatrix(model) {
    if (!(model instanceof Matrix4x4)) {
        throw new Error("Arg view is not of type Matrix4x4");
    }
    this.model = model;    
}

// in the OpenGL guide, the view matrix is just an identity matrix translated around
setViewMatrix(view) {
    if (!(view instanceof Matrix4x4)) {
        throw new Error("Arg view is not of type Matrix4x4");
    }
    this.view = view;
}


renderMesh() {
    this.img = new Image3(this.context, this.width, this.height);
    this.clearColor();
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

        let world_tri = hlp.modelToWorld(tri, this.model);
        let cam_tri = hlp.worldToCam(world_tri, this.view);

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

/**
 * RenderMeshOriginal
 * Just a benchmark version of the above function to test against 
 * renderMesh2 without the supersampling mumbojumbo
 */
renderMesh1() {
    this.img = new Image3(this.context, this.width, this.height);
    this.clearColor();
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

        let world_tri = hlp.modelToWorld(tri, this.model);
        let cam_tri = hlp.worldToCam(world_tri, this.view);

        if (cam_tri.p0.z >= this.z_near ||
            cam_tri.p1.z >= this.z_near ||
            cam_tri.p2.z >= this.z_near) {
            continue;
        }

        let screen_tri = hlp.perspective(cam_tri, this.width, this.height, this.s);
        let bb = hlp.computeBoundingBox(screen_tri, this.width, this.height);

        for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
            for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                let px_cntr = new Vec2(x + 0.5, y + 0.5);
                if (hlp.withinBounds(screen_tri, px_cntr)) {
                    let {Z, color} = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, px_cntr);
                    if (Z < z_buf.get(x, y, 1)) {
                        z_buf.set(x, y, 1, Z);
                        color.a = 255;
                        this.img.put(x, y, color);
                    }
                }
            }
        }            
    }
    this.context.putImageData(this.img.img, 0, 0);
}

/**
 * RenderMeshV2
 * This renderer will make use of a different way of computing 
 * whether a point is inside of the triangle using precomputed
 * edge functions: cross(p2-p1, p-p1)
 * 
 * Also removes anti aliasing for now as it doesnt even work properly
 */
renderMesh2() {
    this.img = new Image3(this.context, this.width, this.height);
    this.clearColor();
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

        let world_tri = hlp.modelToWorld(tri, this.model);
        let cam_tri = hlp.worldToCam(world_tri, this.view);

        if (cam_tri.p0.z >= this.z_near ||
            cam_tri.p1.z >= this.z_near ||
            cam_tri.p2.z >= this.z_near) {
            continue;
        }

        let screen_tri = hlp.perspective(cam_tri, this.width, this.height, this.s);
        let bb = hlp.computeBoundingBox(screen_tri, this.width, this.height);

        let edges = [
            hlp.computeEdgeFunction(screen_tri.p0, screen_tri.p1),
            hlp.computeEdgeFunction(screen_tri.p1, screen_tri.p2),
            hlp.computeEdgeFunction(screen_tri.p2, screen_tri.p0)
        ];

        for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
            for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                let px_cntr = new Vec2(x + 0.5, y + 0.5);
                if (hlp.withinBoundsEdgeFunction(edges, px_cntr)) {
                    let {Z, color} = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, px_cntr);
                    if (Z < z_buf.get(x, y, 1)) {
                        z_buf.set(x, y, 1, Z);
                        color.a = 255;
                        this.img.put(x, y, color);
                    }
                }
            }
        }
    }
    this.context.putImageData(this.img.img, 0, 0);
}



/**
 * RenderMeshV3
 * This renderer will make use of a different way of computing 
 * whether a point is inside of the triangle using precomputed
 * edge functions: cross(p2-p1, p-p1), as well as edge stepping
 * 
 */
renderMesh3() {
    this.img = new Image3(this.context, this.width, this.height);
    this.clearColor();
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

        let world_tri = hlp.modelToWorld(tri, this.model);
        let cam_tri = hlp.worldToCam(world_tri, this.view);

        if (cam_tri.p0.z >= this.z_near ||
            cam_tri.p1.z >= this.z_near ||
            cam_tri.p2.z >= this.z_near) {
            continue;
        }

        let screen_tri = hlp.perspective(cam_tri, this.width, this.height, this.s);
        let bb = hlp.computeBoundingBox(screen_tri, this.width, this.height);

        let edges = [
            hlp.computeEdgeFunction(screen_tri.p0, screen_tri.p1),
            hlp.computeEdgeFunction(screen_tri.p1, screen_tri.p2),
            hlp.computeEdgeFunction(screen_tri.p2, screen_tri.p0)
        ];

        for (let y = bb.top_left.y; y < bb.bot_right.y; y++) {
            // Precompute edge function values for the *first pixel in the row*
            let w0_row = edges[0].a * (bb.top_left.x + 0.5) + edges[0].b * (y + 0.5) + edges[0].c;
            let w1_row = edges[1].a * (bb.top_left.x + 0.5) + edges[1].b * (y + 0.5) + edges[1].c;
            let w2_row = edges[2].a * (bb.top_left.x + 0.5) + edges[2].b * (y + 0.5) + edges[2].c;

            // Copy for stepping horizontally
            let w0 = w0_row;
            let w1 = w1_row;
            let w2 = w2_row;

            for (let x = bb.top_left.x; x < bb.bot_right.x; x++) {
                if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) {
                    // Interpolate attributes & depth here
                    let { Z, color } = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, new Vec2(x + 0.5, y + 0.5));
                    if (Z < z_buf.get(x, y, 1)) {
                        z_buf.set(x, y, 1, Z);
                        color.a = 255;
                        this.img.put(x, y, color);
                    }
                }

                // Step right → just add A for each edge
                w0 += edges[0].a;
                w1 += edges[1].a;
                w2 += edges[2].a;
            }

            // Step down → add B for each edge (when row changes)
            w0_row += edges[0].b;
            w1_row += edges[1].b;
            w2_row += edges[2].b;
        }
    }
    this.context.putImageData(this.img.img, 0, 0);
}


/**
 * RenderMeshV4
 * Hoped to increase speed by making use of tiles but the added complexity 
 * just increases render time. Not sure how this would be optimized to not
 * be so damn slow. Also doesn't properly render the images.
 */
renderMesh4() {
    // make glob var
    let tile_size = 8;

    this.img = new Image3(this.context, this.width, this.height);
    this.clearColor();
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

        let world_tri = hlp.modelToWorld(tri, this.model);
        let cam_tri = hlp.worldToCam(world_tri, this.view);

        if (cam_tri.p0.z >= this.z_near ||
            cam_tri.p1.z >= this.z_near ||
            cam_tri.p2.z >= this.z_near) {
            continue;
        }

        let screen_tri = hlp.perspective(cam_tri, this.width, this.height, this.s);

        let tile_min_x = Math.floor(Math.min(screen_tri.p0.x, screen_tri.p1.x, screen_tri.p2.x) / tile_size);
        let tile_min_y = Math.floor(Math.min(screen_tri.p0.y, screen_tri.p1.y, screen_tri.p2.y) / tile_size);
        let tile_max_x = Math.floor(Math.max(screen_tri.p0.x, screen_tri.p1.x, screen_tri.p2.x) / tile_size) + 1;
        let tile_max_y = Math.floor(Math.max(screen_tri.p0.y, screen_tri.p1.y, screen_tri.p2.y) / tile_size) + 1;

        let edges = [
            hlp.computeEdgeFunction(screen_tri.p0, screen_tri.p1),
            hlp.computeEdgeFunction(screen_tri.p1, screen_tri.p2),
            hlp.computeEdgeFunction(screen_tri.p2, screen_tri.p0)
        ];

        for (let y = tile_min_y ; y < tile_max_y; y++) {
            for (let x = tile_min_x; x < tile_max_x; x++) {

                // Tile pixel bounds
                let min_x = x * tile_size;
                let min_y = y * tile_size;
                let max_x = min_x + tile_size 
                let max_y = min_y + tile_size

                // Test coverage at the tile's four corners
                let corners = [
                    {x: min_x, y: min_y},
                    {x: max_x, y: min_y},
                    {x: min_x, y: max_y},
                    {x: max_x, y: max_y}
                ];
                
                let inside_count = 0;

                for (const corner of corners) {
                    if (hlp.withinBoundsEdgeFunction(edges, corner)) {
                        inside_count++;
                    }
                }
                let vertex_inside = hlp.verticesInsideTile(corners, screen_tri);

                let full_cover = false;
                let full_outside = false;
                let partial = false;

                if (inside_count === 4) full_cover = true;
                if (inside_count === 0) full_outside = true;
                if (inside_count > 0 && inside_count < 4 || vertex_inside) partial = true;

                if (full_cover) {
                    for (let _y = min_y; _y < max_y; _y++) {
                        for (let _x = min_x; _x < max_x; _x++) {
                            let { Z, color } = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, new Vec2(_x + 0.5, _y + 0.5));
                            if (Z < z_buf.get(_x, _y, 1)) {
                                z_buf.set(_x, _y, 1, Z);
                                color.a = 255;
                                this.img.put(_x, _y, color);
                            }                            
                        }
                    }                    
                } else if (full_outside && !partial) {
                    continue;
                } else if (partial) {
                    for (let _y = min_y; _y < max_y; _y++) {
                        for (let _x = min_x; _x < max_x; _x++) {
                            let px_cntr = new Vec2(_x + 0.5, _y + 0.5);
                            if (hlp.withinBoundsEdgeFunction(edges, px_cntr)) {
                                let {Z, color} = hlp.interpolatePoint(cam_tri, tri_colors, screen_tri, px_cntr);
                                if (Z < z_buf.get(_x, _y, 1)) {
                                    z_buf.set(_x, _y, 1, Z);
                                    color.a = 255;
                                    this.img.put(_x, _y, color);
                                } 
                            } 
                        }
                    }
                }
            }
        }
        /* this.context.putImageData(this.img.img, 0, 0); */
    }
    this.context.putImageData(this.img.img, 0, 0);
}

}