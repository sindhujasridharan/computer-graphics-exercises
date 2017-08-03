var gl;
var canvas;

var near = 0.4;
var far = 1000.0;

var vMatrix, mMatrix, pMatrix;
var viewLoc, modelLoc, projectionLoc;

var lightPosition = vec4(-155,-15,-155, 10.0);
var lightPositionArray = [];

lightPositionArray.push(vec4(10,15,5, 1.0));
lightPositionArray.push(vec4(-5,-5,-1, 1.0));
lightPositionArray.push(vec4(-155,-15,-145, 1.0));

var lightAmbient = vec4(0.0,0.0,0.0, 0.0);
var lightDiffuse = vec4(1.0,1.0,1.0, 0.0);
var lightSpecular = vec4(0.2, 0.2, 0.2, 0.0);

var materialAmbient = vec4(0.0, 0.0, 0.0, 0.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(0.5, 0.2, 0.2, 1.0);
var materialShininess = 50.0;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var lightPositionLoc, shininessLoc;

//var xTranslate= -0.5, yTranslate = -3, zTranslate =4;
var xTranslate= 3.5, yTranslate = -1, zTranslate =2.0;
var xRotate = 0, yRotate=90, zRotate=0;
var scaleV = 0.5;
var xEye = 0.0, yEye = 0.0, zEye = 1;
var xAt = 0.0, yAt = 0.0, zAt = 0.0;
up = vec3(0.0, 1.0, 0.0);
var fovy =75;

var model;
var navInitC = 0;
var navigationStatus = false;

var delta = 0.1;
var sDelta = 0.3;
var angle = 0;

var modelData = {};
var program;
var objectModules = [];

var images = [];
var textures = [];
var textureStartIndex = [];
var textureEndIndex = [];
var aspect;
var stairFlag = false;

window.onload = function init() {
	canvas = document.getElementById( "gl-canvas" );
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.enable(gl.DEPTH_TEST);
    
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    var modelStr = document.getElementById("model.obj").innerHTML;
    modelData = readObjFileForPositions(modelStr);
    
    gl.useProgram(program);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(modelData.normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(modelData.vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);   

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(modelData.texture), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    //load images
    images[0] = document.getElementById("roof");
    images[1] = document.getElementById("floor");
    images[2] = document.getElementById("outsidewall");
    images[3] = document.getElementById("insidewall");
    images[4] = document.getElementById("insidewall1");
    images[5] = document.getElementById("outsidefloor");
    images[6] = document.getElementById("glass");

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


    viewLoc = gl.getUniformLocation( program, "view" );
    modelLoc = gl.getUniformLocation( program, "model" );
    projectionLoc = gl.getUniformLocation( program, "projection" );
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    //slider option to show different views of the building
    document.getElementById("view").onchange = function(event) {
        var input = parseFloat(this.value);
        if(navigationStatus == false) {
        switch(input) {
            case 1:
                near = 0.4;
                xEye = 0.0;
                yEye = 0.0;
                zEye = 1.0;
                xRotate = 0.0;
                yRotate = 90.0;
                zRotate = 0.0;
                xTranslate= 3.5, yTranslate = -1, zTranslate =2.0;
                break;
            case 2:
                near = 0.5;
                xEye = 0.0;
                yEye = 0.0;
                zEye = 5.1;
                xRotate = 0.0;
                yRotate = 180.0;
                zRotate = 0.0;
                xTranslate = -2;
                zTranslate = 3.0;
                break;
            case 3:
                near = 0.6;
                xEye = 0.0;
                yEye = 0.0;
                zEye = 5.3;
                xRotate = 0.0;
                yRotate = 270.0;
                zRotate = 0.0;
                xTranslate = -2;
                zTranslate = 1.8;
                break;
            case 4:
                near = 0.6;
                xEye = 0.0;
                yEye = 0.0;
                zEye = 3.0;
                xRotate = 0.0;
                yRotate = 0.0;
                zRotate = 0.0;
                xTranslate = -2.0;
                zTranslate = -0.5;
                break;
            case 5:
                near = 0.6;
                xEye = 0.0;
                yEye = 0.0;
                zEye = 5.0;
                xRotate = 90.0;
                yRotate = 0.0;
                zRotate = 0.0;
                xTranslate = -2;
                zTranslate = 2;
                break;            
        }
    }
        
    }



    // keyboard event - rotate left [a], rotate right[d], rotate fast [w], roate slow [s]
    window.addEventListener("keydown", function(event) {
        if(event.keyCode == 78) {
            if(navigationStatus == true) {
                //set navigation to false and reset cam position
                navigationStatus = false;   
                navInitC = 0;
                xTranslate= 3.5, yTranslate = -1, zTranslate =2.0;
                xRotate = 0, yRotate=90, zRotate=0;
                scaleV = 0.5;
                xEye = 0.0, yEye = 0.0, zEye = 1;
                xAt = 0.0, yAt = 0.0, zAt = 0.0;
                up = vec3(0.0, 1.0, 0.0);
                stairFlag = false;

            } else {
                navigationStatus = true;
            }
        }
        if(navigationStatus == true && navInitC ==0) {
            xEye = 0.0;
            yEye = 0.0;
            zEye = 1.0;
            xRotate = 0.0;
            yRotate = 90.0;
            zRotate=0;
            near =0.5;
            yTranslate = -5.5;
            zTranslate = 17.0;
            xTranslate = 2.5;
            navInitC++;
            scaleV = 5;
            stairFlag = false;
        } 
        if(navigationStatus == true) {
            var right = normalize(cross(vec3(xAt, yAt, zAt) , up));
            var fBDirVector = normalize(subtract(vec3(xAt, yAt, zAt) , vec3(xEye, yEye, zEye)));
        
        switch(event.keyCode) {
            case 38:
                //move forward [up arrow key]
                xEye += fBDirVector[0]*delta;
                zEye += fBDirVector[2]*delta;
                xAt += fBDirVector[0]*delta;
                zAt += fBDirVector[2]*delta;
                if(stairFlag && yEye < 13) {
                    yEye += fBDirVector[1]+delta;
                    yAt += fBDirVector[1]+delta;                                       
                }
                if(stairFlag && yEye >= 13) {
                    stairFlag = false;
                }
                break;
            case 40:
                //move backward [down arrow key]
                xEye -= fBDirVector[0]*delta;
                zEye -= fBDirVector[2]*delta;
                xAt -= fBDirVector[0]*delta;
                zAt -= fBDirVector[2]*delta;
                 if(stairFlag && yEye > 0) {
                    yEye -= fBDirVector[1]+delta;
                    yAt -= fBDirVector[1]+delta;  
                    console.log(yEye);                 
                }
                break;
            case 37:
                //move right [right arrow key]
                xAt -= right[0]*delta;
                zAt -= right[2]*delta;
                xEye -= right[0]*delta;
                zEye -= right[2]*delta;              
                break;
            case 39:
                //move left [left arrow key]
                xAt += right[0]*delta;
                zAt += right[2]*delta;
                xEye += right[0]*delta;
                zEye += right[2]*delta;
                break;                
            case 76:
                //rotate right [R key]
                xAt -= right[0]*0.2;
                yAt -= right[1]*0.2;
                zAt -= right[2]*0.2;
                break;
            case 82:
                //rotate left [L key]
                xAt += right[0]*0.2;
                yAt += right[1]*0.2;
                zAt += right[2]*0.2;
                break;   
            case 69:
                //goto elevator [E key]
                near = 0.6;
                xEye = 0.0;
                yEye = 1.0;
                zEye = 5.0;
                xRotate = 0.0;
                yRotate = 270.0;
                zRotate = -5.0;
                xTranslate = -10;
                yTranslate = -20;
                zTranslate = 17;
                xAt = 0.0, yAt = 0.0, zAt = 0.0;
                stairFlag = false;
                break;
            case 83:
                //goto stair case [S key]    
                xEye = 0.0;
                yEye = 0.0;
                zEye = 1.0;
                xRotate = 0.0;
                yRotate = 90.0;
                zRotate=0;
                near =0.5;
                yTranslate = -5.5;
                zTranslate = -2.5;
                xTranslate = 23;
                scaleV = 5;
                xAt = 0.0, yAt = 0.0, zAt = 0.0;
                stairFlag = true;
                break;
            case 70:
                //goto to first floor [F key]
                xEye = 0.0;
                yEye = 0.0;
                zEye = 1.0;
                xRotate = 0.0;
                yRotate = 90.0;
                zRotate=0;
                near =0.5;
                yTranslate = -5.5;
                zTranslate = 17.0;
                xTranslate = 2.5;
                scaleV = 5;
                xAt = 0.0, yAt = 0.0, zAt = 0.0;
                stairFlag = false;
                break;
                             
        }    

        }
        
    });   

    render(); 
}

//render
function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var translate = [xTranslate, yTranslate, zTranslate];
    mMatrix = createTransformationMatrix(translate, xRotate, yRotate, zRotate, scaleV);
    
    var eye = vec3(xEye, yEye, zEye);
    var at = vec3(xAt, yAt, zAt);
    vMatrix = lookAt(eye, at, up);

    aspect = canvas.width / canvas.height;
    
    pMatrix = createProjectionMatrix(fovy, aspect, near, far);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniformMatrix4fv(viewLoc, false, flatten(vMatrix));
    gl.uniformMatrix4fv(modelLoc, false, flatten(mMatrix));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(pMatrix));
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPositionArray));
    gl.uniform1f(shininessLoc, materialShininess);
    
    //set texture for each module group   
	gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.drawElements(gl.TRIANGLES, textureEndIndex[0]*3, gl.UNSIGNED_SHORT, textureStartIndex[0]*3);  

    var numItems = textureEndIndex[1] - textureEndIndex[0];
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[1]*6); 

    var numItems = textureEndIndex[2] - textureEndIndex[1];    
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[2]*6); 
    
    var numItems = textureEndIndex[3] - textureEndIndex[2];    
    gl.bindTexture(gl.TEXTURE_2D, textures[3]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[3]*6); 
    
    var numItems = textureEndIndex[4] - textureEndIndex[3];    
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[4]*6); 
    
    var numItems = textureEndIndex[5] - textureEndIndex[4];    
    gl.bindTexture(gl.TEXTURE_2D, textures[6]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[5]*6); 
    
    var numItems = textureEndIndex[6] - textureEndIndex[5];    
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[6]*6); 
    
    var numItems = textureEndIndex[7] - textureEndIndex[6];    
    gl.bindTexture(gl.TEXTURE_2D, textures[4]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[7]*6); 
    
    var numItems = textureEndIndex[8] - textureEndIndex[7];    
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[8]*6); 
    
    var numItems = textureEndIndex[9] - textureEndIndex[8];    
    gl.bindTexture(gl.TEXTURE_2D, textures[5]);
    gl.drawElements(gl.TRIANGLES, numItems*3, gl.UNSIGNED_SHORT, textureStartIndex[9]*6); 
    
    requestAnimFrame(render);

}

