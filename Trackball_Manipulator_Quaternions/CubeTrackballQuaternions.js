var numberOfVertices = 36;
var gl;
var xAxis = 1;
var yAxis = 0;
var zAxis = 0;
var rquatVector = vec4(1, 0, 0, 0);
var cubeRotation = false;
var mousedown = false
var previousXPos = 0;
var previousYPos = 0;
var previousZPos = 0;
var theta = 0.0;
var startTime = 0;
var endTime = 0;
var totalTime = 0;
var frameCount = 0;


// cuber vertices
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

// cube indices
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

// cube vertex colors
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


// on load
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
	rQuatLoc = gl.getUniformLocation(program, "rquat");  
	gl.uniform4fv(rQuatLoc, rquatVector);

	// on mouse down set initial position of the mouse to trigger rotation on mouse move
	canvas.addEventListener("mousedown", function(event) {	
		//set mouse move flag to true	
		mousedown = true;	
		
		// get x,y position
		var vertexX = -1.0 + event.clientX*2.0/canvas.width;	
		var vertexY = -1 + (canvas.height-event.clientY)*2/canvas.height;
		var vertexZ;
		//set z position based on x,y pos. if x^2 + y^2 >= 1 set z = 0 to avoid NaN error
		if((1.0 - vertexX*vertexX - vertexY * vertexY) <= 0.0) {
			vertexZ = 0.0;
		} else {
			vertexZ = Math.sqrt(1.0 - (vertexX * vertexX) - (vertexY * vertexY));
		}

		// set current x,y,z pos to prev pos for continuous rotation
		previousXPos = vertexX;
		previousYPos = vertexY;
		previousZPos = vertexZ;
		
	});	

	// on mouse up stop cube rotation
	canvas.addEventListener("mouseup", function(event) {
		// set mouse move and cube rotation to false
		mousedown = false;
		cubeRotation = false;
		theta = 0.0;

	});
	// on mouse move update the position and set the axis and the theta values 
	canvas.addEventListener("mousemove", function(event) {
		//if mousedown is true compute axis positions and the theta value
		if(mousedown) {
			cubeRotation = true;
			
			// get x,y position
			var vertexX = -1.0 + event.clientX*2.0/canvas.width;	
			var vertexY = -1 + (canvas.height-event.clientY)*2/canvas.height;
			var vertexZ;
			
			// set z position based on x,y pos. if x^2 + y^2 >= 1 set vertexZ = 0 to avoid NaN error
			if((1.0 - vertexX*vertexX - vertexY * vertexY) <= 0.0) {
				vertexZ = 0.0;
			} else {
				vertexZ = Math.sqrt(1.0 - (vertexX * vertexX) - (vertexY * vertexY));
			}

			// get the difference in current pos and previous pos
			var changeXPos = vertexX - previousXPos;
			var changeYPos = vertexY - previousYPos;
			var changeZPos = vertexZ - previousZPos;

			//compute theta only if one of the vertex pos is >0 [to avoid NaN]
			if(changeXPos != 0 || changeYPos != 0 || changeZPos != 0) {
			theta = 0.5 * Math.sqrt(changeXPos*changeXPos + changeYPos*changeYPos + changeZPos*changeZPos);
			xAxis = previousYPos * vertexZ - previousZPos * vertexY;
			yAxis = previousZPos * vertexX - previousXPos * vertexZ;
			zAxis = previousXPos * vertexY - previousYPos * vertexX;

			// set current pos to previous pos
			previousXPos = vertexX;
			previousYPos = vertexY;
			previousZPos = vertexZ;
			
		}
		}
	});
	
	//call render	
	startTime = new Date().getTime();
	render();
};


// render function	
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// if cuberotation is true, compute rquat and set the rquat uniform variable	
	if(cubeRotation) {
		c = Math.cos(theta);
		s = Math.sin(theta);
		// normalize the x,y,z pos.
		var mag = Math.sqrt(xAxis*xAxis + yAxis*yAxis + zAxis*zAxis);
		xAxis = xAxis/mag;
		yAxis = yAxis/mag;
		zAxis = zAxis/mag;

		currRotationVector = vec4(c, -s*xAxis, s*yAxis, s*zAxis);
		rquatVector = multq(rquatVector, currRotationVector); 
		
		gl.uniform4fv(rQuatLoc, rquatVector);
	}

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

//compute rquat 
function multq(a, b)
{
	var scaleABVec = scale(a[0], vec3(b[1],b[2],b[3]));
	var scaleBAVec = scale(b[0], vec3(a[1],a[2],a[3]));
	var crossBA = cross(vec3(b[1],b[2],b[3]), vec3(a[1],a[2],a[3]));
	var addScaleAndCross = add(add(scaleABVec, scaleBAVec), crossBA);
	var dotABProd =  dot(vec3(a[1],a[2],a[3]), vec3(b[1],b[2],b[3]));
	var rotVec = vec4(a[0]*b[0] - dotABProd, addScaleAndCross);

   	return rotVec;
}
