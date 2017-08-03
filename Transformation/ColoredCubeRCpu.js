var gl;
var numberOfVertices = 36;
var theta= [0,0,0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var rx,ry,rz;
var startTime = 0;
var endTime = 0;
var totalTime = 0;
var frameCount = 0;

var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
		vec4(-0.5, 0.5, 0.5, 1.0),
		vec4(0.5, 0.5, 0.5, 1.0),
		vec4(0.5, -0.5, 0.5, 1.0),
		vec4(-0.5, -0.5, -0.5, 1.0),
		vec4(-0.5, 0.5, -0.5, 1.0),
		vec4(0.5, 0.5, -0.5, 1.0),
		vec4(0.5, -0.5, -0.5, 1.0)
		];

var indices = [
		1, 0, 3,
		3, 2, 1,
		2, 3, 7,
		7, 6, 2,
		3, 0, 4,
		4, 7, 3,
		6, 5, 1,
		1, 2, 6,
		4, 5, 6,
		6, 7, 4,
		5, 4, 0,
		0, 1, 5
	];

var vertexColors = [
		[ 0.0, 0.0, 0.0, 1.0 ], 
		[ 1.0, 0.0, 0.0, 1.0 ], 
		[ 1.0, 1.0, 0.0, 1.0 ], 
		[ 0.0, 1.0, 0.0, 1.0 ], 
		[ 0.0, 0.0, 1.0, 1.0 ], 
		[ 1.0, 0.0, 1.0, 1.0 ], 
		[ 1.0, 1.0, 1.0, 1.0 ], 
		[ 0.0, 1.0, 1.0, 1.0 ] 
		];


window.onload = function init(){
	var canvas = document.getElementById( "gl-canvas" );
        
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { 
		alert( "WebGL isn't available" );
	}
	
	gl.enable(gl.DEPTH_TEST);

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// load buffer data for indices, vertices and vertex colors.
	var iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);
	
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
	//
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	// 
	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );  

	transformationMatrixLoc = gl.getUniformLocation(program, "transformationMatrix");
	
	// button event - rotate left
	document.getElementById("rotateX").onclick = function() {
		axis = xAxis;
	};
	// button event - rotate right
	document.getElementById("rotateY").onclick = function() {
		axis = yAxis;
	};
	// button event - rotate right
	document.getElementById("rotateZ").onclick = function() {
		axis = zAxis;
	};

	startTime = new Date().getTime();
	render();
};

// render function	
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	theta[axis] += 2.0;
	
	createRotationMatrix(theta);
	
	transformationMatrix = createTransformationMatrix(rx, ry, rz);
					
	gl.uniformMatrix4fv(transformationMatrixLoc, false, transformationMatrix);	
	
	gl.drawElements(gl.TRIANGLES, numberOfVertices, gl.UNSIGNED_BYTE, 0);
	
	// compute frame rate
	endTime = new Date().getTime();
	frameCount++;
	totalTime = totalTime + (endTime - startTime);
	startTime = endTime;

	if(totalTime > 1000) {
		var fps = frameCount;
		frameCount = 0;
		totalTime -= 1000
		document.getElementById("fps").innerHTML = "<b> FPS:  &nbsp;</b>" + fps;				
	}

	requestAnimFrame(render);	
}

// create rotation matrix - rx, ry, rz
function createRotationMatrix(theta) {
	var angleX = radians(theta[0]);
	var angleY = radians(theta[1]);
	var angleZ = radians(theta[2]);

	var cX = Math.cos(angleX);
    var sX = Math.sin(angleX);
	var cY = Math.cos(angleY);
    var sY = Math.sin(angleY);
	var cZ = Math.cos(angleZ);
    var sZ = Math.sin(angleZ);
	
    rx = [
		1.0,  0.0,  0.0, 0.0,
		0.0,   cX,   sX, 0.0,
		0.0,  -sX,   cX, 0.0,
		0.0,  0.0,  0.0, 1.0 
		];

	ry = [
		cY,	 0.0,  -sY, 0.0,
		0.0, 1.0,  0.0, 0.0,
		sY,  0.0,   cY, 0.0,
		0.0, 0.0,  0.0, 1.0 
		];


    rz = [
		cZ,  sZ, 0.0, 0.0,
		-sZ,  cZ, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0 
		];
}

// create the transformation matrix based on the xyz rotation matrices
function createTransformationMatrix(rx, ry, rz) {
	var matrix = createIdentityMatrix();
	
	matrix = matrixMultiply(matrix, rx);
	matrix = matrixMultiply(matrix, ry);	
	matrix = matrixMultiply(matrix, rz);	

	return matrix;
}

// create identity matrix
function createIdentityMatrix() {
    
    identity = [];
    identity = [
    			1, 0, 0, 0,
    			0, 1, 0, 0,
    			0, 0, 1, 0,
    			0, 0, 0, 1
    		];

    return identity;
}

