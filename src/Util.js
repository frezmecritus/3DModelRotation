var floatsPerVertex = 3;

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);  // 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();       // rotation matrix, made from latest qTot

// String for custom ArrayBuffer's GET and SET action.
var BRICK = 'brick';
var SPHERE = 'sphere';
var CYLINDER = 'cylinder';
var HELICOPTERBODY = 'Helicopter_body';
var TORUS = 'torus';
var GROUNDGRID = 'ground_grid';

var ANGLE_STEP = 45.0;

var g_EyeX = 6, g_EyeY = -2, g_EyeZ = 3;
var g_centerX = 0, g_centerY = 0, g_centerZ = 0;
var g_upX = 0, g_upY = 0, g_upZ = 1;
var g_near = 1, g_far = 50;

var viewSet = {
  eye:    {x: 6.8, y: 4.0, z: 0.5},
  center: {x: 0.0, y: 0.0, z: 0.5},
  up:     {x: 0.0, y: 0.0, z: 1.0},
  rotate: {theta: 210.0, phi: 0.0, tilt: 0.0}
};

var LAMP0 = {
  pos: {x: g_EyeX, y:g_EyeY, z: g_EyeZ, w: 1.0},
  amb: {r: 0.4, g: 0.4, b: 0.4},
  dif: {r: 1.0, g: 1.0, b: 1.0},
  spc: {r: 1.0, g: 1.0, b: 1.0}
};

var LAMP1 = {
  pos: {x: 6.0, y:-2.0, z: 3.0, w: 1.0},
  amb: {r: 0.1, g: 0.0, b: 0.2},
  dif: {r: 0.0, g: 0.1, b: 0.2},
  spc: {r: 0.1, g: 0.0, b: 0.2}
};

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

// web initialization
$( function() {
  $('#lighting_panel').hide();
  lamb1update();
  $( "input" )
    .keyup(function() {
      var value = $( this ).val();
      var name  = $( this ).attr('id');

      if(!isNaN(value)) {
        arr = name.split("_");
        //console.log( arr[0] + ' ' + arr[1] + ' ' + arr[2]);
        LAMP1[ arr[1] ][ arr[2] ] = value;
      }
      lamb1update();
    })
    .keyup();
  //alert("Press 'h' for input instruction");
});

function main() {
    var canvas = document.getElementById('webgl');

    winResize();
    // GLstart(canvas);
    var sceneManager = new SceneManager(canvas);
    sceneManager.start();
    
    // Register the Mouse & Keyboard Event-handlers-------------------------------
    //canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) };
    //canvas.onmousemove = function(ev){myMouseMove( ev, gl, canvas) };
    //canvas.onmouseup   = function(ev){myMouseUp(   ev, gl, canvas) };
    window.addEventListener("keypress", myKeyPress);
}


function lamb1update() {
  Object.keys(LAMP1).map(k1 => {
      Object.keys(LAMP1[k1]).map(k2 =>{
        if (k2=='w') {
          return;
        }
        var value = LAMP1[k1][k2];
        var DOMId = '#lamp1_'+k1+'_'+k2;
        $(DOMId).val(value);
      });
  });
}

//===============================================================================
// keyboard input event-listener callbacks
function myKeyPress(ev) {

  switch(ev.keyCode) {
    // viewpoint changes
    case 101:   // The e key was pressed
      viewSet.eye.x += 0.1;
      viewSet.center.x += 0.1;
      break;
    case 113:   // The q key was pressed
      viewSet.eye.x -= 0.1;
      viewSet.center.x -= 0.1;
      break;
    case 100:   // The d key was pressed
      viewSet.eye.y += 0.1;
      viewSet.center.y += 0.1;
      break;
    case 97:    // The a key was pressed
      viewSet.eye.y -= 0.1;
      viewSet.center.y -= 0.1;
      break;
    case 119:   // The w key was pressed
      viewSet.eye.z += 0.1;
      viewSet.center.z += 0.1;
      break;
    case 115:   // The s key was pressed
      viewSet.eye.z -= 0.1;
      viewSet.center.z -= 0.1;
      break;

    // perspective box size changes
    case 99:    // The c key was pressed
      viewSet.rotate.theta -= 1;
      updateLookAt();
      break;
    case 122:   // The z key was pressed
      viewSet.rotate.theta += 1;
      updateLookAt();
      break;
    case 120:   // The x key was pressed
      viewSet.center.z += 0.03;
      //viewSet.rotate.tilt += 1;
      //updateLookAt();
      break;
    case 88:    // The X key was pressed
      viewSet.center.z -= 0.03;
      //viewSet.rotate.tilt -= 1;
      //updateLookAt();
      break;
    case 112:   // The p key was pressed
      $('#lighting_panel').toggle();
      break;
    case 72:    // h, H for help
    case 104:
      alert("Hotkeys:\n\n"+
            "Adjustable Camera:\n" +
            "'e' 'q' 'd' 'a' 'w' 's' for position move\n" +
            "'c' 'z' for horizontal rotation, 'x' 'X' for tilting\n\n" +
            "Lighting Panel:\n" +
            "'p' will show lighting control panel on the bottom of the page.");
      break;
    default:
      console.log('press:' + ev.keyCode);
      break;
  }
}

function updateLookAt () {

  var thetaD = viewSet.rotate.theta * Math.PI / 180;
  //var phiD = viewSet.rotate.phi * Math.PI / 180;

  // var newX = Math.cos(thetaD) * Math.cos(phiD);
  // var newY = Math.sin(thetaD) * Math.cos(phiD);
  // var newZ = Math.sin(phiD);

  viewSet.center.x = viewSet.eye.x + 10 * Math.cos(thetaD);
  viewSet.center.y = viewSet.eye.y + 10 * Math.sin(thetaD);
}

//==============================================================================
// Called when user re-sizes their browser window , because our HTML file
// contains:  <body onload="main()" onresize="winResize()">
function winResize() {

  var nuCanvas = document.getElementById('webgl');
  var nuGL = getWebGLContext(nuCanvas);

  nuCanvas.width = innerWidth;
  nuCanvas.height = innerHeight;
}