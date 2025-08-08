import cube_ply from "../ply_strings/cube_ply.js";

export default {
    "camera":
    {
        "resolution": [640, 480],
        "transform": 
            {
                "lookat":
                {
                    "position": [1, 1, 12],
                    "target": [0, 0, 0],
                    "up": [0, 1, 0]
                }
            },
        "s": 0.2,
        "z_near": 1e-6
    },
    "background": [
        0.5, 0.5, 0.5
    ],
    "objects": 
        {
            "filename": cube_ply
        }
}
