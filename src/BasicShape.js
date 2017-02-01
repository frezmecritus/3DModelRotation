function BasicShape() {}

BasicShape.prototype.getVertices = function() {
    return this.vertices;
}

BasicShape.prototype.getNormalVectors = function() {
    return this.normalVectors;
}

BasicShape.prototype.getVerticesIndices = function() {
    return this.verticesIndices;
}

/**
 * A brick shape aligned with Z axis.
 */
Brick.prototype = Object.create(BasicShape.prototype);
Brick.prototype.constructor = Brick;
function Brick() {
    this.vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);

    this.normalVectors = new Float32Array([
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    this.verticesIndices = new Uint8Array([
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
     12,13,14,  12,14,15,    // left
     16,17,18,  16,18,19,    // down
     20,21,22,  20,22,23     // back
    ]);
}

/**
 * The body of a helicoptor, aligned with Z axis.
 */
HelicopterBody.prototype = Object.create(BasicShape.prototype);
HelicopterBody.prototype.constructor = HelicopterBody;
function HelicopterBody() {
    this.vertices = new Float32Array([
     -0.4, 0.6,-0.6,   0.4, 0.6,-0.6,   0.4, 0.0,-0.6,  -0.4, 0.0,-0.6, // v0-v1-v2-v3 back
     -0.4, 0.6,-0.6,  -0.4, 0.6, 0.1,   0.4, 0.6, 0.1,   0.4, 0.6,-0.6, // v0-v8-v7-v1 up
      0.4,-0.3, 0.5,   0.4, 0.0, 0.6,  -0.4, 0.0, 0.6,  -0.4,-0.3, 0.5, // v4-v6-v9-v5 front
      0.4, 0.0, 0.6,   0.4, 0.6, 0.1,  -0.4, 0.6, 0.1,  -0.4, 0.0, 0.6, // v6-v7-v8-v9 front-top
      0.4, 0.0,-0.6,   0.4,-0.3, 0.5,  -0.4,-0.3, 0.5,  -0.4, 0.0,-0.6, // v2-v4-v5-v3 down
      0.4, 0.6,-0.6,   0.4, 0.6, 0.1,   0.4, 0.0, 0.6,   0.4,-0.3, 0.5,   0.4, 0.0,-0.6, // v1-v7-v6-v4-v2 right
     -0.4, 0.6,-0.6,  -0.4, 0.0,-0.6,  -0.4,-0.3, 0.5,  -0.4, 0.0, 0.6,  -0.4, 0.6, 0.1, // v0-v3-v5-v9-v8 left
    ]);

    this.normalVectors = new Float32Array([
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,  // v0-v1-v2-v3 back
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v8-v7-v1 up
     0.0,-1.0, 3.0,   0.0,-1.0, 3.0,   0.0,-1.0, 3.0,   0.0,-1.0, 3.0,  // front
     0.0, 5.0, 6.0,   0.0, 5.0, 6.0,   0.0, 5.0, 6.0,   0.0, 5.0, 6.0,  // front-top
     0.0,-1.1, 0.3,   0.0,-1.1, 0.3,   0.0,-1.1, 0.3,   0.0,-1.1, 0.3,  // down
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v1-v7-v6-v4-v2 right
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v0-v3-v5-v9-v8 left
    ]);

    this.verticesIndices = new Uint8Array([
     0, 1, 2,   0, 2, 3,               // back
     4, 5, 6,   4, 6, 7,               // top
     8, 9,10,   8,10,11,               // front
    12,13,14,  12,14,15,               // front-top
    16,17,18,  16,18,19,               // bottom
    20,21,22,  20,22,23,  20,23,24,    // right
    25,26,27,  25,27,28,  25,28,29,    // left
    ]);
}

/**
 *  Make a sphere from one OpenGL TRIANGLE_STRIP primitive.
 */
Sphere.prototype = Object.create(BasicShape.prototype);
Sphere.prototype.constructor = Sphere;
function Sphere() {
    var positions = [];
    var indices = [];

    var numberOfDivision = 13;
    var anglePerDivision = Math.PI / numberOfDivision;
    var theta = [], phi = [];
    for (var i = 0; i <= numberOfDivision; i++) {
        phi.push( i * anglePerDivision );
        theta.push( 2 * i * anglePerDivision );
    }

    phi.map(function(p){
        theta.map(function(t){
            var cosTheta = Math.cos(t);
            var sinTheta = Math.sin(t);
            var cosPhi = Math.cos(p);
            var sinPhi = Math.sin(p);
            positions.push( sinPhi * sinTheta); // X
            positions.push( cosPhi );           // Y
            positions.push( sinPhi * cosTheta); // Z
        });
    });

    // Generate indices
    for (j = 0; j < numberOfDivision; j++) {
        for (i = 0; i < numberOfDivision; i++) {
        var p1 = j * (numberOfDivision+1) + i;
        var p2 = p1 + (numberOfDivision+1);

        indices.push(p1);
        indices.push(p2);
        indices.push(p1 + 1);

        indices.push(p1 + 1);
        indices.push(p2);
        indices.push(p2 + 1);
        }
    }

  this.vertices = new Float32Array(positions);
  this.normalVectors = new Float32Array(positions);
  this.verticesIndices = new Uint8Array(indices);
}

/**
 *  Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
 *  'stepped spiral' design described in notes.
 * Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
 */
Cylinder.prototype = Object.create(BasicShape.prototype);
Cylinder.prototype.constructor = Cylinder;
function Cylinder() {
    var capVerts = 32;    // # of vertices around the topmost 'cap' of the shape
    var botRadius = 1.0;  // radius of bottom of cylinder (top always 1.0)

    var cylVerts = [];
    var cylNorms = [];

    // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
    // v counts vertices: j counts array elements (vertices * elements per vertex)
    for(var v=1; v<=2*capVerts+1; v++) {
        // skip the first vertex--not needed.
        if(v%2==0) {       
            // position even# vertices at center of cylinder's top cap:
            cylVerts.push(0.0, 0.0, 1.0);
        } else {  
            // position odd# vertices around the top cap's outer edge;
            // theta = 2*PI*(v-1)/(2*capVerts) = PI*(v-1)/capVerts
            var theta = Math.PI*(v-1)/capVerts;
            cylVerts.push(Math.cos(theta), Math.sin(theta), 1.0);
        }
        cylNorms.push(0.0, 0.0, 1.0);
    }
    // Create the cylinder side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    for(var v=0; v<=2*capVerts+1; v++) {
        if(v%2==0) { 
            // position all even# vertices along top cap:
            var theta = Math.PI*(v)/capVerts;
            cylVerts.push(Math.cos(theta), Math.sin(theta), 1.0);
            cylNorms.push(Math.cos(theta), Math.sin(theta), 0.0);
        } else {   
            // position all odd# vertices along the bottom cap:
            var theta = Math.PI*(v-1)/capVerts;
            cylVerts.push(botRadius*Math.cos(theta), botRadius*Math.sin(theta), -1.0);
            cylNorms.push(Math.cos(theta), Math.sin(theta), 0.0);
        }
    }
    // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
    // v counts the vertices in the cap; j continues to count array elements
    for(var v=0; v<=2*capVerts; v++) {
        if(v%2==0) {  
            // position even# vertices around bot cap's outer edge
            var theta = Math.PI*(v)/capVerts;
            cylVerts.push(botRadius*Math.cos(theta), botRadius*Math.sin(theta), -1.0);
        } else {        
            // position odd# vertices at center of the bottom cap:
            cylVerts.push(0.0, 0.0, -1.0);
        }
        cylNorms.push(0.0, 0.0, -1.0);
    }

    this.vertices = new Float32Array(cylVerts);
    this.normalVectors = new Float32Array(cylNorms);
}
Cylinder.prototype.getVerticesIndices = function(){};

