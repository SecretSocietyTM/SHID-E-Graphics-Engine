import { vec, Vec2, Vec3, Vec4 } from "./vector.js";
import { Matrix3x3, Matrix4x4 } from "../util/matrix.js";

export function withinBounds(triangle, p) {
    let p0 = triangle.p0;
    let p1 = triangle.p1;
    let p2 = triangle.p2;

    let pos_cnt = 0;
    let neg_cnt = 0;

    let p0p1 = p1.sub(p0);
    let p1p2 = p2.sub(p1);
    let p2p0 = p0.sub(p2);

    let n01 = new Vec2(p0p1.y, -p0p1.x);
    let n12 = new Vec2(p1p2.y, -p1p2.x);
    let n20 = new Vec2(p2p0.y, -p2p0.x);

    vec.dotV2(p.sub(p0), n01) > 0 ? pos_cnt++ : neg_cnt++;
    vec.dotV2(p.sub(p1), n12) > 0 ? pos_cnt++ : neg_cnt++;
    vec.dotV2(p.sub(p2), n20) > 0 ? pos_cnt++ : neg_cnt++;

    let in_bounds = (pos_cnt === 3) || neg_cnt === 3 ? true : false;
    return in_bounds;
}

// makes use of precomputed edge functions that return A, B and C 
// to check 
export function withinBoundsEdgeFunction(edges, p) {
    let pos_cnt = 0;
    let neg_cnt = 0;
    for (const edge of edges) {
        if (edge.a * p.x + edge.b * p.y + edge.c >= 0) {
            pos_cnt++;
        } else {
            neg_cnt++;
        }
    }
    return (pos_cnt === 3 || neg_cnt === 3) ? true : false;
}

export function computeEdgeFunction(p0, p1) {
    let a = p0.y - p1.y;
    let b = p1.x - p0.x;
    let c = p0.x * p1.y - p1.x * p0.y;
    return {a, b, c};
} 














export function computeBoundingBox(triangle, w, h) {
    let p0 = triangle.p0;
    let p1 = triangle.p1;
    let p2 = triangle.p2;

    let x_coords = [p0.x, p1.x, p2.x];
    let y_coords = [p0.y, p1.y, p2.y];

    let x_min = x_coords[0];
    let x_max = x_coords[0];
    let y_min = y_coords[0];
    let y_max = y_coords[0];

    for (let i = 0; i < 3; i++) {
        if (x_coords[i] < x_min) x_min = x_coords[i];
        if (x_coords[i] > x_max) x_max = x_coords[i];
        if (y_coords[i] < y_min) y_min = y_coords[i];
        if (y_coords[i] > y_max) y_max = y_coords[i];
    }

    x_min = (x_min < 0) ? 0 : x_min;
    x_max = (x_max > w) ? w : x_max;
    y_min = (y_min < 0) ? 0 : y_min;
    y_max = (y_max > h) ? h : y_max;

    let top_left = new Vec2(Math.round(x_min), Math.round(y_min));
    let bot_right = new Vec2(Math.round(x_max), Math.round(y_max));

    return {top_left, bot_right};
}

export function camToProjectCam(triangle) {
    let p0 = new Vec2(-(triangle.p0.x / triangle.p0.z), -(triangle.p0.y / triangle.p0.z));
    let p1 = new Vec2(-(triangle.p1.x / triangle.p1.z), -(triangle.p1.y / triangle.p1.z));
    let p2 = new Vec2(-(triangle.p2.x / triangle.p2.z), -(triangle.p2.y / triangle.p2.z));
    return {p0, p1, p2};
}

export function projectCamToScreen(w, h, s, pcs) {
    let a = w / h;
    let p0 = new Vec2((
        w * (pcs.p0.x + s*a) / (2*s*a)), 
        h * (pcs.p0.y - s) / -(2*s)
    );
    let p1 = new Vec2((
        w * (pcs.p1.x + s*a) / (2*s*a)), 
        h * (pcs.p1.y - s) / -(2*s)
    );
    let p2 = new Vec2((
        w * (pcs.p2.x + s*a) / (2*s*a)), 
        h * (pcs.p2.y - s) / -(2*s)
    );
    return {p0, p1, p2};
}

