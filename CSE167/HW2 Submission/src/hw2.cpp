#include "hw2.h"
#include "hw2_scenes.h"
#include <limits>
#include <cmath>

using namespace hw2;


bool withinBounds(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 px_cntr);
Vector2 project_camera_to_screen(int w, int h, Real s, Vector2 v);
Real area(Vector2 v0, Vector2 v1, Vector2 v2);


Image3 hw_2_1(const std::vector<std::string> &params) {
    // Homework 2.1: render a single 3D triangle

    Image3 img(640 /* width */, 480 /* height */);

    Vector3 p0{0, 0, -1};
    Vector3 p1{1, 0, -1};
    Vector3 p2{0, 1, -1};
    Real s = 1; // scaling factor of the view frustrum
    Vector3 color = Vector3{1.0, 0.5, 0.5};
    Real z_near = 1e-6; // distance of the near clipping plane
    for (int i = 0; i < (int)params.size(); i++) {
        if (params[i] == "-s") {
            s = std::stof(params[++i]);
        } else if (params[i] == "-p0") {
            p0.x = std::stof(params[++i]);
            p0.y = std::stof(params[++i]);
            p0.z = std::stof(params[++i]);
        } else if (params[i] == "-p1") {
            p1.x = std::stof(params[++i]);
            p1.y = std::stof(params[++i]);
            p1.z = std::stof(params[++i]);
        } else if (params[i] == "-p2") {
            p2.x = std::stof(params[++i]);
            p2.y = std::stof(params[++i]);
            p2.z = std::stof(params[++i]);
        } else if (params[i] == "-color") {
            Real r = std::stof(params[++i]);
            Real g = std::stof(params[++i]);
            Real b = std::stof(params[++i]);
            color = Vector3{r, g, b};
        } else if (params[i] == "-znear") {
            z_near = std::stof(params[++i]);
        }
    }

    Vector3 background_color = Vector3{0.5, 0.5, 0.5};

    // 1) Determine if vertices' z values are ALL less than the clipping plane (0)
    if (p0.z < z_near && p1.z < z_near && p2.z < z_near) {

    // 2) Convert "camera space" vertices to "projected camera space"
    // variable name: pointNumber_cameraspace
        Vector2 p0_pcs = Vector2{-(p0.x/p0.z), -(p0.y/p0.z)};
        Vector2 p1_pcs = Vector2{-(p1.x/p1.z), -(p1.y/p1.z)};
        Vector2 p2_pcs = Vector2{-(p2.x/p2.z), -(p2.y/p2.z)};

    // 3) Convert "projected camera space" points to "screen space points" using aspect ratio (a) and vertical fov (s)
        Vector2 p0_ss = project_camera_to_screen(img.width, img.height, s, p0_pcs);
        Vector2 p1_ss = project_camera_to_screen(img.width, img.height, s, p1_pcs);
        Vector2 p2_ss = project_camera_to_screen(img.width, img.height, s, p2_pcs);

    // 4) compute if pixel is in triangle 
        for (int y = 0; y < img.height; y++) {
            for (int x = 0; x < img.width; x++) {
                Vector3 color_sum = Vector3{0, 0, 0};
                for (Real j = 0; j < 1; j+=0.25) {
                    Real pcy = y + j + 0.125;
                    for (Real i = 0; i < 1; i+=0.25) {
                        Real pcx = x + i + 0.125;

                        Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                        // NOTE: could add boundry box to triangle
                        if (withinBounds(p0_ss, p1_ss, p2_ss, px_cntr)) {
                            color_sum += color;
                        } else color_sum += background_color;
                    }
                }
                img(x, y) = color_sum / Real (16);
            }
        }
    } // end of near clipping plane check 
    else { // one of the points falls behind the camera z > z_near
        for (int y = 0; y < img.height; y++) {
            for (int x = 0; x < img.width; x++) {
                img(x, y) = background_color;
            }
        }
    } 
    return img;
}