/**
 * Create a torus centered at the origin that circles the z axis.
 */
Torus.prototype = Object.create(BasicShape.prototype);
Torus.prototype.constructor = Torus;
function Torus() {
    var rbend = 1.0;    // Radius of circle formed by torus' bent bar
    var rbar = 0.5;     // radius of the bar we bent to form torus
    var barSlices = 23; // # of bar-segments in the torus: >=3 req'd;
                        // more segments for more-circular torus
    var barSides = 13;  // # of sides of the bar (and thus the
                        // number of vertices in its cross-section)
                        // >=3 req'd;
                        // more sides for more-circular cross-section
    var torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
    var torNorms = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));


    var phi=0, theta=0;                   // begin torus at angles 0,0
    var thetaStep = 2*Math.PI/barSlices;  // theta angle between each bar segment
    var phiHalfStep = Math.PI/barSides;   // half-phi angle between each side of bar
                                            // (WHY HALF? 2 vertices per step in phi)
    // s counts slices of the bar; v counts vertices within one slice; j counts
    // array elements (Float32) (vertices*#attribs/vertex) put in torVerts array.
    for(s=0,j=0; s<barSlices; s++) {    // for each 'slice' or 'ring' of the torus:
        for(v=0; v< 2*barSides; v++, j+=floatsPerVertex) {    // for each vertex in this slice:
        if(v%2==0)  { // even #'d vertices at bottom of slice,
            torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
                                                Math.cos((s)*thetaStep);
                    //  x = (rbend + rbar*cos(phi)) * cos(theta)
            torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
                                                Math.sin((s)*thetaStep);
                    //  y = (rbend + rbar*cos(phi)) * sin(theta)
            torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
                    //  z = -rbar  *   sin(phi)

            //N_torus = (cos(phi)*cos(theta),  cos(phi)*sin(theta), -sin(phi)
            torNorms[j  ] = Math.cos((v)*phiHalfStep) * Math.cos((s)*thetaStep);
            torNorms[j+1] = Math.cos((v)*phiHalfStep) * Math.sin((s)*thetaStep);
            torNorms[j+2] = Math.sin((v)*phiHalfStep);
        }
        else {        // odd #'d vertices at top of slice (s+1);
                        // at same phi used at bottom of slice (v-1)
            torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
                                                Math.cos((s+1)*thetaStep);
                    //  x = (rbend + rbar*cos(phi)) * cos(theta)
            torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
                                                Math.sin((s+1)*thetaStep);
                    //  y = (rbend + rbar*cos(phi)) * sin(theta)
            torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
                    //  z = -rbar  *   sin(phi)

            torNorms[j  ] = Math.cos((v-1)*phiHalfStep) * Math.cos((s+1)*thetaStep);
            torNorms[j+1] = Math.cos((v-1)*phiHalfStep) * Math.sin((s+1)*thetaStep);
            torNorms[j+2] = Math.sin((v-1)*phiHalfStep);
        }
        }
    }

    // Repeat the 1st 2 vertices of the triangle strip to complete the torus:
    torVerts[j  ] = rbend + rbar; // copy vertex zero;
            //  x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
    torVerts[j+1] = 0.0;
            //  y = (rbend + rbar*cos(phi==0)) * sin(theta==0)
    torVerts[j+2] = 0.0;
            //  z = -rbar  *   sin(phi==0)
    torNorms[j  ] = 1.0;
    torNorms[j+1] = 0.0;
    torNorms[j+2] = 0.0;

    j+=floatsPerVertex; // go to next vertex:
    torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
            //  x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
    torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
            //  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep)
    torVerts[j+2] = 0.0;
            //  z = -rbar  *   sin(phi==0)
    torNorms[j  ] = Math.cos(thetaStep);
    torNorms[j+1] = Math.sin(thetaStep);
    torNorms[j+2] = 0.0;

    this.vertices = torVerts;
    this.normalVectors = torNorms;
}
Torus.prototype.getVerticesIndices = function(){};

