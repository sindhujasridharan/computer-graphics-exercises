var gl;
var points;
var thetaLoc;
var theta=0.0;
var direction = true;
var rotateLeft = document.getElementById("rotateLeft");
var rotateRight = document.getElementById("rotateRight");
var delay = 100;
var mousedown = false;
var stopRotation = false;
var lastXPos = 0;
var oldXPos;
var reducespeed = 1.0;



window.onload = function init(){
	var canvas = document.getElementById( "gl-canvas" );
        
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { 
		alert( "WebGL isn't available" );
	}
	
	// Initial Vertices
	var vertices = [
        vec2(  0,  0.5 ),
        vec2(  -0.5,  0 ),
        vec2( 0.5,  0 ),
        vec2(  0, -0.5 )
    ];

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Load the data into the GPU
	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	// Associate out shader variables with our data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );  

	thetaLoc = gl.getUniformLocation(program, "theta");  

	// button event - rotate left
	document.getElementById("rotateLeft").onclick = function() {
		direction = true;
	};
	// button event - rotate right
	document.getElementById("rotateRight").onclick = function() {
		direction = false;
	};
	// button event - toggle direction
	document.getElementById("toggleDirection").onclick = function() {
		direction = !direction;
	};
	// button event - rotate fast
	document.getElementById("rotateFast").onclick = function() {
		delay /= 2.0;
	};
	// button event - rotate slow
	document.getElementById("rotateSlow").onclick = function() {
		delay *= 2.0;
	};
	// slider event	
	document.getElementById("slider").onchange = function() {
		delay = 100 - event.srcElement.value;
	}
	// keyboard event - rotate left [a], rotate right[d], rotate fast [w], roate slow [s]
	window.addEventListener("keydown", function() {
		switch(event.keyCode) {
			case 68:
				direction = false;
				break;
			case 65:
				direction = true;
				break;
			case 87:		
				delay /= 2.0;
				break;
			case 83:
				delay *= 2.0;		
				break;
		}
	});
	// mouse picking
	// mouse down
	canvas.addEventListener("mousedown", function() {
		stopRotation = true;
		mousedown = true;		
	});	
	// mouse up
	canvas.addEventListener("mouseup", function() {
		mousedown = false;
		stopRotation = false;
		delay = 100;
	});
	// mouse move
	canvas.addEventListener("mousemove", function(event) {
		if(mousedown) {			
			var x = event.clientX;
			
			var vertexX = -1.0 + x*2.0/canvas.width;
			
			if(oldXPos === null) {				
				oldXPos = vertexX;
			}
			// if mouse position is on the right side of the center of the square, rotate square toward left
			// if mouse position is on the left side of the center of the square, rotate square toward right
    		if (vertexX > 0.0) {
    			if(direction == false) {
    				reducespeed = 1.0;
    			}
	       		stopRotation = false;
	       		direction = true;	    
	       		// increase speed while the mouse moves away from the center of the square
	       		// decrease speed while the mouse moves towards the center of the square
	       		if(vertexX > oldXPos) {
	       			delay = 100-reducespeed;	
	       			reducespeed += 1.0;
	       		} else {
	       			delay = delay +1.0;
	       			reducespeed += 1.0;
	       		}
	       		oldXPos = vertexX;
	       } else {
	       		if(direction == true) {
	       			reducespeed = 1.0;
	       		}
    			stopRotation = false;
    			direction = false;  

    			if(vertexX < oldXPos) {
	       			delay = 100-reducespeed;	
	       			reducespeed += 1.0;
	       		} else {
	       			delay = delay +1.0;
	       			reducespeed += 1.0;
	       		}
	    		oldXPos = vertexX;   			
    		}   	    
		}	
	});
	
	render();
};


// render function	
function render() {
	setTimeout(function() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	if(stopRotation) {
		// stop rotation on mouse down and no movement of the mouse
		theta =0.0;
	} else {
		theta += (direction ? 0.1 : -0.1);
	}	
	gl.uniform1f(thetaLoc, theta);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	requestAnimFrame(render);
}, delay);
	
}

