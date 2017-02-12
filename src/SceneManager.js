function SceneManager(canvas) {
    if (!canvas || !getWebGLContext(canvas)) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    var gl = getWebGLContext(canvas);
    var u_eyePosWorld;
    var uniformMatrices;
    var uniformLamp0, uniformLamp1;
    var phongReflactance;
    var currentRotationAngle = 0.0;

    function getShaderVariableLocation() {
        u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
        uniformMatrices = {
            model:  gl.getUniformLocation(gl.program, 'u_ModelMatrix'),
            mvp:    gl.getUniformLocation(gl.program, 'u_MvpMatrix'),
            normal: gl.getUniformLocation(gl.program, 'u_NormalMatrix')
        };

        uniformLamp0 = {
            pos: gl.getUniformLocation(gl.program, 'u_Lamp0Pos'),
            amb: gl.getUniformLocation(gl.program, 'u_Lamp0Amb'),
            dif: gl.getUniformLocation(gl.program, 'u_Lamp0Diff'),
            spc: gl.getUniformLocation(gl.program, 'u_Lamp0Spec')
        };

        uniformLamp1 = {
            pos: gl.getUniformLocation(gl.program, 'u_Lamp1Pos'),
            amb: gl.getUniformLocation(gl.program, 'u_Lamp1Amb'),
            dif: gl.getUniformLocation(gl.program, 'u_Lamp1Diff'),
            spc: gl.getUniformLocation(gl.program, 'u_Lamp1Spec')
        };

        phongReflactance = {
            Ke: gl.getUniformLocation(gl.program, 'u_Ke'),
            Ka: gl.getUniformLocation(gl.program, 'u_Ka'),
            Kd: gl.getUniformLocation(gl.program, 'u_Kd'),
            Ks: gl.getUniformLocation(gl.program, 'u_Ks')
        };
    }

    function failGetShaderVariableLocation(shaderVariablesMap) {
        Object.keys(shaderVariablesMap).some(keys => {
            if (Object.keys(shaderVariablesMap[keys]).some(e => !shaderVariablesMap[keys][e])) {
                console.log('Failed to get ' + keys + ' locations');
                return true;
            }
        });
        return false;
    }

    this.start = function() {

        if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }

        if (initVertexBuffer(gl) < 0) {
            console.log('Failed to set the vertex information');
            return;
        }

        // Set the clear color and enable the depth test
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        getShaderVariableLocation();
        if (failGetShaderVariableLocation({
            eyePosWorld: u_eyePosWorld,
            matrices: uniformMatrices,
            lamp0: uniformLamp0,
            lamp1: uniformLamp1,
            phong: phongReflactance
        })) {
            return;
        }

        var modelMatrix = new Matrix4();  // Model matrix
        var mvpMatrix = new Matrix4();    // Model view projection matrix
        var normalMatrix = new Matrix4(); // Transformation matrix for normals

    
    // On-screen aspect ratio for this camera: width/height.
    vpAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

    // Start drawing: create 'tick' variable whose value is this function:
    var tick = function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        currentRotationAngle = animate(currentRotationAngle);

        //----------------------Create viewport------------------------
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        // For this viewport, set camera's eye point and the viewing volume:
        mvpMatrix.setPerspective(40, vpAspect, g_near, g_far);
        mvpMatrix.lookAt( viewSet.eye.x, viewSet.eye.y, viewSet.eye.z,
                        viewSet.center.x, viewSet.center.y, viewSet.center.z,
                        viewSet.up.x, viewSet.up.y, viewSet.up.z);

        // Pass the eye position to u_eyePosWorld
        gl.uniform4f(u_eyePosWorld, g_EyeX, g_EyeY, g_EyeZ, 1);

        // Position the first light source in World coords:
        gl.uniform4f(uniformLamp0.pos, LAMP0.pos.x, LAMP0.pos.y, LAMP0.pos.z, LAMP0.pos.w);
        gl.uniform3f(uniformLamp0.amb, LAMP0.amb.r, LAMP0.amb.g, LAMP0.amb.b);
        gl.uniform3f(uniformLamp0.dif, LAMP0.dif.r, LAMP0.dif.g, LAMP0.dif.b);
        gl.uniform3f(uniformLamp0.spc, LAMP0.spc.r, LAMP0.spc.g, LAMP0.spc.b);

        // Position the second light source in World coords:
        gl.uniform4f(uniformLamp1.pos, LAMP1.pos.x, LAMP1.pos.y, LAMP1.pos.z, LAMP1.pos.w);
        gl.uniform3f(uniformLamp1.amb, LAMP1.amb.r, LAMP1.amb.g, LAMP1.amb.b);
        gl.uniform3f(uniformLamp1.dif, LAMP1.dif.r, LAMP1.dif.g, LAMP1.dif.b);
        gl.uniform3f(uniformLamp1.spc, LAMP1.spc.r, LAMP1.spc.g, LAMP1.spc.b);

        draw(gl, currentRotationAngle, mvpMatrix, uniformMatrices.mvp,
                            modelMatrix, uniformMatrices.model,
                            normalMatrix, uniformMatrices.normal,
                            phongReflactance);

        requestAnimationFrame(tick, canvas);
    };
    tick();
    }
}



