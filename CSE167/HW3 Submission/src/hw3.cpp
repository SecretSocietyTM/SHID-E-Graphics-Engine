#include "hw3.h"
#include "3rdparty/glad.h" // needs to be included before GLFW!
#include "3rdparty/glfw/include/GLFW/glfw3.h"
#include "hw3_scenes.h"



using namespace hw3;

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);
void processInput(GLFWwindow* window, Vector3f& cam_pos, Vector3f& cam_dir, Vector3f& cam_up);
Matrix4x4f perspective(struct Scene* scene);

void rotation(Real radians, Matrix4x4f& r);

const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

void hw_3_1(const std::vector<std::string> &params) {
    // HW 3.1: Open a window using GLFW
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(800, 600, "CSE167 HW3_1", NULL, NULL);
    if (window == NULL) {
        std::cout << "FAILED TO CREATE GLFW WINDOW" << std::endl;
        glfwTerminate();
    }
    glfwMakeContextCurrent(window);
    
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "FAILED TO INITIALIZE GLAD" << std::endl;
    }

    // Tells OpenGL the size of the rendering window
    glViewport(0, 0, 800, 600);

    // Adjust viewport when window is resized    
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    // Loop to prevent window from being closed immediately, will close when user forces it
    while(!glfwWindowShouldClose(window)) {
        // pressing ESC will close the window
        processInput(window);

        glClearColor(0.83f, 0.325f, 0.325f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
}

void hw_3_2(const std::vector<std::string> &params) {
    // HW 3.2: Render a single 2D triangle

const char *vertexShaderSource = 
    "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "uniform mat4 rotate;\n"
    "out vec4 vertexColor;\n"
    "void main() {\n"
    "   gl_Position = rotate * vec4(aPos, 1.0);\n"
    "   vertexColor = vec4(0.2, 0.4, 0.6, 1.0);\n"
    "}\n\0";

const char *fragmentShaderSource = 
    "#version 330 core\n"
    "in vec4 vertexColor;\n"
    "out vec4 FragColor;\n"
    "void main() {\n"
    "   FragColor = vertexColor;\n"
    "}\n\0";
    
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "CSE167 HW3_2", NULL, NULL);
    if (window == NULL) {
        std::cout << "FAILED TO CREATE GLFW WINDOW" << std::endl;
        glfwTerminate();
    }
    glfwMakeContextCurrent(window);
    // Adjust viewport when window is resized    
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "FAILED TO INITIALIZE GLAD" << std::endl;
    }

    // ERROR INITS
    int  success;
    char infoLog[512];

    // VERTEX SHADER SECTION
    unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
    glCompileShader(vertexShader);
    // CHECK FOR ERRORS
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if(!success)
    {
        glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // VERTEX SHADER SECTION
    unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
    glCompileShader(fragmentShader);
    // CHECK FOR ERRORS
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // SHADER PROGRAM SECTION (LINKING SHADERS)
    unsigned int shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    // CHECK FOR ERRORS
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
        if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    // 1) VERTEX INPUT SECTION
    float vertices[] = {
        -0.5f, -0.5f, 0.0f,
         0.5f, -0.5f, 0.0f,
         0.0f, 0.5f, 0.0f
    };
    unsigned int indices[] = {
        0, 1, 2
    };

    unsigned int VBO, VAO, EBO; // vertex buffer object, vertex array object, element buffer object
    glGenBuffers(1, &VBO);
    glGenBuffers(1, &EBO);
    glGenVertexArrays(1, &VAO);
    
    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

    Matrix4x4f rotate = Matrix4x4f::identity();

    // Loop used to render
    while(!glfwWindowShouldClose(window)) {
        // pressing ESC will close the window
        processInput(window);

        glClearColor(0.8f, 0.8f, 0.8f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        glUseProgram(shaderProgram);

        // BEGIN RENDER
        Real radians = (float)glfwGetTime();
        rotation(radians, rotate);
        unsigned int rotateLoc = glGetUniformLocation(shaderProgram, "rotate");
        glUniformMatrix4fv(rotateLoc, 1, GL_FALSE, rotate.ptr());

        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, 3, GL_UNSIGNED_INT, 0);
        // END RENDER

        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteBuffers(1, &EBO);
    glDeleteProgram(shaderProgram);

    glfwTerminate();
}

void hw_3_3(const std::vector<std::string> &params) {
    // HW 3.3: Render a scene
    if (params.size() == 0) {
        return;
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; */

const char *vertexShaderSource = 
    "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "layout (location = 1) in vec3 aColor;\n"
    "uniform mat4 projection;\n"
    "uniform mat4 view;\n"
    "uniform mat4 model;\n"
    "out vec3 vertexColor;\n"
    "void main() {\n"
    "   gl_Position = projection * view * model * vec4(aPos, 1.0);\n"
    "   vertexColor = aColor;\n"
    "}\n\0";

const char *fragmentShaderSource = 
    "#version 330 core\n"
    "in vec3 vertexColor;\n"
    "out vec4 FragColor;\n"
    "void main() {\n"
    "   FragColor = vec4(vertexColor, 1.0);\n"
    "}\n\0";

    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(scene.camera.resolution.x, scene.camera.resolution.y, "CSE167 HW3_3", NULL, NULL);
    if (window == NULL) {
        std::cout << "FAILED TO CREATE GLFW WINDOW" << std::endl;
        glfwTerminate();
    }
    glfwMakeContextCurrent(window);
    // Adjust viewport when window is resized    
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "FAILED TO INITIALIZE GLAD" << std::endl;
    }

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_FRAMEBUFFER_SRGB);

    // ERROR INITS
    int  success;
    char infoLog[512];

    // VERTEX SHADER SECTION
    unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
    glCompileShader(vertexShader);
    // CHECK FOR ERRORS
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if(!success)
    {
        glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // VERTEX SHADER SECTION
    unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
    glCompileShader(fragmentShader);
    // CHECK FOR ERRORS
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // SHADER PROGRAM SECTION (LINKING SHADERS)
    unsigned int shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    // CHECK FOR ERRORS
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
        if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    std::vector<unsigned int> VAO(scene.meshes.size());
    std::vector<unsigned int> VBO_vertex(scene.meshes.size());
    std::vector<unsigned int> VBO_color(scene.meshes.size());
    std::vector<unsigned int> EBO(scene.meshes.size());

    for (int i = 0; i < scene.meshes.size(); i++) {
        auto &mesh = scene.meshes[i];

        glGenVertexArrays(1, &VAO[i]);
        glGenBuffers(1, &VBO_vertex[i]);
        glGenBuffers(1, &VBO_color[i]);
        glGenBuffers(1, &EBO[i]);

        glBindVertexArray(VAO[i]);

        glBindBuffer(GL_ARRAY_BUFFER, VBO_vertex[i]);
        glBufferData(GL_ARRAY_BUFFER, mesh.vertices.size() * sizeof(Vector3f),
                                      mesh.vertices.data(), GL_STATIC_DRAW);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(0);

        glBindBuffer(GL_ARRAY_BUFFER, VBO_color[i]);
        glBufferData(GL_ARRAY_BUFFER, mesh.vertex_colors.size() * sizeof(Vector3f), 
                                      mesh.vertex_colors.data(), GL_STATIC_DRAW);
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(1);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO[i]);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, mesh.faces.size() * sizeof(Vector3i),
                                              mesh.faces.data(), GL_STATIC_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
    }

    Vector3f bg_color =  scene.background;

    Matrix4x4f projection = perspective(&scene);
    Matrix4x4f lookAt = scene.camera.cam_to_world; // do not forget to invert
    Vector3f cam_pos = Vector3f{lookAt(0,3), lookAt(1,3), lookAt(2,3)};
    Vector3f cam_dir = Vector3f{lookAt(0,2), lookAt(1,2), lookAt(2,2)};
    Vector3f cam_up  = Vector3f{lookAt(0,1), lookAt(1,1), lookAt(2,1)};

    // Loop used to render
    while(!glfwWindowShouldClose(window)) {
        // pressing ESC will close the window
        processInput(window, cam_pos, cam_dir, cam_up);

        glClearColor(bg_color.x, bg_color.y, bg_color.z, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // use shaders
        glUseProgram(shaderProgram);

        // BEGIN RENDER
        lookAt(0,3) = cam_pos.x;
        lookAt(1,3) = cam_pos.y;
        lookAt(2,3) = cam_pos.z;
        Matrix4x4f model;
        Matrix4x4f view = inverse(lookAt);

        for (int i = 0; i < scene.meshes.size(); i++) {
            model = scene.meshes[i].model_matrix;
            unsigned int modelLoc = glGetUniformLocation(shaderProgram, "model");
            unsigned int viewLoc = glGetUniformLocation(shaderProgram, "view");
            unsigned int projectionLoc = glGetUniformLocation(shaderProgram, "projection");
            glUniformMatrix4fv(modelLoc, 1, GL_FALSE, model.ptr());
            glUniformMatrix4fv(viewLoc, 1, GL_FALSE, view.ptr());
            glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, projection.ptr());

            glBindVertexArray(VAO[i]);
            glDrawElements(GL_TRIANGLES, scene.meshes[i].faces.size() * 3, GL_UNSIGNED_INT, 0);
        }
        // END RENDER
        
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    for (int i = 0; i < scene.meshes.size(); i++) {
        glDeleteVertexArrays(1, &VAO[i]);
        glDeleteBuffers(1, &VBO_vertex[i]);
        glDeleteBuffers(1, &VBO_color[i]);
        glDeleteBuffers(1, &EBO[i]);
    }
    glDeleteProgram(shaderProgram);

    glfwTerminate();
}

void hw_3_4(const std::vector<std::string> &params) {
    // HW 3.4: Render a scene with lighting
    if (params.size() == 0) {
        return;
    }

    Scene scene = parse_scene(params[0]);
    /* std::cout << scene << std::endl; */

    const char *vertexShaderSource = 
        "#version 330 core\n"
        "layout (location = 0) in vec3 aPos;\n"
        "layout (location = 1) in vec3 aColor;\n"
        "layout (location = 2) in vec3 aNormal;\n"
        "uniform mat4 projection;\n"
        "uniform mat4 view;\n"
        "uniform mat4 model;\n"
        "out vec3 vertexColor;\n"
        "out vec3 Normal;\n"
        "out vec3 FragPos;\n"
        "void main() {\n"
        "   vertexColor = aColor;\n"
        "   Normal = mat3(transpose(inverse(model))) * aNormal;\n"
        "   gl_Position = projection * view * model * vec4(aPos, 1.0);\n"
        "   FragPos = vec3(model * vec4(aPos, 1.0));\n"
        "}\n\0";

    const char *fragmentShaderSource = 
        "#version 330 core\n"
        "in vec3 vertexColor;\n"
        "in vec3 Normal;\n"
        "in vec3 FragPos;\n"
        "uniform vec3 lightColor;\n"
        "uniform vec3 viewPos;\n"
        "out vec4 FragColor;\n"
        "void main() {\n"
        "   float ambientStrength = 0.1;\n"
        "   vec3 ambient = ambientStrength * lightColor;\n"
        "   vec3 norm = normalize(Normal);\n"
        "   vec3 lightDir = normalize(vec3(1, 1, 1));\n"
        "   float diff = max(dot(norm, lightDir), 0.0);\n"
        "   vec3 diffuse = diff * lightColor;\n"
        "   float specularStrength = 0.5;\n"
        "   vec3 viewDir = normalize(viewPos - FragPos);\n"
        "   vec3 reflectDir = reflect(-lightDir, norm);\n"
        "   float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);\n"
        "   vec3 specular = specularStrength * spec * lightColor;\n"
        "   vec3 result = (ambient + diffuse + specular) * vertexColor;\n"
        "   FragColor = vec4(result, 1.0);\n"
        "}\n\0";

    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(scene.camera.resolution.x, scene.camera.resolution.y, "CSE167 HW3_4", NULL, NULL);
    if (window == NULL) {
        std::cout << "FAILED TO CREATE GLFW WINDOW" << std::endl;
        glfwTerminate();
    }
    glfwMakeContextCurrent(window);
    // Adjust viewport when window is resized    
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "FAILED TO INITIALIZE GLAD" << std::endl;
    }

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_FRAMEBUFFER_SRGB);

    // ERROR INITS
    int  success;
    char infoLog[512];

    // VERTEX SHADER SECTION
    unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
    glCompileShader(vertexShader);
    // CHECK FOR ERRORS
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if(!success)
    {
        glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // VERTEX SHADER SECTION
    unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
    glCompileShader(fragmentShader);
    // CHECK FOR ERRORS
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success)
    {
        glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // SHADER PROGRAM SECTION (LINKING SHADERS)
    unsigned int shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    // CHECK FOR ERRORS
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
        if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
    }
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    // multiple mesh support
    std::vector<unsigned int> VAO(scene.meshes.size());
    std::vector<unsigned int> VBO_vertex(scene.meshes.size());
    std::vector<unsigned int> VBO_color(scene.meshes.size());
    std::vector<unsigned int> VBO_normal(scene.meshes.size());
    std::vector<unsigned int> EBO(scene.meshes.size());

    for (int i = 0; i < scene.meshes.size(); i++) {
        auto &mesh = scene.meshes[i];

        glGenVertexArrays(1, &VAO[i]);
        glGenBuffers(1, &VBO_vertex[i]);
        glGenBuffers(1, &VBO_color[i]);
        glGenBuffers(1, &VBO_normal[i]);
        glGenBuffers(1, &EBO[i]);

        glBindVertexArray(VAO[i]);

        glBindBuffer(GL_ARRAY_BUFFER, VBO_vertex[i]);
        glBufferData(GL_ARRAY_BUFFER, mesh.vertices.size() * sizeof(Vector3f),
                                      mesh.vertices.data(), GL_STATIC_DRAW);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(0);

        glBindBuffer(GL_ARRAY_BUFFER, VBO_color[i]);
        glBufferData(GL_ARRAY_BUFFER, mesh.vertex_colors.size() * sizeof(Vector3f), 
                                      mesh.vertex_colors.data(), GL_STATIC_DRAW);
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(1);

        // Bind/set vertex normals
        glBindBuffer(GL_ARRAY_BUFFER, VBO_normal[i]);
        glBufferData(GL_ARRAY_BUFFER, scene.meshes[i].vertex_normals.size() * sizeof(Vector3f), 
                                    scene.meshes[i].vertex_normals.data(), GL_STATIC_DRAW);
        glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(2);  

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO[i]);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, mesh.faces.size() * sizeof(Vector3i),
                                              mesh.faces.data(), GL_STATIC_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
    }

    Vector3f bg_color =  scene.background;

    Matrix4x4f projection = perspective(&scene);
    Matrix4x4f lookAt = scene.camera.cam_to_world; // do not forget to invert
    Vector3f cam_pos = Vector3f{lookAt(0,3), lookAt(1,3), lookAt(2,3)};
    Vector3f cam_dir = Vector3f{lookAt(0,2), lookAt(1,2), lookAt(2,2)};
    Vector3f cam_up  = Vector3f{lookAt(0,1), lookAt(1,1), lookAt(2,1)};

    // Loop used to render
    while(!glfwWindowShouldClose(window)) {
        // pressing ESC will close the window
        processInput(window, cam_pos, cam_dir, cam_up);

        glClearColor(bg_color.x, bg_color.y, bg_color.z, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // use shaders
        glUseProgram(shaderProgram);

        // BEGIN RENDER
        lookAt(0,3) = cam_pos.x;
        lookAt(1,3) = cam_pos.y;
        lookAt(2,3) = cam_pos.z;
        Matrix4x4f model;
        Matrix4x4f view = inverse(lookAt);

        for (int i = 0; i < scene.meshes.size(); i++) {
            unsigned int light_colorLoc = glGetUniformLocation(shaderProgram, "lightColor");
            unsigned int view_posLos    = glGetUniformLocation(shaderProgram, "viewPos");
            glUniform3f(light_colorLoc, 1.0f, 1.0f, 1.0f);
            glUniform3f(view_posLos, cam_pos.x, cam_pos.y, cam_pos.z);

            model = scene.meshes[i].model_matrix;

            unsigned int modelLoc = glGetUniformLocation(shaderProgram, "model");
            unsigned int viewLoc = glGetUniformLocation(shaderProgram, "view");
            unsigned int projectionLoc = glGetUniformLocation(shaderProgram, "projection");
            glUniformMatrix4fv(modelLoc, 1, GL_FALSE, model.ptr());
            glUniformMatrix4fv(viewLoc, 1, GL_FALSE, view.ptr());
            glUniformMatrix4fv(projectionLoc, 1, GL_FALSE, projection.ptr());

            glBindVertexArray(VAO[i]);
            glDrawElements(GL_TRIANGLES, scene.meshes[i].faces.size() * 3, GL_UNSIGNED_INT, 0);
        } 
        // END RENDER
        
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    for (int i = 0; i < scene.meshes.size(); i++) {
        glDeleteVertexArrays(1, &VAO[i]);
        glDeleteBuffers(1, &VBO_vertex[i]);
        glDeleteBuffers(1, &VBO_color[i]);
        glDeleteBuffers(1, &VBO_normal[i]);
        glDeleteBuffers(1, &EBO[i]);
    }
    glDeleteProgram(shaderProgram);

    glfwTerminate();
}




//////////////////////////////////////////////////////////////////
//////////////////////// HELPER FUNCTIONS ////////////////////////
//////////////////////////////////////////////////////////////////

void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

// for part 2
void processInput(GLFWwindow* window) {
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS) glfwSetWindowShouldClose(window, true);
}