// multiply two given 4 x 4 matrices to compute the transformation matrix
function matrixMultiply(a, b) {
    matrix = [];
    
    matrix[ 0] = a[0 * 4 + 0] * b[0 * 4 + 0] + a[0 * 4 + 1] * b[1 * 4 + 0] + a[0 * 4 + 2] * b[2 * 4 + 0] + a[0 * 4 + 3] * b[3 * 4 + 0];
    matrix[ 1] = a[0 * 4 + 0] * b[0 * 4 + 1] + a[0 * 4 + 1] * b[1 * 4 + 1] + a[0 * 4 + 2] * b[2 * 4 + 1] + a[0 * 4 + 3] * b[3 * 4 + 1];
    matrix[ 2] = a[0 * 4 + 0] * b[0 * 4 + 2] + a[0 * 4 + 1] * b[1 * 4 + 2] + a[0 * 4 + 2] * b[2 * 4 + 2] + a[0 * 4 + 3] * b[3 * 4 + 2];
    matrix[ 3] = a[0 * 4 + 0] * b[0 * 4 + 3] + a[0 * 4 + 1] * b[1 * 4 + 3] + a[0 * 4 + 2] * b[2 * 4 + 3] + a[0 * 4 + 3] * b[3 * 4 + 3];
    matrix[ 4] = a[1 * 4 + 0] * b[0 * 4 + 0] + a[1 * 4 + 1] * b[1 * 4 + 0] + a[1 * 4 + 2] * b[2 * 4 + 0] + a[1 * 4 + 3] * b[3 * 4 + 0];
    matrix[ 5] = a[1 * 4 + 0] * b[0 * 4 + 1] + a[1 * 4 + 1] * b[1 * 4 + 1] + a[1 * 4 + 2] * b[2 * 4 + 1] + a[1 * 4 + 3] * b[3 * 4 + 1];
    matrix[ 6] = a[1 * 4 + 0] * b[0 * 4 + 2] + a[1 * 4 + 1] * b[1 * 4 + 2] + a[1 * 4 + 2] * b[2 * 4 + 2] + a[1 * 4 + 3] * b[3 * 4 + 2];
    matrix[ 7] = a[1 * 4 + 0] * b[0 * 4 + 3] + a[1 * 4 + 1] * b[1 * 4 + 3] + a[1 * 4 + 2] * b[2 * 4 + 3] + a[1 * 4 + 3] * b[3 * 4 + 3];
    matrix[ 8] = a[2 * 4 + 0] * b[0 * 4 + 0] + a[2 * 4 + 1] * b[1 * 4 + 0] + a[2 * 4 + 2] * b[2 * 4 + 0] + a[2 * 4 + 3] * b[3 * 4 + 0];
    matrix[ 9] = a[2 * 4 + 0] * b[0 * 4 + 1] + a[2 * 4 + 1] * b[1 * 4 + 1] + a[2 * 4 + 2] * b[2 * 4 + 1] + a[2 * 4 + 3] * b[3 * 4 + 1];
    matrix[10] = a[2 * 4 + 0] * b[0 * 4 + 2] + a[2 * 4 + 1] * b[1 * 4 + 2] + a[2 * 4 + 2] * b[2 * 4 + 2] + a[2 * 4 + 3] * b[3 * 4 + 2];
    matrix[11] = a[2 * 4 + 0] * b[0 * 4 + 3] + a[2 * 4 + 1] * b[1 * 4 + 3] + a[2 * 4 + 2] * b[2 * 4 + 3] + a[2 * 4 + 3] * b[3 * 4 + 3];
    matrix[12] = a[3 * 4 + 0] * b[0 * 4 + 0] + a[3 * 4 + 1] * b[1 * 4 + 0] + a[3 * 4 + 2] * b[2 * 4 + 0] + a[3 * 4 + 3] * b[3 * 4 + 0];
    matrix[13] = a[3 * 4 + 0] * b[0 * 4 + 1] + a[3 * 4 + 1] * b[1 * 4 + 1] + a[3 * 4 + 2] * b[2 * 4 + 1] + a[3 * 4 + 3] * b[3 * 4 + 1];
    matrix[14] = a[3 * 4 + 0] * b[0 * 4 + 2] + a[3 * 4 + 1] * b[1 * 4 + 2] + a[3 * 4 + 2] * b[2 * 4 + 2] + a[3 * 4 + 3] * b[3 * 4 + 2];
    matrix[15] = a[3 * 4 + 0] * b[0 * 4 + 3] + a[3 * 4 + 1] * b[1 * 4 + 3] + a[3 * 4 + 2] * b[2 * 4 + 3] + a[3 * 4 + 3] * b[3 * 4 + 3];
    return matrix;
}