export function perspective(triangle, w, h, s) {
    let pcs_p0 = new Vec2(-(triangle.p0.x / triangle.p0.z), -(triangle.p0.y / triangle.p0.z));
    let pcs_p1 = new Vec2(-(triangle.p1.x / triangle.p1.z), -(triangle.p1.y / triangle.p1.z));
    let pcs_p2 = new Vec2(-(triangle.p2.x / triangle.p2.z), -(triangle.p2.y / triangle.p2.z));
    
    let a = w / h;
    let p0 = new Vec2((
        w * (pcs_p0.x + s*a) / (2*s*a)), 
        h * (pcs_p0.y - s) / -(2*s)
    );
    let p1 = new Vec2((
        w * (pcs_p1.x + s*a) / (2*s*a)), 
        h * (pcs_p1.y - s) / -(2*s)
    );
    let p2 = new Vec2((
        w * (pcs_p2.x + s*a) / (2*s*a)), 
        h * (pcs_p2.y - s) / -(2*s)
    );
    return {p0, p1, p2};
}


export function modelToWorld(triangle, model) {
    let p0 = model.multiplyV4(new Vec4(triangle.p0.x, triangle.p0.y, triangle.p0.z, 1));
    let p1 = model.multiplyV4(new Vec4(triangle.p1.x, triangle.p1.y, triangle.p1.z, 1));
    let p2 = model.multiplyV4(new Vec4(triangle.p2.x, triangle.p2.y, triangle.p2.z, 1));    

    return {p0, p1, p2};
}

export function worldToCam(triangle, cam_to_world) {
    let p0 = cam_to_world.inverse().multiplyV4(triangle.p0);
    let p1 = cam_to_world.inverse().multiplyV4(triangle.p1);
    let p2 = cam_to_world.inverse().multiplyV4(triangle.p2);

    return {p0, p1, p2};
}




export function areaOfTriangle(triangle) {
    const p0 = new Vec3(triangle.p0.x, triangle.p0.y, 0);
    const p1 = new Vec3(triangle.p1.x, triangle.p1.y, 0);
    const p2 = new Vec3(triangle.p2.x, triangle.p2.y, 0);

    const v = p1.sub(p0);
    const w = p2.sub(p0);

    const cross = vec.cross(v, w);

    return 0.5 * vec.length(cross);
}

export function computeBaryPrime(triangle, px_cntr) {
    let area = areaOfTriangle(triangle);
    let b0_p = areaOfTriangle({p0: px_cntr, p1: triangle.p1, p2: triangle.p2}) / area;
    let b1_p = areaOfTriangle({p0: triangle.p0, p1: px_cntr, p2: triangle.p2}) / area;
    let b2_p = areaOfTriangle({p0: triangle.p0, p1: triangle.p1, p2: px_cntr}) / area;
    
    return {b0_p, b1_p, b2_p};
}

export function computeBary(triangle, {b0_p, b1_p, b2_p}) {
    let denominator = b0_p / triangle.p0.z + 
                      b1_p / triangle.p1.z + 
                      b2_p / triangle.p2.z

    let b0 = (b0_p / triangle.p0.z) / denominator;
    let b1 = (b1_p / triangle.p1.z) / denominator;
    let b2 = (b2_p / triangle.p2.z) / denominator;
    return {b0, b1, b2};
}

export function interpolateZ(triangle, ss_triangle, px_cntr) {
    let bary_p = computeBaryPrime(ss_triangle, px_cntr);
    let {b0, b1, b2} = computeBary(triangle, bary_p);
    
    let Z = Math.abs(b0 * triangle.p0.z + b1 * triangle.p1.z + b2 * triangle.p2.z);
    return Z;
}



export function interpolatePoint(triangle, triangle_colors, ss_triangle, px_cntr) {
    let bary_p = computeBaryPrime(ss_triangle, px_cntr);
    let {b0, b1, b2} = computeBary(triangle, bary_p);
    
    let Z = Math.abs(b0 * triangle.p0.z + b1 * triangle.p1.z + b2 * triangle.p2.z);
    let color = computeInterpolatedColor(triangle_colors, b0, b1, b2);
    return {Z, color};
}

function computeInterpolatedColor(colors, b0, b1, b2) {
    let c1 = colors.p0.multiply(b0);
    let c2 = colors.p1.multiply(b1);
    let c3 = colors.p2.multiply(b2);

    let color = c1.add(c2);
    color.addTo(c3);

    return color;
}
