var gl;

// total number of points to be generated
const numPoints = 10000;

/*
* init function will be invoked on loading the main window
* generate the sierpinski gasket using points
* 
*/
window.onload = function init () {
	//
	var gl_canvas = document.getElementById("point_based_sierpinski_gasket");

	// setup web Gl from WebGlUtils.js
	gl = WebGLUtils.setupWebGL(gl_canvas);
	if(!gl) {
		console.log("WebGL Util not available");
		alert("WebGL Util not available");
	}

	// define the 3 initial vertices for the sierpinski gasket
	var vertices = [
		vec3(-1.0, -1.0, 0.0),
		vec3(0.0, 1.0, 0.0),
		vec3(1.0, -1.0, 0.0)
		];

	// compute the initial point inside the triangle
	var u = scale(0.5, add(vertices[0], vertices[1]));
	var v = scale(0.5, add(vertices[0], vertices[2]));
	var p = scale(0.5, add(u,v));

	console.log(u);
	console.log(v);
	console.log(p);
	var pointsArray = [p];

	// generate (x,y) position for all the points
	for(var i=0; i< numPoints; ++i) {
		var j = Math.floor(Math.random() * 3);

		p = scale(0.5, add(pointsArray[i], vertices[j]));
		pointsArray.push(p);
	}

	// configure gl and initialize shaders
	gl.viewport(0, 0, gl_canvas.width, gl_canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram (program);

	// load buffer data 
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	// link buffer data with shaders
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	console.log(vec4());

	render();
};

/* 
 * function to render the buffer data as points
 */
function render () {
	//
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, numPoints);
}