//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
function initVertexBuffer(gl) {

    var helicopterBody = new HelicopterBody();
    hlcVerts = helicopterBody.getVertices();
    hlcNorms = helicopterBody.getNormalVectors();
    hlcIndex = helicopterBody.getVerticesIndices();

    var brick = new Brick();
    brkVerts = brick.getVertices();
    brkNorms = brick.getNormalVectors();
    brkIndex = brick.getVerticesIndices();

    var cylinder = new Cylinder();
    cylVerts = cylinder.getVertices();
    cylNorms = cylinder.getNormalVectors();

    var sphere = new Sphere();
    sphVerts = sphere.getVertices();
    sphNorms = sphere.getNormalVectors();
    sphIndex = sphere.getVerticesIndices();

    var torus = new Torus();
    torVerts = torus.getVertices();
    torNorms = torus.getNormalVectors();

    var groundGrid = new GroundGrid();
    gndVerts = groundGrid.getVertices();
    gndNorms = groundGrid.getNormalVectors();

    var vSiz = (sphVerts.length + hlcVerts.length + brkVerts.length + cylVerts.length +
                torVerts.length + gndVerts.length);

    console.log('Number of vertices is', vSiz / floatsPerVertex, ', point per vertex is', floatsPerVertex);

    var verticesArrayBuffer = new ArrayBufferFloat32Array(vSiz);
    verticesArrayBuffer.appendObject(SPHERE, sphVerts);
    verticesArrayBuffer.appendObject(HELICOPTERBODY, hlcVerts);
    verticesArrayBuffer.appendObject(BRICK, brkVerts);
    verticesArrayBuffer.appendObject(CYLINDER ,cylVerts);
    verticesArrayBuffer.appendObject(TORUS, torVerts);
    verticesArrayBuffer.appendObject(GROUNDGRID, gndVerts);
    sphStart = verticesArrayBuffer.getObjectStartPosition(SPHERE);
    hlcStart = verticesArrayBuffer.getObjectStartPosition(HELICOPTERBODY);
    brkStart = verticesArrayBuffer.getObjectStartPosition(BRICK);
    cylStart = verticesArrayBuffer.getObjectStartPosition(CYLINDER);
    torStart = verticesArrayBuffer.getObjectStartPosition(TORUS);
    gndStart = verticesArrayBuffer.getObjectStartPosition(GROUNDGRID);

    var nSiz = vSiz;
    var normalVectorsArrayBuffer = new ArrayBufferFloat32Array(nSiz);
    normalVectorsArrayBuffer.appendObject(SPHERE, sphNorms);
    normalVectorsArrayBuffer.appendObject(HELICOPTERBODY, hlcNorms);
    normalVectorsArrayBuffer.appendObject(BRICK, brkNorms);
    normalVectorsArrayBuffer.appendObject(CYLINDER ,cylNorms);
    normalVectorsArrayBuffer.appendObject(TORUS, torNorms);
    normalVectorsArrayBuffer.appendObject(GROUNDGRID, gndNorms);

    var iSiz = (sphIndex.length + hlcIndex.length + brkIndex.length);
    console.log('iSiz is', iSiz);

    var verticesIndiceArrayBuffer = new ArrayBufferUint8Array(iSiz);
    var hlcIndexIncr = hlcStart/floatsPerVertex;
    var brkIndexIncr = brkStart/floatsPerVertex;
    verticesIndiceArrayBuffer.appendObject(SPHERE, sphIndex);
    verticesIndiceArrayBuffer.appendObject(HELICOPTERBODY,
        hlcIndex.map(function(idx){return idx+hlcIndexIncr;}));
    verticesIndiceArrayBuffer.appendObject(BRICK,
        brkIndex.map(function(idx){return idx+brkIndexIncr;}));
    sphIStart = verticesIndiceArrayBuffer.getObjectStartPosition(SPHERE);
    hlcIStart = verticesIndiceArrayBuffer.getObjectStartPosition(HELICOPTERBODY);
    brkIStart = verticesIndiceArrayBuffer.getObjectStartPosition(BRICK);

    // We create two separate buffers so that you can modify normals if you wish.
    if (!initGLArrayBuffer(gl, 'a_Position', verticesArrayBuffer.getArray(), gl.FLOAT, 3)) return -1;
    if (!initGLArrayBuffer(gl, 'a_Normal', normalVectorsArrayBuffer.getArray(), gl.FLOAT, 3))  return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, verticesIndiceArrayBuffer.getArray(), gl.STATIC_DRAW);

    return verticesIndiceArrayBuffer.getArray().length;
}

