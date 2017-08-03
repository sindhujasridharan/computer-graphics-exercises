
//variables initialization
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var normals = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;
var rotateFlag = false;

//camera and projection parameters
var eye = vec3(0.0, 0.0, 0.0)
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var left = -1;
var right = 1;
var bottom = -1;
var topV = 1;
var near = -10;
var far = 10;

var mvMatrix, pMatrix;
var modelViewLoc, projectionLoc;

//lighting parameters
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.2, 0.8, 1.0);
var materialDiffuse = vec4( 0.5, 0.5, 0.8, 1.0);
var materialSpecular = vec4(0.5, 0.4, 0.8, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var lightPositionLoc, shininessLoc;

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];
    var indices = [a, b, c, a, c, d];

    var normal = vec3(cross(subtract(vertices[b], vertices[a]), subtract(vertices[c], vertices[b])));

    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        normals.push(normal);
    }
}

//init function
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);

    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    //create and load data into buffers - normals and points
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //get shader location for various parameters
    thetaLoc = gl.getUniformLocation(program, "theta");
    modelViewLoc = gl.getUniformLocation( program, "modelView");
    projectionLoc = gl.getUniformLocation( program, "projection");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    //buttons to rotate cube on X, Y, Z axis and to stop rotation
    document.getElementById("rotateX").onclick = function() {
        axis = xAxis;
        rotateFlag=true;
    };
    document.getElementById("rotateY").onclick = function() {
        axis = yAxis;
        rotateFlag=true;
    };
    document.getElementById("rotateZ").onclick = function() {
        axis = zAxis;
        rotateFlag=true;
    };
    document.getElementById("toggleRotation").onclick = function() {
        if(rotateFlag) {
            rotateFlag = false;
        } else {
            rotateFlag = true;
        }
    }
    render();
}

//render function
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(rotateFlag) {
        theta[axis] += 2.0;
    }
    //create modelView matrix
    mvMatrix = lookAt(eye, at, up);

    //create the projection matrix using orthogonal projection
    pMatrix = createProjectionMatrix(left, right, bottom, topV, near, far);

    //compute lighting parameters
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    //set shader parameter values
    gl.uniform3fv(thetaLoc, theta);
    gl.uniformMatrix4fv( modelViewLoc, false, flatten(mvMatrix));
    gl.uniformMatrix4fv( projectionLoc, false, flatten(pMatrix));
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc,materialShininess);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

    requestAnimFrame(render);
}

//create orhtogonal projection matrix
function createProjectionMatrix(left, right, topV, bottom, near, far) {

    var projectionMatrix = mat4();
    projectionMatrix[0][0] = 2.0 / (right - left);
    projectionMatrix[1][1] = 2.0 / (topV - bottom);
    projectionMatrix[2][2] = -2.0 / (far - near);
    projectionMatrix[0][3] = (left + right) / (right - left);
    projectionMatrix[1][3] = (topV + bottom) / (topV - bottom);
    projectionMatrix[2][3] = (near + far) / (far - near);

    return projectionMatrix;
}

