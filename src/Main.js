// Vertex shader program
var VSHADER_SOURCE =
  //-------------ATTRIBUTES: of each vertex, read from our Vertex Buffer Object
  'attribute vec4 a_Position; \n' +   // vertex position (model coord sys)
  'attribute vec4 a_Normal; \n' +     // vertex normal vector (model coord sys)
  //'attribute vec4 a_Color;\n' +     // Per-vertex colors? they usually
                                      // set the Phong diffuse reflectance
  //-------------UNIFORMS: values set from JavaScript before a drawing command.
  'uniform vec3 u_Kd; \n' +
  'uniform mat4 u_MvpMatrix; \n' +
  'uniform mat4 u_ModelMatrix; \n' +
  'uniform mat4 u_NormalMatrix; \n' +

  //-------------VARYING: Vertex Shader values sent per-pixel to Fragment shader.
  'varying vec3 v_Kd; \n' +
  'varying vec4 v_Position; \n' +
  'varying vec3 v_Normal; \n' +

  'varying vec4 v_Color;\n' +

  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = u_ModelMatrix * a_Position; \n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Kd = u_Kd; \n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +

  // first light source: (YOU write a second one...)
  'uniform vec4 u_Lamp0Pos;\n' +      // Phong Illum: position
  'uniform vec3 u_Lamp0Amb;\n' +      // Phong Illum: ambient
  'uniform vec3 u_Lamp0Diff;\n' +     // Phong Illum: diffuse
  'uniform vec3 u_Lamp0Spec;\n' +     // Phong Illum: specular

  // second light source: user adjustable
  'uniform vec4 u_Lamp1Pos;\n' +      // Phong Illum: position
  'uniform vec3 u_Lamp1Amb;\n' +      // Phong Illum: ambient
  'uniform vec3 u_Lamp1Diff;\n' +     // Phong Illum: diffuse
  'uniform vec3 u_Lamp1Spec;\n' +     // Phong Illum: specular

  // first material definition: you write 2nd, 3rd, etc.
  'uniform vec3 u_Ke;\n' +              // Phong Reflectance: emissive
  'uniform vec3 u_Ka;\n' +              // Phong Reflectance: ambient
  'uniform vec3 u_Ks;\n' +              // Phong Reflectance: specular

  'uniform vec4 u_eyePosWorld; \n' +    // Camera/eye location in world coords.

  'varying vec3 v_Normal;\n' +        // Find 3D surface normal at each pix
  'varying vec4 v_Position;\n' +      // pixel's 3D pos too -- in 'world' coords
  'varying vec3 v_Kd; \n' +           // Find diffuse reflectance K_d per pixel

  'void main() { \n' +
  '  vec3 normal = normalize(v_Normal); \n' +
  '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - v_Position.xyz); \n' +
  '  vec3 light0Direction = normalize(u_Lamp0Pos.xyz - v_Position.xyz);\n' +
  '  float nDotL0 = max(dot(light0Direction, normal), 0.0); \n' +
  '  vec3 H0 = normalize(light0Direction + eyeDirection); \n' +
  '  float nDotH0 = max(dot(H0, normal), 0.0); \n' +

  '  vec3 light1Direction = normalize(u_Lamp1Pos.xyz - v_Position.xyz);\n' +
  '  float nDotL1 = max(dot(light1Direction, normal), 0.0); \n' +
  '  vec3 H1 = normalize(light1Direction + eyeDirection); \n' +
  '  float nDotH1 = max(dot(H1, normal), 0.0); \n' +

  '  float e020 = nDotH0*nDotH0; \n' +
  '  float e040 = e020*e020; \n' +
  '  float e080 = e040*e040; \n' +
  '  float e160 = e080*e080; \n' +
  '  float e320 = e160*e160; \n' +
  '  float e640 = e320*e320; \n' +

  '  float e021 = nDotH1*nDotH1; \n' +
  '  float e041 = e021*e021; \n' +
  '  float e081 = e041*e041; \n' +
  '  float e161 = e081*e081; \n' +
  '  float e321 = e161*e161; \n' +
  '  float e641 = e321*e321; \n' +

  '  vec3 emissive = u_Ke;' +
  '  vec3 ambient = (u_Lamp0Amb + u_Lamp1Amb) * u_Ka;\n' +
  '  vec3 diffuse = (u_Lamp0Diff * nDotL0 + u_Lamp1Diff * nDotL1) * v_Kd;\n' +
  '  vec3 speculr = (u_Lamp0Spec * e640 * e640 + u_Lamp1Spec * e641 * e641) * u_Ks;\n' +
  '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
  '}\n';

