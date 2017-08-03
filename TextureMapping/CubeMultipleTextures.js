var numberOfVertices = 36;
var gl;
var thetaLoc;
var theta= [0,0,0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

var program;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];
var texCoordArray = [];

var texture;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var vertexColors = [
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // whitw
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 1.0, 1.0, 1.0, 1.0 )   // white
];

var texCoord = [
vec2(0, 0),
vec2(0, 1),
vec2(1, 1),
vec2(1, 0)
];

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     texCoordArray.push(texCoord[0]);
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     texCoordArray.push(texCoord[1]);
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     texCoordArray.push(texCoord[2]);
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     texCoordArray.push(texCoord[0]);
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     texCoordArray.push(texCoord[2]);
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);  
     texCoordArray.push(texCoord[3]);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

var images = [];
var textures = [];

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

    colorCube();

    // load buffer data for vertices and vertex colors and textures.
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    //load images
    images[0] = document.getElementById("T1");
    images[1] = document.getElementById("T2");
    images[2] = document.getElementById("T3");
    images[3] = document.getElementById("T4");
    images[4] = document.getElementById("T5");
    images[5] = document.getElementById("T6");

    //enable textures for all sides of the cube
    for(i = 0; i <images.length; i++) {    
        textures[i] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,gl.RGB, gl.UNSIGNED_BYTE, images[i]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    }

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

    render();
};


// render function  
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    theta[axis] += 2.0;
    
    gl.uniform3fv(thetaLoc, theta);

    //set texture for each side of the cube    
	gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.drawArrays(gl.TRIANGLES, 6, 8);
    
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.drawArrays(gl.TRIANGLES, 9, 11);

    gl.bindTexture(gl.TEXTURE_2D, textures[3]);
    gl.drawArrays(gl.TRIANGLES, 12, 14);

    gl.bindTexture(gl.TEXTURE_2D, textures[4]);
    gl.drawArrays(gl.TRIANGLES, 15, 17);  

    gl.bindTexture(gl.TEXTURE_2D, textures[5]);
    gl.drawArrays(gl.TRIANGLES, 18, 18);    
   
    
    requestAnimFrame(render);   
}