function initGLArrayBuffer(gl, attribute, data, type, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

//==============================================================================
function draw(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix, phongReflactance) {

    modelMatrix = new Matrix4();

    //--------Draw Helicopter
    // Set the Phong materials' reflectance:
    setDrawMaterial(gl, phongReflactance, new Material(MATL_EMERALD));

    pushMatrix(mvpMatrix);
    drawHelicopter(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
    mvpMatrix = popMatrix();

    //--------Draw Sphere Cone
    // Set the Phong materials' reflectance:
    setDrawMaterial(gl, phongReflactance, new Material(MATL_COPPER_SHINY));

    pushMatrix(mvpMatrix);
    drawSphereCone(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
    mvpMatrix = popMatrix();

    //--------Draw SnowMan
    // Set the Phong materials' reflectance:
    setDrawMaterial(gl, phongReflactance, new Material(MATL_PEARL));

    pushMatrix(mvpMatrix);
    drawSnowMan(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
    mvpMatrix = popMatrix();

    //---------Draw Ground Plane
    // Set the Phong materials' reflectance:
    setDrawMaterial(gl, phongReflactance, new Material(MATL_GRN_PLASTIC));

    modelMatrix.setScale(0.4, 0.4,0.4);
    drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
    gl.drawArrays(gl.LINES, gndStart/floatsPerVertex, gndVerts.length/floatsPerVertex);
}

function setDrawMaterial(gl, phongReflactance, material) {
    gl.uniform3f(phongReflactance.Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
    gl.uniform3f(phongReflactance.Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
    gl.uniform3f(phongReflactance.Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
    gl.uniform3f(phongReflactance.Ks, material.specular[0], material.specular[1], material.specular[2]);
}

function drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix) {
    mvpMatrix.multiply(modelMatrix);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
}

//==============================================================================
function drawHelicopter(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix) {

  pushMatrix(mvpMatrix);

  //Draw body
  modelMatrix.setTranslate(1.0, 0.5, 1.3);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.4, 0.4, 0.4);
  modelMatrix.rotate(currentAngle, 0, 0.7, 1);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, hlcIndex.length, gl.UNSIGNED_BYTE, hlcIStart);

  mvpMatrix = popMatrix();
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  pushMatrix(mvpMatrix);

  // draw back bone
  modelMatrix.translate(0, 0.3, -1.2);
  modelMatrix.scale(0.1, 0.1, 0.6);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

  mvpMatrix = popMatrix();
  modelMatrix = popMatrix();
  pushMatrix(mvpMatrix);

  // draw spinning torus
  modelMatrix.rotate(90.0, 0, 1, 0);
  modelMatrix.translate(1.7, 0.3, 0.15);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.rotate(currentAngle * 2, 0, 0, 1);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, torStart/floatsPerVertex, torVerts.length/floatsPerVertex);

  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);
  pushMatrix(modelMatrix);

  // draw two paddle
  modelMatrix.translate(2.3, 0, 0);
  modelMatrix.scale(1.8, 0.4, 0.4);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

  modelMatrix = popMatrix();
  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);

  modelMatrix.translate(-2.3, 0, 0);
  modelMatrix.scale(1.8, 0.4, 0.4);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

  mvpMatrix = popMatrix();
  modelMatrix = popMatrix();    // pop the matrix stored after drawing body
  pushMatrix(mvpMatrix);

  // draw upper bone
  modelMatrix.rotate(90.0, 1, 0, 0);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.translate(0, -2, -7);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);

  // draw spinning torus
  modelMatrix.translate(0, 0, -1);
  modelMatrix.rotate(currentAngle * 2, 0, 0, 1);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, torStart/floatsPerVertex, torVerts.length/floatsPerVertex);

  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);
  pushMatrix(modelMatrix);

  // draw two paddle
  modelMatrix.translate(5.5, 0, 0);
  modelMatrix.scale(5, 0.4, 0.4);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

  modelMatrix = popMatrix();
  mvpMatrix = popMatrix();

  modelMatrix.translate(-5.5, 0, 0);
  modelMatrix.scale(5, 0.4, 0.4);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);
}

