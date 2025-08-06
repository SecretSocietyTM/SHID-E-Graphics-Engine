import cube_ply from "./ply_strings/cube_ply.js";

export default {
    "camera":
    {
        "resolution": [640, 480],
        "transform": 
            {
                "lookat":
                {
                    "position": [1, -0.5, 0],
                    "target": [0, 0, -5],
                    "up": [0, 1, 0]
                }
            },
        "s": 0.4,
        "z_near": 1e-6
    },
    "background": [
        0.5, 0.5, 0.5
    ],
    "objects": 
        {
            "filename": cube_ply,
            "transform":  {
                "rotate": [10, -1, -1, 1],
                "scale": [0.9, 1.1, 0.8],
                "translate": [-0.2, -0.2, 0.2]
            }
        }
}