Image3 hw_2_2(const std::vector<std::string> &params) {
    // Homework 2.2: render a triangle mesh

    Image3 img(640 /* width */, 480 /* height */);

    Real s = 1; // scaling factor of the view frustrum
    Real z_near = 1e-6; // distance of the near clipping plane
    int scene_id = 0;
    for (int i = 0; i < (int)params.size(); i++) {
        if (params[i] == "-s") {
            s = std::stof(params[++i]);
        } else if (params[i] == "-znear") {
            z_near = std::stof(params[++i]);
        } else if (params[i] == "-scene_id") {
            scene_id = std::stoi(params[++i]);
        }
    }
    // silence warnings, feel free to remove these
    UNUSED(s); 
    UNUSED(z_near);
    UNUSED(scene_id);

    TriangleMesh mesh = meshes[scene_id];
    UNUSED(mesh); // silence warning, feel free to remove this

    Vector3 background_color = Vector3{0.5, 0.5, 0.5};

    // 3D vector for each pixel and its subpixels. To access subpixel at top left of pixel at (10,10) do
    // z_buffer[9][9][0]
    std::vector<std::vector<std::vector<Real>>> z_buffer(img.height, 
                std::vector<std::vector<Real>>(img.width, 
                             std::vector<Real>(16, std::numeric_limits<double>::infinity())));

    std::vector<std::vector<std::vector<Vector3>>> subpixel_color(img.height, 
                std::vector<std::vector<Vector3>>(img.width, 
                             std::vector<Vector3>(16, Vector3{0,0,0})));

    int layer = 0;
    int clipped_face_count = 0;
    // iterate through each face in the mesh
    for (int idx = 0; idx < mesh.faces.size(); idx++) {
        Vector3 p0 = mesh.vertices[mesh.faces[idx].x];
        Vector3 p1 = mesh.vertices[mesh.faces[idx].y];
        Vector3 p2 = mesh.vertices[mesh.faces[idx].z];
        Vector3 color = mesh.face_colors[idx];

        // if one of the z vals is behind the camera point, ignore it
        if (-p0.z < z_near || -p1.z < z_near || -p2.z < z_near) {
            clipped_face_count++;
            if (clipped_face_count == mesh.faces.size()) {
                for (int y = 0; y < img.height; y++) {
                    for (int x = 0; x < img.width; x++) {
                        img(x, y) = background_color;
                    }
                }                
            }
            continue;
        // all 
        } else {
            // camera space to projected camera space
            Vector2 p0_pcs = Vector2{-(p0.x/p0.z), -(p0.y/p0.z)};
            Vector2 p1_pcs = Vector2{-(p1.x/p1.z), -(p1.y/p1.z)};
            Vector2 p2_pcs = Vector2{-(p2.x/p2.z), -(p2.y/p2.z)};
            // projected camera space to screen space
            Vector2 p0_ss = project_camera_to_screen(img.width, img.height, s, p0_pcs);
            Vector2 p1_ss = project_camera_to_screen(img.width, img.height, s, p1_pcs);
            Vector2 p2_ss = project_camera_to_screen(img.width, img.height, s, p2_pcs);

            for (int y = 0; y < img.height; y++) {
                for (int x = 0; x < img.width; x++) {
                    Vector3 color_sum = Vector3{0, 0, 0};
                    for (Real j = 0; j < 1; j+=0.25) {
                        Real pcy = y + j + 0.125;
                        for (Real i = 0; i < 1; i+=0.25) {
                            Real pcx = x + i + 0.125;

                            // multiply j*4*4 to get correct "row" in subpixel, + i*4 to get correct column.
                            int subpixel_index = static_cast<int>(j*4) * 4 + static_cast<int>(i*4);

                            Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                            // compute projected barycentric coordinates b0', b1', b2' with EQ5 (area equations)
                            Real area_denominator = area(p0_ss, p1_ss, p2_ss);
                            Real b0_p = area(px_cntr, p1_ss, p2_ss) / area_denominator;
                            Real b1_p = area(p0_ss, px_cntr, p2_ss) / area_denominator;
                            Real b2_p = area(p0_ss, p1_ss, px_cntr) / area_denominator;

                            // compute regular barycentric coordinates b0, b1, b2 using b0', b1', b2' using EQ14
                            Real denominator = b0_p / p0.z + b1_p / p1.z + b2_p / p2.z;
                            Real b0 = (b0_p / p0.z) / denominator;
                            Real b1 = (b1_p / p1.z) / denominator;
                            Real b2 = (b2_p / p2.z) / denominator;

                            // compute the z_depth of the current subpixel using EQ15
                            Real z_depth = std::abs(b0 * p0.z + b1 * p1.z + b2 * p2.z);

                            if (withinBounds(p0_ss, p1_ss, p2_ss, px_cntr) && z_depth < z_buffer[y][x][subpixel_index]) {
                                z_buffer[y][x][subpixel_index] = z_depth;
                                subpixel_color[y][x][subpixel_index] = color;
                            } else {
                                if (layer > 0) {
                                    continue;
                                } else subpixel_color[y][x][subpixel_index] = background_color;
                            }
                        }
                    }
                    for (int w = 0; w < 16; w++) {
                        color_sum += subpixel_color[y][x][w];
                    }
                    img(x, y) = color_sum / Real(16);
                }
            }
        }
        layer++;
    } 
    return img;
}

