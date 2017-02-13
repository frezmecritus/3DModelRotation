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

    var models = {};
    var verticesArrayBuffer, normalVectorsArrayBuffer, verticesIndiceArrayBuffer;

    console.log('view port size:' + gl.drawingBufferWidth + ' ' + gl.drawingBufferHeight);
    var onScreenAspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

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
        if (failGetShaderVariableLocation([u_eyePosWorld, uniformMatrices, uniformLamp0, uniformLamp1, phongReflactance])) {
            return;
        }

        var modelMatrix = new Matrix4();  // Model matrix
        var mvpMatrix = new Matrix4();    // Model view projection matrix
        var normalMatrix = new Matrix4(); // Transformation matrix for normals

        // Start drawing: create 'tick' variable whose value is this function:
        var tick = function() {

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Create viewport
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            // For this viewport, set camera's eye point and the viewing volume:
            mvpMatrix.setPerspective(40, onScreenAspectRatio, g_near, g_far);
            mvpMatrix.lookAt(viewSet.eye.x, viewSet.eye.y, viewSet.eye.z,
                             viewSet.center.x, viewSet.center.y, viewSet.center.z,
                             viewSet.up.x, viewSet.up.y, viewSet.up.z);

            // Pass the eye position to u_eyePosWorld
            gl.uniform4f(u_eyePosWorld, g_EyeX, g_EyeY, g_EyeZ, 1.0);

            uniformLamp0.setAttributes(LAMP0);
            uniformLamp1.setAttributes(LAMP1);

            currentRotationAngle = animate(currentRotationAngle);
            draw(mvpMatrix, modelMatrix, normalMatrix);

            requestAnimationFrame(tick, canvas);
        };
        tick();
    }

    // Create one vertex buffer object (VBO) that holds all vertices for all shapes.
    function initVertexBuffer() {
        models[SPHERE] = new Sphere();
        models[HELICOPTERBODY] = new HelicopterBody();
        models[BRICK] = new Brick();
        models[CYLINDER] = new Cylinder();
        models[TORUS] = new Torus();
        models[GROUNDGRID] = new GroundGrid();

        var helicopterBody = new HelicopterBody();
        hlcVerts = helicopterBody.getVertices();
        hlcIndex = helicopterBody.getVerticesIndices();

        var brick = new Brick();
        brkVerts = brick.getVertices();
        brkIndex = brick.getVerticesIndices();

        var cylinder = new Cylinder();
        cylVerts = cylinder.getVertices();

        var sphere = new Sphere();
        sphVerts = sphere.getVertices();
        sphIndex = sphere.getVerticesIndices();

        var torus = new Torus();
        torVerts = torus.getVertices();

        var groundGrid = new GroundGrid();
        gndVerts = groundGrid.getVertices();

        var vSiz = Object.keys(models).reduce((result, key) => result + models[key].getVertices().length, 0);

        console.log('Number of vertices is', vSiz / floatsPerVertex, ', point per vertex is', floatsPerVertex);

        verticesArrayBuffer = new ArrayBufferFloat32Array(vSiz);
        Object.keys(models).map(key => verticesArrayBuffer.appendObject(key, models[key].getVertices()));
        hlcStart = verticesArrayBuffer.getObjectStartPosition(HELICOPTERBODY);
        brkStart = verticesArrayBuffer.getObjectStartPosition(BRICK);
        cylStart = verticesArrayBuffer.getObjectStartPosition(CYLINDER);
        torStart = verticesArrayBuffer.getObjectStartPosition(TORUS);
        gndStart = verticesArrayBuffer.getObjectStartPosition(GROUNDGRID);

        var nSiz = vSiz;
        normalVectorsArrayBuffer = new ArrayBufferFloat32Array(nSiz);
        Object.keys(models).map(key => normalVectorsArrayBuffer.appendObject(key, models[key].getNormalVectors()));

        var iSiz = (sphIndex.length + hlcIndex.length + brkIndex.length);
        console.log('iSiz is', iSiz);

        verticesIndiceArrayBuffer = new ArrayBufferUint8Array(iSiz);
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
        if (!initGLArrayBuffer('a_Position', verticesArrayBuffer.getArray(), gl.FLOAT, floatsPerVertex)) return -1;
        if (!initGLArrayBuffer('a_Normal', normalVectorsArrayBuffer.getArray(), gl.FLOAT, floatsPerVertex))  return -1;

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

    function initGLArrayBuffer(attribute, data, type, num) {
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

    function getShaderVariableLocation() {
        u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
        uniformMatrices = {
            model:  gl.getUniformLocation(gl.program, 'u_ModelMatrix'),
            mvp:    gl.getUniformLocation(gl.program, 'u_MvpMatrix'),
            normal: gl.getUniformLocation(gl.program, 'u_NormalMatrix'),
            
            drawSetting: function(mvpMatrix, modelMatrix, normalMatrix) {
                mvpMatrix.multiply(modelMatrix);
                normalMatrix.setInverseOf(modelMatrix);
                normalMatrix.transpose();
                gl.uniformMatrix4fv(this.model, false, modelMatrix.elements);
                gl.uniformMatrix4fv(this.mvp, false, mvpMatrix.elements);
                gl.uniformMatrix4fv(this.normal, false, normalMatrix.elements);
            }
        }

        uniformLamp0 = {
            pos: gl.getUniformLocation(gl.program, 'u_Lamp0Pos'),
            amb: gl.getUniformLocation(gl.program, 'u_Lamp0Amb'),
            dif: gl.getUniformLocation(gl.program, 'u_Lamp0Diff'),
            spc: gl.getUniformLocation(gl.program, 'u_Lamp0Spec'),

            setAttributes: function(attributes) {
                gl.uniform4f(this.pos, attributes.pos.x, attributes.pos.y, attributes.pos.z, attributes.pos.w);
                gl.uniform3f(this.amb, attributes.amb.r, attributes.amb.g, attributes.amb.b);
                gl.uniform3f(this.dif, attributes.dif.r, attributes.dif.g, attributes.dif.b);
                gl.uniform3f(this.spc, attributes.spc.r, attributes.spc.g, attributes.spc.b);
            }
        };

        uniformLamp1 = {
            pos: gl.getUniformLocation(gl.program, 'u_Lamp1Pos'),
            amb: gl.getUniformLocation(gl.program, 'u_Lamp1Amb'),
            dif: gl.getUniformLocation(gl.program, 'u_Lamp1Diff'),
            spc: gl.getUniformLocation(gl.program, 'u_Lamp1Spec'),

            setAttributes: function(attributes) {
                gl.uniform4f(this.pos, attributes.pos.x, attributes.pos.y, attributes.pos.z, attributes.pos.w);
                gl.uniform3f(this.amb, attributes.amb.r, attributes.amb.g, attributes.amb.b);
                gl.uniform3f(this.dif, attributes.dif.r, attributes.dif.g, attributes.dif.b);
                gl.uniform3f(this.spc, attributes.spc.r, attributes.spc.g, attributes.spc.b);
            }
        };

        phongReflactance = {
            Ke: gl.getUniformLocation(gl.program, 'u_Ke'),
            Ka: gl.getUniformLocation(gl.program, 'u_Ka'),
            Kd: gl.getUniformLocation(gl.program, 'u_Kd'),
            Ks: gl.getUniformLocation(gl.program, 'u_Ks'),

            setDrawMaterial: function(material) {
                gl.uniform3f(this.Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
                gl.uniform3f(this.Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
                gl.uniform3f(this.Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
                gl.uniform3f(this.Ks, material.specular[0], material.specular[1], material.specular[2]);
            }
        };
    }

    function failGetShaderVariableLocation(shaderVariables) {
        return shaderVariables.some(variable => 
            Object.keys(variable).some(e => {
                if (!variable[e]) {
                    console.log('Failed to get ' + e + ' locations');
                    return true;
                }
            }));
    }

    function draw(mvpMatrix, modelMatrix, normalMatrix) {

        modelMatrix = new Matrix4();

        //--------Draw Helicopter
        phongReflactance.setDrawMaterial(new Material(MATL_EMERALD));

        pushMatrix(mvpMatrix);
        drawHelicopter(mvpMatrix, modelMatrix, normalMatrix);
        mvpMatrix = popMatrix();

        //--------Draw Sphere Cone
        phongReflactance.setDrawMaterial(new Material(MATL_COPPER_SHINY));

        pushMatrix(mvpMatrix);
        drawSphereCone(mvpMatrix, modelMatrix, normalMatrix);
        mvpMatrix = popMatrix();

        //--------Draw SnowMan
        phongReflactance.setDrawMaterial(new Material(MATL_PEARL));

        pushMatrix(mvpMatrix);
        drawSnowMan(mvpMatrix, modelMatrix, normalMatrix);
        mvpMatrix = popMatrix();

        //---------Draw Ground Plane
        phongReflactance.setDrawMaterial(new Material(MATL_GRN_PLASTIC));

        modelMatrix.setScale(0.4, 0.4,0.4);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.LINES, gndStart/floatsPerVertex, gndVerts.length/floatsPerVertex);
    }

    function drawHelicopter(mvpMatrix, modelMatrix, normalMatrix) {

        pushMatrix(mvpMatrix);

        //Draw body
        modelMatrix.setTranslate(1.0, 0.5, 1.3);
        modelMatrix.scale(1,1,-1);
        modelMatrix.scale(0.4, 0.4, 0.4);
        modelMatrix.rotate(currentRotationAngle, 0, 0.7, 1);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, hlcIndex.length, gl.UNSIGNED_BYTE, hlcIStart);

        mvpMatrix = popMatrix();
        pushMatrix(modelMatrix);
        pushMatrix(modelMatrix);
        pushMatrix(mvpMatrix);

        // draw back bone
        modelMatrix.translate(0, 0.3, -1.2);
        modelMatrix.scale(0.1, 0.1, 0.6);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

        mvpMatrix = popMatrix();
        modelMatrix = popMatrix();
        pushMatrix(mvpMatrix);

        // draw spinning torus
        modelMatrix.rotate(90.0, 0, 1, 0);
        modelMatrix.translate(1.7, 0.3, 0.15);
        modelMatrix.scale(0.1, 0.1, 0.1);
        modelMatrix.rotate(currentRotationAngle * 2, 0, 0, 1);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, torStart/floatsPerVertex, torVerts.length/floatsPerVertex);

        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);
        pushMatrix(modelMatrix);

        // draw two paddle
        modelMatrix.translate(2.3, 0, 0);
        modelMatrix.scale(1.8, 0.4, 0.4);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

        modelMatrix = popMatrix();
        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);

        modelMatrix.translate(-2.3, 0, 0);
        modelMatrix.scale(1.8, 0.4, 0.4);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

        mvpMatrix = popMatrix();
        modelMatrix = popMatrix();    // pop the matrix stored after drawing body
        pushMatrix(mvpMatrix);

        // draw upper bone
        modelMatrix.rotate(90.0, 1, 0, 0);
        modelMatrix.scale(0.1, 0.1, 0.1);
        modelMatrix.translate(0, -2, -7);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);

        // draw spinning torus
        modelMatrix.translate(0, 0, -1);
        modelMatrix.rotate(currentRotationAngle * 2, 0, 0, 1);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, torStart/floatsPerVertex, torVerts.length/floatsPerVertex);

        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);
        pushMatrix(modelMatrix);

        // draw two paddle
        modelMatrix.translate(5.5, 0, 0);
        modelMatrix.scale(5, 0.4, 0.4);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);

        modelMatrix = popMatrix();
        mvpMatrix = popMatrix();

        modelMatrix.translate(-5.5, 0, 0);
        modelMatrix.scale(5, 0.4, 0.4);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, brkIndex.length, gl.UNSIGNED_BYTE, brkIStart);
    }

    function drawSphereCone(mvpMatrix, modelMatrix, normalMatrix) {

        pushMatrix(mvpMatrix);

        // draw a sphere
        modelMatrix.setTranslate(1.9, 1.9, 1.0);
        modelMatrix.scale(1,1,-1); // convert to left-handed coord sys to match WebGL display canvas.
        modelMatrix.scale(0.2, 0.2, 0.2);
        modelMatrix.rotate(currentRotationAngle, 1, 0.7, 0);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);

        // draw cylinder3 on cylinder2
        modelMatrix.translate(0, 0, 2 + 2 * Math.abs(Math.cos(Math.PI * currentRotationAngle/180)));
        modelMatrix.scale(0.8,0.8,0.8);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);

        mvpMatrix = popMatrix();

        // draw rod from cylinder
        modelMatrix.rotate(90.0, -90.0, 0, 1);
        modelMatrix.translate(0, 0, 2);
        modelMatrix.scale(0.3, 0.3, 2);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
    }

    function drawSnowMan(mvpMatrix, modelMatrix, normalMatrix) {

        pushMatrix(mvpMatrix);

        // draw a sphere
        modelMatrix.setTranslate(2.0, 0.2, 0.3);
        modelMatrix.scale(1,1,-1); // convert to left-handed coord sys to match WebGL display canvas.
        modelMatrix.scale(0.3, 0.3, 0.3);
        modelMatrix.rotate(180, 0, 1, 0);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

        mvpMatrix = popMatrix();
        pushMatrix(mvpMatrix);

        // draw a sphere
        modelMatrix.translate(0, 0, 1.3);
        modelMatrix.scale(0.6, 0.6, 0.6);
        modelMatrix.translate(0.5 * Math.sin(Math.PI * currentRotationAngle/180), 0, 0);
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);

        mvpMatrix = popMatrix();

        // draw a sphere
        modelMatrix.translate(0, 0, 1.3);
        modelMatrix.scale(0.8, 0.8, 0.6 + 0.2 * Math.cos(Math.PI * currentRotationAngle/180));
        uniformMatrices.drawSetting(mvpMatrix, modelMatrix, normalMatrix);
        gl.drawElements(gl.TRIANGLES, sphIndex.length, gl.UNSIGNED_BYTE, sphIStart);
    }
}
