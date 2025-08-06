import { Image3 } from "../util/image3.js";
import { Color } from "../util/color.js";
import { vec, Vec2, Vec3, Vec4 } from "../util/vector.js";

let width = 1920;
let height = 1080;

const canvas = document.getElementById("canvas");
canvas.setAttribute("width", width);
canvas.setAttribute("height", height);
const ctx = canvas.getContext("2d");
const img = new Image3(ctx, canvas.width, canvas.height);



function draw1() {
    let circle = {
        center: new Vec2(img.width / 2 + 0.5, img.height / 2 + 0.5),
        radius: 100,
        color: {r: 245, g: 40, b: 145, a: 255}
    }

    const bg_color = {r: 184, g: 184, b: 184, a: 255};

    for (let y = 0; y < img.height; y++) {
        let pcy = y + 0.5;
        for (let x = 0; x < img.width; x++) {
            let pcx = x + 0.5;
            let px_cntr = new Vec2(pcx, pcy);

            let pq = px_cntr.sub(circle.center);

            if (vec.length(pq) < circle.radius) {
                img.put(x, y, circle.color);
            } else img.put(x, y, bg_color);
        }
    }
    ctx.putImageData(img.img, 0, 0);
}


function draw2() {
    let scene = [
        {
        center: new Vec2(img.width / 2 + 0.5, img.height / 2 + 0.5),
        radius: 150,
        color: {r: 245, g: 40, b: 145, a: 255}            
        },
        {
        center: new Vec2(img.width / 4 + 0.5, img.height / 2 + 0.5),
        radius: 25,
        color: {r: 60, g: 200, b: 255, a: 255}            
        },
        {
        center: new Vec2(img.width / 3  + 0.5, img.height / 2 + 0.5),
        radius: 25,
        color: {r: 180, g: 250, b: 140, a: 255}            
        }        
    ];
    
    const bg_color = {r: 184, g: 184, b: 184, a: 255};

    let layer = 0;
    for (const circle of scene) {
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                let px_cntr = new Vec2(x + 0.5, y + 0.5);
                let pq = px_cntr.sub(circle.center);

                if (vec.length(pq) < circle.radius) {
                    img.put(x, y, circle.color);
                } else {
                    if (layer > 0) continue;
                    img.put(x, y, bg_color);
                }
            }
        }
        layer++;
    }
    ctx.putImageData(img.img, 0, 0);
}

function draw3(supersample, optimize = false) {
    if (Math.sqrt(supersample) % 1 != 0) throw new Error("Supersample must be power of 2");
    ;

    let scene = [
        {
        center: new Vec2(img.width / 2 + 0.5, img.height / 2 + 0.5),
        radius: 150,
        color: new Color(245, 40, 145, 1),
        },
        {
        center: new Vec2(img.width / 4 + 0.5, img.height / 2 + 0.5),
        radius: 25,
        color: new Color(60, 200, 255),
        },
        {
        center: new Vec2(img.width / 3  + 0.5, img.height / 2 + 0.5),
        radius: 25,
        color: new Color(180, 250, 140),
        }        
    ];
    
    const bg_color = new Color(184);

    let layer = 0;
    let frac = (1 / Math.sqrt(supersample)) / 2;


    if (optimize) {
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                let color_sum = new Color(0, 0, 0);
                for (let j = 0; j < 1; j += frac * 2) {
                    for (let i = 0; i < 1; i += frac * 2) {
                        let px = new Vec2(x + i + frac, y + j + frac);
                        let pixel_color = bg_color;

                        for (let k = scene.length-1; k > 0 - 1; k--) {
                            let circle = scene[k];
                            if (vec.length(px.sub(circle.center)) < circle.radius) {
                                pixel_color = circle.color;
                                break;
                            }
                        }
                        color_sum.addTo(pixel_color);
                    }
                }
                let color_avg = color_sum.divide(supersample);
                color_avg.a = 255;
                img.put(x, y, color_avg);
            }
        }
    } else {
        for (const circle of scene) {
            for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                    let color_sum = new Color(0, 0, 0);
                    for (let j = 0; j < 1; j += frac * 2) {
                        for (let i = 0; i < 1; i += frac * 2) {
                            let px_cntr = new Vec2(x + i + frac, y + j + frac);
                            let pq = px_cntr.sub(circle.center);

                            if (vec.length(pq) < circle.radius) {
                                color_sum.addTo(circle.color);
                            } else {
                                if (layer > 0) {
                                    let cur_color = img.get(x, y);
                                    color_sum.addTo(cur_color);
                                } else color_sum.addTo(bg_color);
                            }
                        }
                    }
                    let color_avg = color_sum.divide(supersample)
                    color_avg.a = 255;
                    img.put(x, y, color_avg)
                }
            }
            layer++;
        }
    }

    ctx.putImageData(img.img, 0, 0);
}

/* const  start = performance.now();
draw1();
const end = performance.now();
console.log(`draw1() took ${end - start} ms`); */

/* const  start = performance.now();
draw2();
const end = performance.now();
console.log(`draw2() took ${end - start} ms`); */

const  start = performance.now();
draw3(1, true);
const end = performance.now();
console.log(`draw3() took ${end - start} ms`);