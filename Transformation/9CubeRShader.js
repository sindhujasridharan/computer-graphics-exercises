var gl;
var numberOfVertices = 36;
var angle = 45;
var scale = 0.3;
var cubesData = [];
var startTime = 0;
var endTime = 0;
var totalTime =0;
var frameCount =0;
var theta = degToRad[angle];
var theta = degToRad[-angle];

// vertices data
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

// indices data
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

// vertex color data
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

	// setup web Gl from WebGlUtils.js
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { 
		alert( "WebGL isn't available" );
	}
	
	gl.enable(gl.DEPTH_TEST);

	// configure gl and initialize shaders
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );

	// set cubes data
	// each cube contains the rotation angles and the translation values
	//cube1
	cubesData.push({
		glProgram: program,
		xRotationValue: angle,	
		yRotationValue: 0,
		zRotationValue: 0,
		thetaIndicator: [1,0,0], 
		translationValue: [-0.7,0.7,0.5]
	});

	//cube2
	cubesData.push({
		glProgram: program,
		xRotationValue: angle,
		yRotationValue: angle,
		zRotationValue: 0,
		thetaIndicator: [1,1,0], 
		translationValue: [-0.1, 0.7, 0.5]
	});

	//cube3
	cubesData.push({
		glProgram: program,
		xRotationValue: angle,
		yRotationValue: 0,
		zRotationValue: angle,
		thetaIndicator: [1,0,1], 
		translationValue: [0.5, 0.7, 0.5]
	});

	//cube4	
	cubesData.push({
		glProgram: program,
		xRotationValue: -angle,
		yRotationValue: -angle,
		zRotationValue: 0,
		thetaIndicator: [-1,-1,0], 
		translationValue: [-0.7, 0.1, 0.5]
	});

	//cube5
	cubesData.push({
		glProgram: program,
		xRotationValue: 0,
		yRotationValue: angle,
		zRotationValue: 0,
		thetaIndicator: [0,1,0], 
		translationValue: [-0.1, 0.1, 0.5]
	});

	//cube6	
	cubesData.push({
		glProgram: program,
		xRotationValue: 0,
		yRotationValue: angle,
		zRotationValue: angle,
		thetaIndicator: [0,1,1], 
		translationValue: [0.5, 0.1, 0.5]
	});

	//cube7
	cubesData.push({
		glProgram: program,
		xRotationValue: -angle,
		yRotationValue: 0,
		zRotationValue: -angle,
		thetaIndicator: [-1,0,-1], 
		translationValue: [-0.7, -0.6, 0.5]
	});

	//cube8
	cubesData.push({
		glProgram: program,
		xRotationValue: 0,
		yRotationValue: -angle,
		zRotationValue: -angle,
		thetaIndicator: [0,-1,-1], 
		translationValue: [-0.1, -0.6, 0.5]
	});

	//cube9
	cubesData.push({
		glProgram: program,
		xRotationValue: 0,
		yRotationValue: 0,
		zRotationValue: angle,
		thetaIndicator: [0,0,1], 
		translationValue: [0.5, -0.6, 0.5]
	});
	
	cubesData.forEach(function(object) {
		// init data
		var glProgram = object.glProgram;
		var objectVertices = object.vertices;
		var objectIndices = object.indices;
		var objectColors = object.vertexColors;
		
		gl.useProgram(glProgram);

		// load buffers - indices, colors and vertices for each cube in GPU
		var iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),gl.STATIC_DRAW);
	
		// load buffer data 
		var cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
		//
		var vColor = gl.getAttribLocation(glProgram, "vColor");
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vColor);
		//
		var bufferId = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		//		
		var vPosition = gl.getAttribLocation( glProgram, "vPosition" );
		gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition ); 

	});

	// render the initial frame
	startTime = new Date().getTime();
	render();	
	  

};


// render function	
function render(iRot) {
	iRot *= 0.005;
	// change angle value on slider value change
	document.getElementById("angleSlider").onchange = function() {	

		angle = parseFloat(event.srcElement.value);	
		
		cubesData.forEach(function(object) {
			if(object.thetaIndicator[0] != 0) {
				if(object.thetaIndicator[0] < 0) {
					object.xRotationValue = -angle;
				} else {
					object.xRotationValue = angle;
				}				
			}
			if(object.thetaIndicator[1] != 0) {
				if(object.thetaIndicator[1] < 0) {
					object.yRotationValue = -angle;
				} else {
					object.yRotationValue = angle;
				}	
			}
			if(object.thetaIndicator[2] != 0) {
				if(object.thetaIndicator[2] < 0) {
					object.zRotationValue = -angle;
				} else {
					object.zRotationValue = angle;
				}	
			}
		});


	}
	
	// change scale value on slider value change
	document.getElementById("scaleSlider").onchange = function() {
		scale = event.srcElement.value;
	}

	// render each cube w.r.t its translation and rotational info
	cubesData.forEach(function(object) {
		// init data
		var glProgram = object.glProgram;
		
		gl.useProgram(glProgram);

		// get the uniform variables location from the shader
		thetaLoc = gl.getUniformLocation(glProgram, "thetaValue");
		translationLoc = gl.getUniformLocation(glProgram, "translationValue");
		scaleLoc = gl.getUniformLocation(glProgram, "scaleValue");

		var xRotationValue = object.xRotationValue * iRot;
		var yRotationValue = object.yRotationValue * iRot;
		var zRotationValue = object.zRotationValue * iRot;

		var thetaValue = [xRotationValue, yRotationValue, zRotationValue];
		// 
		gl.uniform3fv(thetaLoc, thetaValue);
		gl.uniform3fv(translationLoc, object.translationValue);
		gl.uniform1f(scaleLoc, scale);

		// draw the cube
		gl.drawElements(gl.TRIANGLES, numberOfVertices, gl.UNSIGNED_BYTE, 0);
	});

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

// convert degree to radians for the rotational angle
function degToRad(d) {
    return d * Math.PI / 180;
}