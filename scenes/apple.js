import apple_ply from "./ply_strings/apple_ply.js";

export default {
    "camera":
    {
        "resolution": [640, 480],
        "transform": 
            {
                "lookat":
                {
                    "position": [2, 2, 2],
                    "target": [0, 0, 0],
                    "up": [0, 1, 0]
                }
            },
        "s": 0.08,
        "z_near": 1e-6
    },
    "background": [
        0.5, 0.5, 0.5
    ],
    "objects": 
        {
            "filename": apple_ply
        }
}