/**
 * Create a list of vertices that create a large grid of lines in the x,y plane
 * centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
 */
GroundGrid.prototype = Object.create(BasicShape.prototype);
GroundGrid.prototype.constructor = GroundGrid;
function GroundGrid() {
    var xcount = 100;     // # of lines to draw in x,y to make the grid.
    var ycount = 100;
    var xymax = 50.0;     // grid size; extends to cover +/-xymax in x and y.\

    // Create an (global) array to hold this ground-plane's vertices:
    var gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
                // draw a grid made of xcount+ycount lines; 2 vertices per line.

    var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
    var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))

    // First, step thru x values as we make vertical lines of constant-x:
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
        if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
        gndVerts[j  ] = -xymax + (v  )*xgap;  // x
        gndVerts[j+1] = -xymax;               // y
        gndVerts[j+2] = 0.0;                  // z
        }
        else {        // put odd-numbered vertices at (xnow, +xymax, 0).
        gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
        gndVerts[j+1] = xymax;                // y
        gndVerts[j+2] = 0.0;                  // z
        }
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
        if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
        gndVerts[j  ] = -xymax;               // x
        gndVerts[j+1] = -xymax + (v  )*ygap;  // y
        gndVerts[j+2] = 0.0;                  // z
        }
        else {          // put odd-numbered vertices at (+xymax, ynow, 0).
        gndVerts[j  ] = xymax;                // x
        gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
        gndVerts[j+2] = 0.0;                  // z
        }
    }
    // Set norm of gnd (0, 0, 1)
    var gndNorms = new Float32Array(gndVerts.length);
    for(i=0; i<gndVerts.length; i+=floatsPerVertex) {
        gndNorms[i  ] = 0;
        gndNorms[i+1] = 0;
        gndNorms[i+2] = 1;
    }

    this.vertices = gndVerts;
    this.normalVectors = gndNorms;
}
GroundGrid.prototype.getVerticesIndices = function(){};

if(typeof exports !== 'undefined') {
    module.exports = {Brick, HelicopterBody, Sphere, Cylinder, Torus, GroundGrid};
}
