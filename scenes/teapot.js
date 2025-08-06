import teapot_ply from "./ply_strings/teapot_ply.js";

export default {
    "camera":
    {
        "resolution": [640, 480],
        "transform": 
            {
                "lookat":
                {
                    "position": [150, -150, 32],
                    "target": [0, 0, 32],
                    "up": [0, 0, 1]
                }
            },
        "s": 0.3,
        "z_near": 1e-6
    },
    "background": [
        0.5, 0.5, 0.5
    ],
    "objects": 
        {
            "filename": teapot_ply
        }
}