Image3 hw_2_3(const std::vector<std::string> &params) {
    // Homework 2.3: render a triangle mesh with vertex colors

    Image3 img(640 /* width */, 480 /* height */);

    Real s = 1; // scaling factor of the view frustrum
    Real z_near = 1e-6; // distance of the near clipping plane
    int scene_id = 0;
    for (int i = 0; i < (int)params.size(); i++) {
        if (params[i] == "-s") {
            s = std::stof(params[++i]);
        } else if (params[i] == "-znear") {
            z_near = std::stof(params[++i]);
        } else if (params[i] == "-scene_id") {
            scene_id = std::stoi(params[++i]);
        }
    }
    // silence warnings, feel free to remove these
    UNUSED(s); 
    UNUSED(z_near);
    UNUSED(scene_id);

    TriangleMesh mesh = meshes[scene_id];
    UNUSED(mesh); // silence warning, feel free to remove this

    Vector3 background_color = Vector3{0.5, 0.5, 0.5};

    // 3D vector for each pixel and its subpixels. To access subpixel at top left of pixel at (10,10) do
    // z_buffer[9][9][0]
    std::vector<std::vector<std::vector<Real>>> z_buffer(img.height, 
                std::vector<std::vector<Real>>(img.width, 
                             std::vector<Real>(16, std::numeric_limits<double>::infinity())));

    std::vector<std::vector<std::vector<Vector3>>> subpixel_color(img.height, 
                std::vector<std::vector<Vector3>>(img.width, 
                             std::vector<Vector3>(16, Vector3{0,0,0})));

    int layer = 0;
    int clipped_face_count = 0;
    // iterate through each face in the mesh
    for (int idx = 0; idx < mesh.faces.size(); idx++) {
        Vector3 p0 = mesh.vertices[mesh.faces[idx].x];
        Vector3 p1 = mesh.vertices[mesh.faces[idx].y];
        Vector3 p2 = mesh.vertices[mesh.faces[idx].z];
        Vector3 p0_color = mesh.vertex_colors[mesh.faces[idx].x];
        Vector3 p1_color = mesh.vertex_colors[mesh.faces[idx].y];
        Vector3 p2_color = mesh.vertex_colors[mesh.faces[idx].z];

        // if one of the z vals is behind the camera point, ignore it
        if (-p0.z < z_near || -p1.z < z_near || -p2.z < z_near) {
            clipped_face_count++;
            if (clipped_face_count == mesh.faces.size()) {
                for (int y = 0; y < img.height; y++) {
                    for (int x = 0; x < img.width; x++) {
                        img(x, y) = background_color;
                    }
                }                
            }
            continue;
        // all 
        } else {
            // camera space to projected camera space
            Vector2 p0_pcs = Vector2{-(p0.x/p0.z), -(p0.y/p0.z)};
            Vector2 p1_pcs = Vector2{-(p1.x/p1.z), -(p1.y/p1.z)};
            Vector2 p2_pcs = Vector2{-(p2.x/p2.z), -(p2.y/p2.z)};
            // projected camera space to screen space
            Vector2 p0_ss = project_camera_to_screen(img.width, img.height, s, p0_pcs);
            Vector2 p1_ss = project_camera_to_screen(img.width, img.height, s, p1_pcs);
            Vector2 p2_ss = project_camera_to_screen(img.width, img.height, s, p2_pcs);

            for (int y = 0; y < img.height; y++) {
                for (int x = 0; x < img.width; x++) {
                    Vector3 color_sum = Vector3{0, 0, 0};
                    for (Real j = 0; j < 1; j+=0.25) {
                        Real pcy = y + j + 0.125;
                        for (Real i = 0; i < 1; i+=0.25) {
                            Real pcx = x + i + 0.125;

                            // multiply j*4*4 to get correct "row" in subpixel, + i*4 to get correct column.
                            int subpixel_index = static_cast<int>(j*4) * 4 + static_cast<int>(i*4);

                            Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                            // compute projected barycentric coordinates b0', b1', b2' with EQ5 (area equations)
                            Real area_denominator = area(p0_ss, p1_ss, p2_ss);
                            Real b0_p = area(px_cntr, p1_ss, p2_ss) / area_denominator;
                            Real b1_p = area(p0_ss, px_cntr, p2_ss) / area_denominator;
                            Real b2_p = area(p0_ss, p1_ss, px_cntr) / area_denominator;

                            // compute regular barycentric coordinates b0, b1, b2 using b0', b1', b2' using EQ14
                            Real denominator = b0_p / p0.z + b1_p / p1.z + b2_p / p2.z;
                            Real b0 = (b0_p / p0.z) / denominator;
                            Real b1 = (b1_p / p1.z) / denominator;
                            Real b2 = (b2_p / p2.z) / denominator;

                            // compute the z_depth of the current subpixel using EQ15
                            Real z_depth = std::abs(b0 * p0.z + b1 * p1.z + b2 * p2.z);
                            Vector3 color = (b0 * p0_color + b1 * p1_color + b2 * p2_color);

                            if (withinBounds(p0_ss, p1_ss, p2_ss, px_cntr) && z_depth < z_buffer[y][x][subpixel_index]) {
                                z_buffer[y][x][subpixel_index] = z_depth;
                                subpixel_color[y][x][subpixel_index] = color;
                            } else {
                                if (layer > 0) {
                                    continue;
                                } else subpixel_color[y][x][subpixel_index] = background_color;
                            }
                        }
                    }
                    for (int w = 0; w < 16; w++) {
                        color_sum += subpixel_color[y][x][w];
                    }
                    img(x, y) = color_sum / Real(16);
                }
            }
        }
        layer++;
    }
    return img;
}

