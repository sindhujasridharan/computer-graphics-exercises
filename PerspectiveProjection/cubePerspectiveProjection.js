
var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0) 
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

var near = 3.0;
var far = 10.0;
var zDiff = far - near;
var right = 1.5;
var left = -1.5;
var xDiff = right - left;
var topV =  1.5;
var bottom = -1.5;
var yDiff = topV - bottom;

var mvMatrix, pMatrix;
var modelView, projection;

var eye = vec3(0.0, 0.0, 4.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);  
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );

    // slider options
    // slider for near/far
    document.getElementById("zSlider").onchange = function() {
        near = parseFloat(event.srcElement.value);   
        far = near + zDiff;             
    }       
    
    // slider for top/bottom
    document.getElementById("ySlider").onchange = function() {
        bottom = parseFloat(event.srcElement.value);
        //topV = -bottom;
        topV = bottom + yDiff;        
    }       
    
    // slider for left/right
    document.getElementById("xSlider").onchange = function() {
        left = parseFloat(event.srcElement.value);
        //right = -left;
        right = left + xDiff;        
    }       

    // slider for eye position
    document.getElementById("xView").onchange = function() {
        eye[0] = parseFloat(event.srcElement.value);    
    }
     document.getElementById("yView").onchange = function() {
        eye[1] = parseFloat(event.srcElement.value);    
    }

    document.getElementById("zView").onchange = function() {
        eye[2] = parseFloat(event.srcElement.value);    
    }


    document.getElementById("zNear").onchange = function() {
        near = parseFloat(event.srcElement.value);                   
    }     

    document.getElementById("zFar").onchange = function() {
        far = parseFloat(event.srcElement.value);                   
    }

    document.getElementById("yTop").onchange = function() {
        topV = parseFloat(event.srcElement.value);                   
    }     

    document.getElementById("yBottom").onchange = function() {
        bottom = parseFloat(event.srcElement.value);                   
    }

    document.getElementById("xLeft").onchange = function() {
        left = parseFloat(event.srcElement.value);                   
    }     

    document.getElementById("xRight").onchange = function() {
        right = parseFloat(event.srcElement.value);                   
    }     

    render(); 
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    mvMatrix = lookAt(eye, at, up);
    pMatrix = createProjectionMatrix(left, right, topV, bottom, near, far);
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
            
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame(render);
}

// perspective projection matrix
function createProjectionMatrix(left, right, topV, bottom, near, far) {
    
    var projectionMatrix = mat4();
    projectionMatrix[0][0] = (2*near)/(right-left);
    projectionMatrix[0][1] = 0;
    projectionMatrix[0][2] = (right+left)/(right-left);
    projectionMatrix[0][3] = 0;
    projectionMatrix[1][0] = 0;
    projectionMatrix[1][1] = (2*near)/(topV-bottom);
    projectionMatrix[1][2] = (topV+bottom)/(topV-bottom);
    projectionMatrix[1][3] = 0;
    projectionMatrix[2][0] = 0;
    projectionMatrix[2][1] = 0;
    projectionMatrix[2][2] = -(far+near)/(far-near);
    projectionMatrix[2][3] = (-2*far*near)/(far-near);
    projectionMatrix[3][0] = 0;
    projectionMatrix[3][1] = 0;
    projectionMatrix[3][2] = -1;
    projectionMatrix[3][3] = 0;

    return projectionMatrix;
}
