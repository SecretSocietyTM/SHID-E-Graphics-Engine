#include "hw1.h"
#include "hw1_scenes.h"

using namespace hw1;

std::pair<Vector3, Matrix3x3> extractProperties(Shape &shape);
std::tuple<Vector3, Matrix3x3, Real> extractProperties2(Shape &shape);
bool withinBounds(Shape &shape, Vector2 px_cntr);
std::pair<std::pair<int, int>, std::pair<int, int>> computeBoundingBox(Vector2 c, Real r);

Image3 hw_1_1(const std::vector<std::string> &params) {
    // Homework 1.1: render a circle at the specified
    // position, with the specified radius and color.

    Image3 img(640 /* width */, 480 /* height */);

    Vector2 center = Vector2{img.width / 2 + Real(0.5), img.height / 2 + Real(0.5)};
    Real radius = 100.0;
    Vector3 color = Vector3{1.0, 0.5, 0.5};
    for (int i = 0; i < (int)params.size(); i++) {
        if (params[i] == "-center") {
            Real x = std::stof(params[++i]);
            Real y = std::stof(params[++i]);
            center = Vector2{x, y};
        } else if (params[i] == "-radius") {
            radius = std::stof(params[++i]);
        } else if (params[i] == "-color") {
            Real r = std::stof(params[++i]);
            Real g = std::stof(params[++i]);
            Real b = std::stof(params[++i]);
            color = Vector3{r, g, b};
        }
    }

    for (int y = 0; y < img.height; y++) {
        Real pcy = y + 0.5;                        // pcy = current pixel center y-coordinate
        for (int x = 0; x < img.width; x++) {
            Real pcx = x + 0.5;                    // pcx = current pixel center x-coordinate
            Vector2 px_cntr = Vector2{ pcx, pcy }; // current pixel center coords

            Vector2 pq = px_cntr - center;         // pq = the vector from the circle center to the pixel center

            if (length(pq) < radius) {
                img(x, y) = color;
            }
            else img(x, y) = Vector3{ 0.5, 0.5, 0.5 };
        }
    }
    return img;
}

Image3 hw_1_2(const std::vector<std::string> &params) {
    // Homework 1.2: render multiple circles
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    int scene_id = std::stoi(params[0]);
    const CircleScene &scene = hw1_2_scenes[scene_id];

    Image3 img(scene.resolution.x, scene.resolution.y);

    Vector3 background_color = scene.background;

    int layer = 0;    

    for (int y = 0; y < img.height; y++) {
        for (int x = 0; x < img.width; x++) {\
            img(x, y) = background_color;
        }
    }
    for (auto circle : scene.objects) {
        Vector2 center = circle.center;
        Real radius = circle.radius;
        Vector3 color = circle.color;

        std::pair<std::pair<int, int>, std::pair<int, int>> bb = computeBoundingBox(center, radius);

        /* std::cout << "top_left: (" << bb.first.first << ", " <<  bb.first.second << ") bot_right: (" << bb.second.first << ", " <<  bb.second.second << ")" << std::endl; */
         
        for (int y = bb.first.second; y < bb.second.second; y++) {
            if (y < 0 || y >= scene.resolution.y) continue;
            Real pcy = y + 0.5;
            for (int x = bb.first.first; x < bb.second.first; x++) {
                if (x < 0 || x >= scene.resolution.x) continue;

                Real pcx = x + 0.5;
                Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords
                Vector3 px_clr = img(x, y);          // current pixel color

                Vector2 pq = px_cntr - center;

                if (length(pq) < radius) {
                    img(x, y) = color;
                } else {
                    if (layer > 0) {
                        continue;
                    } else img(x, y) = background_color;
                }
            }
        }
        layer++;
    }       
    return img;
}

Image3 hw_1_3(const std::vector<std::string> &params) {
    // Homework 1.3: render multiple shapes
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; TODO: uncomment */ 

    Image3 img(scene.resolution.x, scene.resolution.y);
    Vector3 background_color = scene.background;

    int layer = 0;

    for (auto &shape : scene.shapes){
        std::pair shape_props = extractProperties(shape);
        Vector3 color = shape_props.first;
     
        for (int y = 0; y < img.height; y++) {
            Real pcy = y + 0.5;
            for (int x = 0; x < img.width; x++) {
                Real pcx = x + 0.5;

                Vector2 px_cntr = Vector2{pcx, pcy};
                Vector3 px_clr = img(x, y);

                if (withinBounds(shape, px_cntr)) {
                    img(x, y) = color;
                } else {
                    if (layer > 0) {
                        continue;
                    } else img(x, y) = background_color;
                }
            }
        }
        layer++;
    }
    return img;
}

