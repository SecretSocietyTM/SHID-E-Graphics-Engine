import SE from "../se/se.js";
import sem from "../util/sem.js";

import scenes from "../scenes/draw3scenes.js";
import * as prs from "../util/parser.js";

const fps_span = document.getElementById("fps");

// TODO: similar to GLWindow, add some function to SE that 
// creates a canvas element and just puts it in some target container
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//  TODO: add some UI for setting these on the fly
// global init variables 
let scn = prs.parseScene(scenes[3]);
canvas.setAttribute("width", scn.camera.resolution.x);
canvas.setAttribute("height", scn.camera.resolution.y);



let se = new SE(ctx);
se.setScene(scn);

const second = 1000;

let stop_render = false;
let angle = 0;
let sign = 1;
let x = 0;
let y = 1;
let z = 0;


let view = se.getViewMatrix();

document.addEventListener("keydown", (e) => { 
    if (e.key === "Escape") stop_render = true;
    else if (e.key === "Enter") {
        stop_render = false;
        renderLoop();
    } else if (e.key === " ") {
        if (sign === -1) sign = 1;
        else sign = -1;

    // rotation axis keys
    } else if (e.key === "x") {
        x = 1;
        y = 0;
        z = 0;
    } else if (e.key === "y") {
        x = 0;
        y = 1;
        z = 0;
    } else if (e.key === "z") {
        x = 0;
        y = 0;
        z = 1;
    } 
    
    // object movement keys
    else if (e.key === "a") {
        view = sem.translate(view, new sem.Vec3(0.01, 0, 0));
    } else if (e.key === "d") {
        view = sem.translate(view, new sem.Vec3(-0.01, 0, 0));
    } else if (e.key === "w") {
        view = sem.translate(view, new sem.Vec3(0, -0.01, 0));
    } else if (e.key === "s") {
        view = sem.translate(view, new sem.Vec3(0, 0.01, 0));
    }
});

let fraction_second = 4;
let render_second = 0;
let frames_rendered = 0;
function renderLoop() {
    if (stop_render) return;

    angle += sign * 0.03;

    let model = sem.Matrix4x4.identity();
   
    model = sem.rotate(model, angle, new sem.Vec3(x, y, z));

    se.setModelMatrix(model);
    se.setViewMatrix(view);


    // 2. Draw the updated scene
    let start = performance.now();
    se.renderMesh3();
    const end = performance.now();
    let render_time = end - start;
    render_second += render_time;
    frames_rendered++;
    /* console.log(`renderTriangles() took ${render_time} ms`); */
    if (render_second > (1000 / fraction_second)) { // 1000 = 1s
        let fps = frames_rendered * fraction_second;
        fps_span.textContent = fps;

        render_second = 0;
        frames_rendered = 0;
    }

    requestAnimationFrame(renderLoop);
}

/* renderLoop(); */





let acc_time = 0;
let count = 0;
function renderTestBench() {
    if (count === 100) {
        console.log(Math.round(acc_time/100));
        return;
    }


    let start = performance.now();
    se.renderMesh3();
    const end = performance.now();
    let render_time = end - start;

    acc_time += render_time;
    count++;

    requestAnimationFrame(renderTestBench);
}

renderTestBench()


// 250 renders
// se.renderMesh1() -> scene[2] = 19ms
// se.renderMesh2() -> scene[2] = 18ms
// se.renderMesh3() -> scene[2] = 18ms

// se.renderMesh1() -> scene[4] = 15ms
// se.renderMesh2() -> scene[4] = 14ms
// se.renderMesh3() -> scene[4] =  8ms

// 100 renders
// se.renderMesh1() -> scene[3] = 149ms
// se.renderMesh2() -> scene[3] = 146ms
// se.renderMesh3() -> scene[3] = 140ms