//==============================================================================
function drawSphereCone(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix) {

  pushMatrix(mvpMatrix);

  // draw a sphere
  modelMatrix.setTranslate(1.9, 1.9, 1.0);
  modelMatrix.scale(1,1,-1); // convert to left-handed coord sys to match WebGL display canvas.
  modelMatrix.scale(0.2, 0.2, 0.2);
  modelMatrix.rotate(currentAngle, 1, 0.7, 0);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);

  // draw cylinder3 on cylinder2
  modelMatrix.translate(0, 0, 2 + 2 * Math.abs(Math.cos(Math.PI * currentAngle/180)));
  modelMatrix.scale(0.8,0.8,0.8);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

  mvpMatrix = popMatrix();

  // draw rod from cylinder
  modelMatrix.rotate(90.0, -90.0, 0, 1);
  modelMatrix.translate(0, 0, 2);
  modelMatrix.scale(0.3, 0.3, 2);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
}

//==============================================================================
function drawSnowMan(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix) {

  pushMatrix(mvpMatrix);

  // draw a sphere
  modelMatrix.setTranslate(2.0, 0.2, 0.3);
  modelMatrix.scale(1,1,-1); // convert to left-handed coord sys to match WebGL display canvas.
  modelMatrix.scale(0.3, 0.3, 0.3);
  modelMatrix.rotate(180, 0, 1, 0);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

  mvpMatrix = popMatrix();
  pushMatrix(mvpMatrix);

  // draw a sphere
  modelMatrix.translate(0, 0, 1.3);
  modelMatrix.scale(0.6, 0.6, 0.6);
  modelMatrix.translate(0.5 * Math.sin(Math.PI * currentAngle/180), 0, 0);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

  mvpMatrix = popMatrix();

  // draw a sphere
  modelMatrix.translate(0, 0, 1.3);
  modelMatrix.scale(0.8, 0.8, 0.6 + 0.2 * Math.cos(Math.PI * currentAngle/180));
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);
}
