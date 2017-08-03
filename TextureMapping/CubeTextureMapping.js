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
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
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



var texSize = 64;
var numRows = 8;
var numCols = 8;
var image = new Uint8Array(4*texSize*texSize);

for (var i = 0; i < texSize; ++i) {
    for (var j = 0; j < texSize; ++j) {
        var patchx = Math.floor(i/(texSize/numRows));
        var patchy = Math.floor(j/(texSize/numCols));
        var c = (patchx%2 !== patchy%2 ? 255 : 0);
        image[4*i*texSize+4*j] = c;
        image[4*i*texSize+4*j+1] = c;
        image[4*i*texSize+4*j+2] = c;
        image[4*i*texSize+4*j+3] = 255;
    }
}



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

    //enable texture
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);       
    requestAnimFrame(render);   
}





