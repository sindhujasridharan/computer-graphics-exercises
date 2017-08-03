var gl;
var triangleArray = [];
// number of times the triangle has to be sub-divided
var numTimesToSubDivide=6;
// total number of vertices
var numVertices = Math.pow(3, numTimesToSubDivide) +1;

/*
* init function will be invoked on loading the main window
* generate the sierpinski gasket using triangles
* 
*/
window.onload = function init () {

	gl_canvas = document.getElementById("triangle_based_sierpinski_gasket");

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


	// call to recursive function
	divideTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubDivide);

	// configure gl and initialize shaders
	gl.viewport(0, 0, gl_canvas.width, gl_canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// load buffer data 
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleArray), gl.STATIC_DRAW);

	// link buffer data with shaders
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// call render function
	render();


};

/*
 * function to render the buffer data
 */
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, triangleArray.length);
}


/* 
 * pushTriangle function appends the given 
 * vertices in the triangleArray
 */
function pushTriangle(x, y, z) {
 	triangleArray.push(x);
 	triangleArray.push(y);
 	triangleArray.push(z);

 }

/* 
 * divideTriangle function is a recursive function which divides the given  
 * vertices of a triangle into smaller triangles . 
 *
 */
function divideTriangle(x, y, z, count) {
	// if count is 0, push the vertices of the divided triangle in triangleArray
	// else compute mid points of the vertices and sub-divide until count =0
	if(count === 0) {
		pushTriangle(x, y, z);
	} else {

		var xy = mix(x, y, 0.5);
		var yz = mix(y, z, 0.5);
		var xz = mix(x, z, 0.5);

		--count;

		//recursive call
		divideTriangle(x, xy, xz, count);
		divideTriangle(y, xy, yz, count);
		divideTriangle(z, yz, xz, count);
	}	

}