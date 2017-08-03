// variabes initialization
var canvas;
var gl;

var numTimesToSubdivide =4;

var index = 0;

var points = [];
var normals = [];

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var topV = 2.0;


var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


var modelView, projection;
var modelViewLoc, projectionLoc;

// lighting variables
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.5, 0.2, 0.8, 1.0);
var materialDiffuse = vec4( 0.5, 0.5, 0.8, 1.0);
var materialSpecular = vec4(0.5, 0.4, 0.8, 1.0);
var materialShininess = 10.0;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var lightPositionLoc, shininessLoc;
var rotateLeft = false;
var rotateRight = false;

//sphere co-ordinates
function triangle(a, b, c) {

     points.push(a);
     points.push(b);
     points.push(c);

     normals.push(a[0],a[1], a[2]);
     normals.push(b[0],b[1], b[2]);
     normals.push(c[0],c[1], c[2]);

     index += 3;

}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    //load data into buffers - normal and points
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    //buttons to rotate left/ right/ stop rotation
    document.getElementById( "rotateLeft" ).onclick = function () {
       rotateLeft = true;
       rotateRight = false;
    };
    document.getElementById( "rotateRight" ).onclick = function () {
        rotateRight = true;
        rotateLeft = false;
    };
   
    document.getElementById( "toggleRotation" ).onclick = function() {
        if(rotateRight || rotateLeft) {
            rotateLeft = false;
            rotateRight = false;
        } else {
            rotateLeft = true;
        }
    }
   

    render();
}

// render function
function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(rotateLeft) {
        theta += 0.015;
    } else if(rotateRight) {
        theta -= 0.015
    }

    // camera and projection matrix
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    modelView = lookAt(eye, at , up);
    projection = createProjectionMatrix(left, right, bottom, topV, near, far);

    //lighting variables
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    //assign values to shader parameters
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc,materialShininess);
    
    for( var i=0; i<index; i+=3) {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

    requestAnimFrame(render);
}

//compute orthogonal projection matrix
function createProjectionMatrix(left, right, bottom, topV, near, far) {

    var projectionMatrix = mat4();
    projectionMatrix[0][0] = 2.0 / (right - left);
    projectionMatrix[1][1] = 2.0 / (topV - bottom);
    projectionMatrix[2][2] = -2.0 / (far - near);
    projectionMatrix[0][3] = (left + right) / (right - left);
    projectionMatrix[1][3] = (topV + bottom) / (topV - bottom);
    projectionMatrix[2][3] = (near + far) / (far - near);

    return projectionMatrix;
}