Image3 hw_2_4(const std::vector<std::string> &params) {
    // Homework 2.4: render a scene with transformation
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; */

    Image3 img(scene.camera.resolution.x,
               scene.camera.resolution.y);

    Vector3 background_color = scene.background;
    Real z_near = scene.camera.z_near;
    Real s = scene.camera.s;

    // 3D vector for each pixel and its subpixels. To access subpixel at top left of pixel at (10,10) do
    // z_buffer[9][9][0]
    std::vector<std::vector<std::vector<Real>>> z_buffer(img.height, 
                std::vector<std::vector<Real>>(img.width, 
                             std::vector<Real>(16, std::numeric_limits<double>::infinity())));

    std::vector<std::vector<std::vector<Vector3>>> subpixel_color(img.height, 
                std::vector<std::vector<Vector3>>(img.width, 
                             std::vector<Vector3>(16, Vector3{0,0,0})));

    int layer = 0;
    int clipped_face_count = 0;

    for (int mesh_idx = 0; mesh_idx < scene.meshes.size(); mesh_idx++) {
        for (int idx = 0; idx < scene.meshes[mesh_idx].faces.size(); idx++) {
            Vector3 p0 = scene.meshes[mesh_idx].vertices[scene.meshes[mesh_idx].faces[idx].x];
            Vector3 p1 = scene.meshes[mesh_idx].vertices[scene.meshes[mesh_idx].faces[idx].y];
            Vector3 p2 = scene.meshes[mesh_idx].vertices[scene.meshes[mesh_idx].faces[idx].z];
            Vector3 p0_color = scene.meshes[mesh_idx].vertex_colors[scene.meshes[mesh_idx].faces[idx].x];
            Vector3 p1_color = scene.meshes[mesh_idx].vertex_colors[scene.meshes[mesh_idx].faces[idx].y];
            Vector3 p2_color = scene.meshes[mesh_idx].vertex_colors[scene.meshes[mesh_idx].faces[idx].z];

            Matrix4x4 model_matrix = scene.meshes[mesh_idx].model_matrix;

            // 1) vertices from object space to world space (model_matrix)
            Vector4 p0_w = model_matrix * Vector4{p0.x, p0.y, p0.z, 1.0};
            Vector4 p1_w = model_matrix * Vector4{p1.x, p1.y, p1.z, 1.0};
            Vector4 p2_w = model_matrix * Vector4{p2.x, p2.y, p2.z, 1.0};

            // 2) vertices from world space to camera space (cam_to_world matrix)
            Vector4 p0_c = (inverse(scene.camera.cam_to_world)) * p0_w;
            Vector4 p1_c = (inverse(scene.camera.cam_to_world)) * p1_w;
            Vector4 p2_c = (inverse(scene.camera.cam_to_world)) * p2_w;

            // if one of the z vals is behind the camera point, ignore its
            if (-p0_c.z < z_near || -p1_c.z < z_near || -p2_c.z < z_near) {
                clipped_face_count++;
                // all faces were clipped, color canvas as background
                if (clipped_face_count == scene.meshes[mesh_idx].faces.size()) {
                    for (int y = 0; y < img.height; y++) {
                        for (int x = 0; x < img.width; x++) {
                            img(x, y) = background_color;
                        }
                    }                
                }
                continue;
            } else {
            // camera space to projected camera space
            Vector2 p0_pc = Vector2{-(p0_c.x/p0_c.z), -(p0_c.y/p0_c.z)};
            Vector2 p1_pc = Vector2{-(p1_c.x/p1_c.z), -(p1_c.y/p1_c.z)};
            Vector2 p2_pc = Vector2{-(p2_c.x/p2_c.z), -(p2_c.y/p2_c.z)};
            // projected camera space to screen space
            Vector2 p0_ss = project_camera_to_screen(img.width, img.height, s, p0_pc);
            Vector2 p1_ss = project_camera_to_screen(img.width, img.height, s, p1_pc);
            Vector2 p2_ss = project_camera_to_screen(img.width, img.height, s, p2_pc);

            for (int y = 0; y < img.height; y++) {
                for (int x = 0; x < img.width; x++) {
                    Vector3 color_sum = Vector3{0, 0, 0};
                    for (Real j = 0; j < 1; j+=0.25) {
                        Real pcy = y + j + 0.125;
                        for (Real i = 0; i < 1; i+=0.25) {
                            Real pcx = x + i + 0.125;

                            // multiply j*4*4 to get correct "row" in subpixel, + i*4 to get correct column.
                            int subpixel_index = static_cast<int>(j*4) * 4 + static_cast<int>(i*4);

                            Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                            // compute projected barycentric coordinates b0', b1', b2' with EQ5 (area equations)
                            Real area_denominator = area(p0_ss, p1_ss, p2_ss);
                            Real b0_p = area(px_cntr, p1_ss, p2_ss) / area_denominator;
                            Real b1_p = area(p0_ss, px_cntr, p2_ss) / area_denominator;
                            Real b2_p = area(p0_ss, p1_ss, px_cntr) / area_denominator;

                            // compute regular barycentric coordinates b0, b1, b2 using b0', b1', b2' using EQ14
                            Real denominator = b0_p / p0_c.z + b1_p / p1_c.z + b2_p / p2_c.z;
                            Real b0 = (b0_p / p0_c.z) / denominator;
                            Real b1 = (b1_p / p1_c.z) / denominator;
                            Real b2 = (b2_p / p2_c.z) / denominator;

                            // compute the z_depth of the current subpixel using EQ15
                            Real z_depth = std::abs(b0 * p0_c.z + b1 * p1_c.z + b2 * p2_c.z);
                            Vector3 color = (b0 * p0_color + b1 * p1_color + b2 * p2_color);

                            if (withinBounds(p0_ss, p1_ss, p2_ss, px_cntr) && z_depth < z_buffer[y][x][subpixel_index]) {
                                z_buffer[y][x][subpixel_index] = z_depth;
                                subpixel_color[y][x][subpixel_index] = color;
                            } else {
                                if (layer > 0) {
                                    continue;
                                } else subpixel_color[y][x][subpixel_index] = background_color;
                            }
                        }
                    }
                    for (int w = 0; w < 16; w++) {
                        color_sum += subpixel_color[y][x][w];
                    }
                    img(x, y) = color_sum / Real(16);
                }
            }
        }
        layer++;
        }
    }
    return img;
}