// create the projection matrix
function createProjectionMatrix(fovy, aspect, near, far)
{
	var out = mat4();
    var f = 1.0 / Math.tan(radians(fovy) / 2);
    var nf = 1 / (near - far);
    out[0][0] = f / aspect;
    out[1][1] = f;
    out[2][2] = (far + near) * nf;
    out[2][3] = -1;
    out[3][2] = (2 * far * near) * nf;
    
    return out;
}

// create the transformation matrix based on the translation, xyz rotation angles and the scale value for the cube
function createTransformationMatrix(translationValue, xRotationValue, yRotationValue, zRotationValue, scaleValue) {
    var matrix = mat4();
    var xAxis = [1, 0, 0];
    var yAxis = [0, 1, 0];
    var zAxis = [0, 0, 1];

    if(xRotationValue != 0) {
        var xRotation = rotate(xRotationValue, xAxis);
        matrix = mult(matrix, xRotation);
    } 
    if(yRotationValue != 0) {
        var yRotation = rotate(yRotationValue, yAxis);
        matrix = mult(matrix, yRotation);
    }
    if(zRotationValue != 0) {
        var zRotation = rotate(zRotationValue, zAxis);
        matrix = mult(matrix, zRotation);
    }
    if(translationValue != null) {
        var translation = translate(translationValue[0], translationValue[1], translationValue[2]);
        matrix = mult(matrix, translation);
    }   
    var scaleM = scale(scaleValue, scaleValue, scaleValue);
    matrix = mult(matrix, scaleM); 
   
    return(matrix);
}