// for part 3
void processInput(GLFWwindow* window, Vector3f& cam_pos, Vector3f& cam_dir, Vector3f& cam_up) {
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS) glfwSetWindowShouldClose(window, true);

    const float cam_speed = 0.005f;  //0.05 default, 0.5 - teapot, 4.0 - buddha, 0.02 - bunny
    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS) {
        cam_pos = cam_pos - (cam_speed * cam_dir);
        /* std::cout << "AFTER PRESSING W" << cam_pos << std::endl; */
    }
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS) {
        cam_pos = cam_pos + (cam_speed * cam_dir);
        /* std::cout << "AFTER PRESSING S" << cam_pos << std::endl; */
    } 
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS) {
        cam_pos = cam_pos + (normalize(cross(cam_dir, cam_up)) * cam_speed);
        /* std::cout << "AFTER PRESSING A" << cam_pos << std::endl; */
    } 
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS) {
        cam_pos = cam_pos - (normalize(cross(cam_dir, cam_up)) * cam_speed);
        /* std::cout << "AFTER PRESSING D" << cam_pos << std::endl; */
    }  
}

Matrix4x4f perspective(struct Scene* scene) {
    float a = static_cast<float>(scene->camera.resolution.x) / static_cast<float>(scene->camera.resolution.y);
    float s = scene->camera.s;
    float z_near = scene->camera.z_near;
    float z_far = scene->camera.z_far;

    Matrix4x4f projection = Matrix4x4::identity();
    projection(0,0) = 1 / (a * s);
    projection(1,1) = 1 / s;
    projection(2,2) = -z_far / (z_far - z_near);
    projection(3,2) = -1;
    projection(2,3) = -(z_far * z_near) / (z_far - z_near);
    projection(3,3) = 0;

    return projection;
}

// for part 2
// pass in an angle and a matrix
void rotation(Real radians, Matrix4x4f& r) {
    r(0, 0) =   std::cos(radians);
    r(0, 1) = -(std::sin(radians)); 
    r(1, 0) =   std::sin(radians);
    r(1, 1) =   std::cos(radians); 
}