////////////////////////////////////////////////////////////////
/////////////////////// HELPER FUNCTIONS ///////////////////////
////////////////////////////////////////////////////////////////

// implemented with hw_2_1 in mind, may need to change parameters
bool withinBounds(Vector2 p0, Vector2 p1, Vector2 p2, Vector2 px_cntr) {
        int pos_cnt = 0;  // the number of positive results from the dot product
        int neg_cnt = 0;  // the number of negative results from the dot product

        Vector2 p0p1 = p1 - p0;
        Vector2 p1p2 = p2 - p1;
        Vector2 p2p0 = p0 - p2;

        Vector2 n01 = Vector2{p0p1.y, -p0p1.x};
        Vector2 n12 = Vector2{p1p2.y, -p1p2.x};
        Vector2 n20 = Vector2{p2p0.y, -p2p0.x};
        
        // testing dot product of normals and the vector pq
        if (dot((px_cntr - p0), n01) > 0) {
            pos_cnt++;
        } else neg_cnt++;
        if (dot((px_cntr - p1), n12) > 0) {
            pos_cnt++;
        } else neg_cnt++;
        if (dot((px_cntr - p2), n20) > 0) {
            pos_cnt++;
        } else neg_cnt++;

        if (pos_cnt == 3 || neg_cnt == 3) {
            return true;
        } else return false;
}

Vector2 project_camera_to_screen(int w, int h, Real s, Vector2 v) {
    
    // calculate aspect ratio
    Real a = static_cast<Real>(w) / static_cast<Real>(h);
    Real x = w * (v.x + s * a) / (2 * s * a);
    Real y = h * (v.y - s) / -(2 * s);
    return Vector2{x, y};
}

Real area(Vector2 v0, Vector2 v1, Vector2 v2) {
    Vector3 v0_3 = Vector3{v0.x, v0.y, 0.0};
    Vector3 v1_3 = Vector3{v1.x, v1.y, 0.0};
    Vector3 v2_3 = Vector3{v2.x, v2.y, 0.0};

    return 0.5 * length(cross(v1_3 - v0_3, v2_3 - v0_3));
}