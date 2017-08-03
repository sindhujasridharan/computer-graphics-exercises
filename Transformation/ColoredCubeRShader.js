var numberOfVertices = 36;
var gl;
var thetaLoc;
var theta= [0,0,0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var startTime = 0;
var endTime = 0;
var totalTime =0;
var frameCount =0;

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

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );  

	// get uniform variable from shader
	thetaLoc = gl.getUniformLocation(program, "theta");  

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
	
	gl.uniform3fv(thetaLoc, theta);
	
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