Image3 hw_1_4(const std::vector<std::string> &params) {
    // Homework 1.4: render transformed shapes
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; TODO: uncomment */

    Image3 img(scene.resolution.x, scene.resolution.y);
    Vector3 background_color = scene.background;

    int layer = 0;

    for (auto &shape : scene.shapes) {
        std::pair shape_props = extractProperties(shape);
        Vector3 color = shape_props.first;
        Matrix3x3 transform = shape_props.second;

        /* std::cout << "SHAPE TRANS MATRIX: \n" << transform << std::endl; */
        /* std::cout << "INVERSE SHAPE TRAN: \n" << inverse(transform) << std::endl; */

        for (int y = 0; y < img.height; y++) {
            Real pcy = y + 0.5;
            for (int x = 0; x < img.width; x++) {
                Real pcx = x + 0.5;

                Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords
                Vector3 px_clr = img(x, y);          // current pixel color

                // transform px_cntr from screen to object space with inverse F
                Vector3 px_v2_to_v3 = Vector3{px_cntr.x, px_cntr.y, 1.0}; // first convert to Vector3
                Vector3 px_inv_v3 = (inverse(transform)) * px_v2_to_v3;  // then multiply inverse F to get inverse px

                // Derive new pixel location from outcome (simply revert to Vector2)
                Vector2 px_inv_cntr = Vector2{px_inv_v3.x, px_inv_v3.y};
                
                if (withinBounds(shape, px_inv_cntr)) {
                    img(x, y) = color;
                } else {
                    if (layer > 0) {
                        continue;
                    } else img(x, y) = background_color;
                }
            }
        }
        layer++;
    }
    return img;
}

Image3 hw_1_5(const std::vector<std::string> &params) {
    // Homework 1.5: antialiasing
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; */

    Image3 img(scene.resolution.x, scene.resolution.y);
    Vector3 background_color = scene.background;

    int layer = 0;
    Real frac = 0.125; // value to be added to each subpixel coords (top left point) to get center

    for (auto &shape : scene.shapes) {
        std::pair shape_props = extractProperties(shape);
        Vector3 color = shape_props.first;
        Matrix3x3 transform = shape_props.second;

        for (int y = 0; y < img.height; y++) {
            for (int x = 0; x < img.width; x++) {
                Vector3 color_sum = Vector3{0, 0, 0};
                for (Real j = 0; j < 1; j+=0.25) {
                    Real pcy = y + j + 0.125;
                    for (Real i = 0; i < 1; i+=0.25) {
                        Real pcx = x + i + 0.125;

                        Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                        // transform px_cntr from screen to object space with inverse F
                        Vector3 px_v2_to_v3 = Vector3{px_cntr.x, px_cntr.y, 1.0}; // first convert to Vector3
                        Vector3 px_inv_v3 = (inverse(transform)) * px_v2_to_v3;  // then multiply inverse F to get inverse px

                        // Derive new pixel location from outcome (simply revert to Vector2)
                        Vector2 px_inv_cntr = Vector2{px_inv_v3.x, px_inv_v3.y};

                        if (withinBounds(shape, px_inv_cntr)) {
                            color_sum += color;
                        } else {
                            if (layer > 0) {
                                color_sum += img(x, y);
                            } else color_sum += background_color;
                        }
                    }
                }

                Vector3 color_avg = color_sum / Real(16);
                img(x, y) = color_avg;
            }
        }
        layer++;
    }
    return img;
}

