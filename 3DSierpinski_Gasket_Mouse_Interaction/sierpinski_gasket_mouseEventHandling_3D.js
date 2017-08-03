var gl;
var triangleArray = [];
var colorArray = [];
var numTimesToSubDivide = 4;
var numVertices = Math.pow(3, numTimesToSubDivide) +1;
var baseColors = [
		vec3(0.0, 1.0, 0.0, 0.0),
		vec3(0.0, 0.0, 1.0, 0.0),
		vec3(1.0, 0.0, 0.0, 0.0),
		vec3(0.0, 0.0, 0.0, 1.0)
		];



window.onload = function init () {

	gl_canvas = document.getElementById("sierpinski_gasket_canvas");

	// setup web Gl from WebGlUtils.js
	gl = WebGLUtils.setupWebGL(gl_canvas);

	if(!gl) {
		console.log("WebGL Util not available");
		alert("WebGL Util not available");
	}

	// define the 3 initial vertices for the sierpinski gasket
	var vertices = [
		vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
	];

	gl.enable(gl.DEPTH_TEST);

	// call to recursive function
	divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], numTimesToSubDivide);

	// configure gl and initialize shaders
	gl.viewport(0, 0, gl_canvas.width, gl_canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// load buffer data 
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);
	//
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	//
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleArray), gl.STATIC_DRAW);

	// link buffer data with shaders
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	// mouse event handlers
	var mouse_down = false;
	gl_canvas.addEventListener('mousedown', function(event) {
		mouse_down = true;
	});
	gl_canvas.addEventListener('mouseup', function(event) {
		mouse_down = false;
	});
	gl_canvas.addEventListener('mousemove', function(event) {
		if(mouse_down) {
			mouseMoveEvent(event, gl, gl_canvas, program, vPosition, buffer);
		}
	});

	// call render function
	render();


};

/*
 * Mouse event function to move one point along the mouse on mouse down
 *
 */
 
function mouseMoveEvent(event, gl, gl_canvas, program, vPosition, buffer) {
	// configure gl and initialize shaders
	var x = event.clientX;
	var y = event.clientY;
	console.log(x);
	console.log(y);
	var vertexX = -1.0 + x*2.0/gl_canvas.width;
	var vertexY = -1.0 + (gl_canvas.height-y)*2.0/gl_canvas.height;

	var vertices = [
		vec3(  vertexX,  vertexY, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
	];

	// empty array
	triangleArray = [];

	// call to recursive function
	divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], numTimesToSubDivide);

	// load buffer data 
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleArray), gl.STATIC_DRAW);

	// link buffer data with shaders
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//
	render();
}

/*
 * function to render the buffer data
 */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, triangleArray.length);
}



function pushTriangle(a, b, c, color) {
	colorArray.push(baseColors[color]);
 	triangleArray.push(a);
 	colorArray.push(baseColors[color]);
 	triangleArray.push(b);
 	colorArray.push(baseColors[color]);
 	triangleArray.push(c);

 }

function pushTetra(a, b, c, d) {
	pushTriangle(a, c, b, 0);
	pushTriangle(a, c, d, 1);
	pushTriangle(a, b, d, 2);
	pushTriangle(b, c, d, 3);
}

function divideTetra(a, b, c, d, count) {
	if(count === 0) {
		pushTetra(a, b, c, d);
	} else {
		var ab = mix(a, b, 0.5);
		var ac = mix(a, c, 0.5);
		var ad = mix(a, d, 0.5);
		var bc = mix(b, c, 0.5);
		var bd = mix(b, d, 0.5);
		var cd = mix(c, d, 0.5);

		--count;
		divideTetra(a, ab, ac, ad, count);
		divideTetra(ab, b, bc, bd, count);
		divideTetra(ac, bc, c, cd, count);
		divideTetra(ad, bd, cd, d, count);
	}
}