var floatsPerVertex = 3;

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);  // 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();       // rotation matrix, made from latest qTot

//==============================================================================
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  winResize();

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Register the Mouse & Keyboard Event-handlers-------------------------------
  //canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) };
  //canvas.onmousemove = function(ev){myMouseMove( ev, gl, canvas) };
  //canvas.onmouseup   = function(ev){myMouseUp(   ev, gl, canvas) };
  window.addEventListener("keypress", myKeyPress);

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables: the scene
  var u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program,   'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');
  if (!u_ModelMatrix  || !u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get matrix storage locations');
    return;
  }
  //  ... for Phong light source0:
  var u_Lamp0Pos  = gl.getUniformLocation(gl.program,   'u_Lamp0Pos');
  var u_Lamp0Amb  = gl.getUniformLocation(gl.program,   'u_Lamp0Amb');
  var u_Lamp0Diff = gl.getUniformLocation(gl.program,   'u_Lamp0Diff');
  var u_Lamp0Spec = gl.getUniformLocation(gl.program,   'u_Lamp0Spec');
  if( !u_Lamp0Pos || !u_Lamp0Amb || !u_Lamp0Diff || !u_Lamp0Spec ) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }
  //  ... for Phong light source1:
  var u_Lamp1Pos  = gl.getUniformLocation(gl.program,   'u_Lamp1Pos');
  var u_Lamp1Amb  = gl.getUniformLocation(gl.program,   'u_Lamp1Amb');
  var u_Lamp1Diff = gl.getUniformLocation(gl.program,   'u_Lamp1Diff');
  var u_Lamp1Spec = gl.getUniformLocation(gl.program,   'u_Lamp1Spec')
  if( !u_Lamp1Pos || !u_Lamp1Amb || !u_Lamp1Diff || !u_Lamp1Spec ) {
    console.log('Failed to get the Lamp1 storage locations');
    return;
  }

  // ... for Phong material/reflectance:
  var u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  var u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  var u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  var u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');

  if(!u_Ke || !u_Ka || !u_Kd || !u_Ks) {
    console.log('Failed to get the Phong Reflectance storage locations');
    return;
  }

  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
  // On-screen aspect ratio for this camera: width/height.
  vpAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    currentAngle = animate(currentAngle);

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
    //gl.uniform4f(u_Lamp0Pos, 6.0, 6.0, 0.0, 1.0);
    gl.uniform4f(u_Lamp0Pos, g_EyeX, g_EyeY, g_EyeZ, 1.0);
    // Set its light output:
    gl.uniform3f(u_Lamp0Amb,  0.4, 0.4, 0.4);   // ambient
    gl.uniform3f(u_Lamp0Diff, 1.0, 1.0, 1.0);   // diffuse
    gl.uniform3f(u_Lamp0Spec, 1.0, 1.0, 1.0);   // Specular

    // Position the second light source in World coords:
    gl.uniform4f(u_Lamp1Pos,  g_lamp1Attr.pos.x, g_lamp1Attr.pos.y, g_lamp1Attr.pos.z, g_lamp1Attr.pos.w);
    gl.uniform3f(u_Lamp1Amb,  g_lamp1Attr.amb.r, g_lamp1Attr.amb.g, g_lamp1Attr.amb.b);
    gl.uniform3f(u_Lamp1Diff, g_lamp1Attr.dif.r, g_lamp1Attr.dif.g, g_lamp1Attr.dif.b);
    gl.uniform3f(u_Lamp1Spec, g_lamp1Attr.spc.r, g_lamp1Attr.spc.g, g_lamp1Attr.spc.b);

    draw(gl, currentAngle, mvpMatrix, u_MvpMatrix,
                           modelMatrix, u_ModelMatrix,
                           normalMatrix, u_NormalMatrix,
                           u_Ke, u_Ka, u_Kd, u_Ks);

    requestAnimationFrame(tick, canvas);
  };
  tick();
}