Image3 hw_1_6(const std::vector<std::string> &params) {
    // Homework 1.6: alpha blending
    if (params.size() == 0) {
        return Image3(0, 0);
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; */

    Image3 img(scene.resolution.x, scene.resolution.y);
    Vector3 background_color = scene.background;

    int layer = 0;
    Real frac = 0.125; // value to be added to each subpixel coords (top left point) to get center

    for (auto &shape : scene.shapes) {
        std::tuple shape_props = extractProperties2(shape);
        Vector3 color = std::get<0>(shape_props);
        Matrix3x3 transform = std::get<1>(shape_props);
        Real alpha = std::get<2>(shape_props);

/*         std::cout << color << std::endl;
        std::cout << transform << std::endl;
        std::cout << alpha << std::endl; */
        
        for (int y = 0; y < img.height; y++) {
            for (int x = 0; x < img.width; x++) {
                Vector3 color_sum = Vector3{0, 0, 0};
                for (Real j = 0; j < 1; j+=0.25) {
                    Real pcy = y + j + 0.125;
                    for (Real i = 0; i < 1; i+=0.25) {
                        Real pcx = x + i + 0.125;

                        Vector2 px_cntr = Vector2{pcx, pcy}; // current pixel center coords

                        if (withinBounds(shape, px_cntr)) {
                            if (alpha == Real(1)) {
                                color_sum += color;
                            } else {
                                if (layer == 0) {
                                    color_sum += alpha * color + (1 - alpha) * background_color;
                                } else color_sum += alpha * color + (1 - alpha) * img(x, y);
                            }  
                        } else {
                            if (layer > 0) {
                                color_sum += img(x, y);
                            } else color_sum += background_color;
                        }
                    }
                }
                Vector3 color_avg = color_sum / Real(16);
                img(x, y) = color_avg;
            }
        }
        layer++;
    }
    return img;
}




////////////////////////////////////////////////////////////////
/////////////////////// HELPER FUNCTIONS ///////////////////////
////////////////////////////////////////////////////////////////


// function for extracting the color and transform properties of each shape
std::pair<Vector3, Matrix3x3> extractProperties(Shape &shape) {
    if (auto *circle = std::get_if<Circle>(&shape)){
        return std::make_pair(circle->color, circle->transform);
    }
    else if (auto *rectangle = std::get_if<Rectangle>(&shape)) {
        return std::make_pair(rectangle->color, rectangle->transform);
    }
    else if (auto *triangle = std::get_if<Triangle>(&shape)) {
        return std::make_pair(triangle->color, triangle->transform);
    }

    assert(false && "Shape must be Circle, Rectangle, or Triangle");
    return {};
}

std::tuple<Vector3, Matrix3x3, Real> extractProperties2(Shape &shape) {
    if (auto *circle = std::get_if<Circle>(&shape)){
        return std::tuple<Vector3, Matrix3x3, Real> (circle->color, circle->transform, circle->alpha);
    }
    else if (auto *rectangle = std::get_if<Rectangle>(&shape)) {
        return std::tuple<Vector3, Matrix3x3, Real> (rectangle->color, rectangle->transform, rectangle->alpha);
    }
    else if (auto *triangle = std::get_if<Triangle>(&shape)) {
        return std::tuple<Vector3, Matrix3x3, Real> (triangle->color, triangle->transform, triangle->alpha);
    }

    assert(false && "Shape must be Circle, Rectangle, or Triangle");
    return {};
}

// function for testing a pixel's center value and its relation to a shape
bool withinBounds(Shape &shape, Vector2 px_cntr) {
    if (auto *circle = std::get_if<Circle>(&shape)){
        Vector2 center = circle->center;
        Real radius = circle->radius;

        Vector2 pq = px_cntr - center;
        /*= Vector2{px_cntr.x - center.x, px_cntr.y - center.y}; */

        if (length(pq) < radius) {
            return true;
        } else return false;
    }
    else if (auto *rectangle = std::get_if<Rectangle>(&shape)) {
        Vector2 p_min = rectangle->p_min;
        Vector2 p_max = rectangle->p_max;

        if (px_cntr.x > p_min.x && px_cntr.x < p_max.x &&
            px_cntr.y > p_min.y && px_cntr.y < p_max.y) {
            return true;
        } else return false;

    }
    else if (auto *triangle = std::get_if<Triangle>(&shape)) {
        int pos_cnt = 0;  // the number of positive results from the dot product
        int neg_cnt = 0;  // the number of negative results from the dot product

        Vector2 p0p1 = triangle->p1 - triangle->p0;
        Vector2 p1p2 = triangle->p2 - triangle->p1;
        Vector2 p2p0 = triangle->p0 - triangle->p2;

        Vector2 n01 = Vector2{p0p1.y, -p0p1.x};
        Vector2 n12 = Vector2{p1p2.y, -p1p2.x};
        Vector2 n20 = Vector2{p2p0.y, -p2p0.x};
        
        // testing dot product of normals and the vector pq
        if (dot((px_cntr - triangle->p0), n01) > 0) {
            pos_cnt++;
        } else neg_cnt++;
        if (dot((px_cntr - triangle->p1), n12) > 0) {
            pos_cnt++;
        } else neg_cnt++;
        if (dot((px_cntr - triangle->p2), n20) > 0) {
            pos_cnt++;
        } else neg_cnt++;

        if (pos_cnt == 3 || neg_cnt == 3) {
            return true;
        } else return false;
    }
}

// only for circles
        /* Vector2 center = circle.center;
        Real radius = circle.radius;
        Vector3 color = circle.color; */

std::pair<std::pair<int, int>, std::pair<int, int>> computeBoundingBox(Vector2 c, Real r) {
    std::pair<int, int> top_left, bot_right;

    int top_left_x  = c.x - r;
    int top_left_y  = c.y - r;
    int bot_right_x = c.x + r;
    int bot_right_y = c.y + r;

    top_left = std::make_pair(top_left_x, top_left_y);
    bot_right = std::make_pair(bot_right_x, bot_right_y);

    return std::make_pair(top_left, bot_right);
}