// parse obj file to get the texture, normal and vertices details
function readObjFileForPositions(objData) {
    var lines = objData.split('\n');
    var vertices = [];
    var normals = [];
    var textureCoords = [];
    var faces = [];
    var model = {};
    var materialsIndex = [{materialName: null, materialStartIndex: 0}];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        var commentStart = line.indexOf("#");
        if(commentStart != -1) {
            line = line.substring(0, commentStart);
        }

       var splitedLine = line.split(/\s+/);

       if(splitedLine[0] === 'v') {
            var vertex = [Number(splitedLine[1]), Number(splitedLine[2]), Number(splitedLine[3]), splitedLine[4]? 1 : Number(splitedLine[4])];
            vertices.push(vertex);
        } else if(splitedLine[0] === 'vt') {
            var textureCoord = [Number(splitedLine[1]), Number(splitedLine[2]), splitedLine[3]? 1 : Number(splitedLine[3])]
            textureCoords.push(textureCoord);
        }  else if(splitedLine[0] === 'vn') {
                var normal = [Number(splitedLine[1]), Number(splitedLine[2]), Number(splitedLine[3])];
                normals.push(normal);
        } else if(splitedLine[0] === 'f') {
            var face = {
            indices: [],
            texture: [],
            normal: []
            };

            for(var j = 1; j < splitedLine.length; ++j) {
                var dIndex = splitedLine[j].indexOf('//');
                var splitedFaceIndices = splitedLine[j].split(/\W+/);

                if(dIndex > 0) {
                    face.indices.push(splitedFaceIndices[0]);
                    face.normal.push(splitedFaceIndices[1]);
                } else {
                    if(splitedFaceIndices.length === 1) {
                        face.indices.push(splitedFaceIndices[0]);
                    } else if(splitedFaceIndices.length === 2) {
                        face.indices.push(splitedFaceIndices[0]);
                        face.texture.push(splitedFaceIndices[1]);
                    } else if(splitedFaceIndices.length === 3) {
                        face.indices.push(splitedFaceIndices[0]);
                        face.texture.push(splitedFaceIndices[1]);
                        face.normal.push(splitedFaceIndices[2]);                        
                    }
                }
            }
           faces.push(face);
           
        } else if(splitedLine[0] === "usemtl") {
            if(faces.length === 0) {
            	materialsIndex[0].materialName = splitedLine[1];
            } else {
            	var materialName = splitedLine[1];
            	var materialStartIndex = faces.length;
            	materialsIndex.push({materialName: materialName, materialStartIndex: materialStartIndex});
            }
        }

    }
    
    model.vertices = vertices;
    model.faces = faces;
    model.normals = normals;
    model.textureCoords = textureCoords;
    model.materialsIndex = materialsIndex;
    // get modelData

    var modelData = {};
    var modelVertices = [];
    var modelIndices = [];
    var modelNormals = [];
    var modelColors = [];
    var materialsArray = [];
    var modelTextures = [];

    for(var i=0; i< model.vertices.length; i++) {
        modelVertices.push(model.vertices[i][0]);
        modelVertices.push(model.vertices[i][1]);
        modelVertices.push(model.vertices[i][2]);
    }
    if(model.materialsIndex) {

        for(var i=0; i<model.materialsIndex.length; ++i) {          

            var materialName = model.materialsIndex[i].materialName;
            var startIndex = model.materialsIndex[i].materialStartIndex;
            var endIndex = i+1 < model.materialsIndex.length ? model.materialsIndex[i+1].materialStartIndex : model.faces.length;
            textureStartIndex[i] = startIndex;
            textureEndIndex[i] = endIndex;

            for(var x = startIndex; x <endIndex; ++x) {               
                if(model.normals.length != 0) {                           
                    modelIndices.push(model.faces[x].indices[0]-1);
                    modelIndices.push(model.faces[x].indices[1]-1);
                    modelIndices.push(model.faces[x].indices[2]-1);

                    modelNormals.push(vec3(0.5,0.5,-0.1));
                    modelNormals.push(vec3(1,0.5,-0.1));
                    modelNormals.push(vec3(1,1,-0.1));

                    modelTextures.push(model.textureCoords[model.faces[x].texture[0]-1][0], model.textureCoords[model.faces[x].texture[0]-1][1]);
                    modelTextures.push(model.textureCoords[model.faces[x].texture[1]-1][0], model.textureCoords[model.faces[x].texture[1]-1][1]);
                    modelTextures.push(model.textureCoords[model.faces[x].texture[2]-1][0], model.textureCoords[model.faces[x].texture[2]-1][1]);
                } 
            }          
        }
    }    
    
    modelData.vertices = modelVertices;
    modelData.indices = modelIndices;
    modelData.normals = modelNormals;
    modelData.texture = modelTextures;
    return modelData;
    
    
}