//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
function initVertexBuffer(gl) {

  makeSphere();
  makeHeliBody();
  makeBrick();
  makeCylinder();
  makeTorus();
  makeGroundGrid();

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
  verticesIndiceArrayBuffer.appendObject(HELICOPTERBODY, hlcIndex.map(function(idx){
    return idx+hlcIndexIncr;
  }));
  verticesIndiceArrayBuffer.appendObject(BRICK, brkIndex.map(function(idx){
    return idx+brkIndexIncr;
  }));
  sphIStart = verticesIndiceArrayBuffer.getObjectStartPosition(SPHERE);
  hlcIStart = verticesIndiceArrayBuffer.getObjectStartPosition(HELICOPTERBODY);
  brkIStart = verticesIndiceArrayBuffer.getObjectStartPosition(BRICK); 

  // We create two separate buffers so that you can modify normals if you wish.
  if (!initArrayBuffer(gl, 'a_Position', verticesArrayBuffer.getArray(), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normalVectorsArrayBuffer.getArray(), gl.FLOAT, 3))  return -1;

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

function initArrayBuffer(gl, attribute, data, type, num) {
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
function makeHeliBody() {
    var helicopterBody = new HelicopterBody();
    hlcVerts = helicopterBody.getVertices();
    hlcNorms = helicopterBody.getNormalVectors();
    hlcIndex = helicopterBody.getVerticesIndices();
}

//==============================================================================
function makeBrick() {
    var brick = new Brick();
    brkVerts = brick.getVertices();
    brkNorms = brick.getNormalVectors();
    brkIndex = brick.getVerticesIndices();
}

//==============================================================================
function makeCylinder() {
  var cylinder = new Cylinder();
  cylVert = cylinder.getVertices();
  cylNorms = cylinder.getNormalVectors();
}

//==============================================================================
function makeSphere () {
  var sphere = new Sphere();
  sphVerts = sphere.getVertices();
  sphNorms = sphere.getNormalVectors();
  sphIndex = sphere.getVerticesIndices();
}

//==============================================================================
function makeTorus() {
  var torus = new Torus();
  torVerts = torus.getVertices();
  torNorms = torus.getNormalVectors();
}

//==============================================================================
function makeGroundGrid() {
  var groundGrid = new GroundGrid();
  gndVerts = groundGrid.getVertices();
  gndNorms = groundGrid.getNormalVectors();
}

//==============================================================================
function draw(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix, u_Ke, u_Ka, u_Kd, u_Ks) {

  modelMatrix = new Matrix4();

  //--------Draw Helicopter
  // Set the Phong materials' reflectance:
  var material = new Material(MATL_EMERALD);
  gl.uniform3f(u_Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
  gl.uniform3f(u_Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
  gl.uniform3f(u_Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
  gl.uniform3f(u_Ks, material.specular[0], material.specular[1], material.specular[2]);

  pushMatrix(mvpMatrix);
  drawHelicopter(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  mvpMatrix = popMatrix();

  //--------Draw Sphere Cone
  // Set the Phong materials' reflectance:
  material = new Material(MATL_COPPER_SHINY);
  gl.uniform3f(u_Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
  gl.uniform3f(u_Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
  gl.uniform3f(u_Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
  gl.uniform3f(u_Ks, material.specular[0], material.specular[1], material.specular[2]);

  pushMatrix(mvpMatrix);
  drawSphereCone(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  mvpMatrix = popMatrix();

  //--------Draw SnowMan
  // Set the Phong materials' reflectance:
  material = new Material(MATL_PEARL);
  gl.uniform3f(u_Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
  gl.uniform3f(u_Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
  gl.uniform3f(u_Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
  gl.uniform3f(u_Ks, material.specular[0], material.specular[1], material.specular[2]);

  pushMatrix(mvpMatrix);
  drawSnowMan(gl, currentAngle, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  mvpMatrix = popMatrix();

  //---------Draw Ground Plane
  // Set the Phong materials' reflectance:
  material = new Material(MATL_GRN_PLASTIC);
  gl.uniform3f(u_Ke, material.emissive[0], material.emissive[1], material.emissive[2]);
  gl.uniform3f(u_Ka, material.ambient[0],  material.ambient[1],  material.ambient[2]);
  gl.uniform3f(u_Kd, material.diffuse[0],  material.diffuse[1],  material.diffuse[2]);
  gl.uniform3f(u_Ks, material.specular[0], material.specular[1], material.specular[2]);

  modelMatrix.setScale(0.4, 0.4,0.4);
  drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix);
  gl.drawArrays(gl.LINES, gndStart/floatsPerVertex, gndVerts.length/floatsPerVertex);
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

function drawSetting(gl, mvpMatrix, u_MvpMatrix, modelMatrix, u_ModelMatrix, normalMatrix, u_NormalMatrix) {
  mvpMatrix.multiply(modelMatrix);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

//==============================================================================
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
