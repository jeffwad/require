/*
	@name: 			main.js

	@description:	core webgl functions

	@author:		Simon Jefford
	
*/
var utils				= require("/lib/webgl/core/utils"),
	vertex				= require("/lib/webgl/shaders/vertex.gl"),
	fragment			= require("/lib/webgl/shaders/fragment.gl"),
	gl,
	program,
	uniforms,
	attributes,
	objects,
	modelViewMatrix,
	perspectiveMatrix,
	createShader,
	createProgram,
	getContext,
	loadIdentity,
	multMatrix,
	mvTranslate,
	perspective,
	setMatrixUniforms;



attributes = {};
uniforms = {};
objects = [];

createShader = function(type, src) {

	var shader;

	//	create a shader	
	shader = gl.createShader(gl[type.toUpperCase() + "_SHADER"]);

	//	bind it's source and compile
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Could not create shader: " + type + ": " + gl.getShaderInfoLog(shader));
	}
	return shader;
	
};


createProgram = function() {

	//	create the prgram, attach the shaders and link
	program = gl.createProgram();

    gl.attachShader(program, createShader("vertex", vertex));
    gl.attachShader(program, createShader("fragment", fragment));
    gl.linkProgram(program);

	//	did it work
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("Could not initialise shaders");
    }
	
	//	bind the current program
	gl.useProgram(program);

	//	get the attribute locations and enable their arrays
	attributes.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(attributes.aVertexPosition);

	//	get the uniform locations
	uniforms.uPMatrix = gl.getUniformLocation(program, "uPMatrix");
	uniforms.uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");

};

function loadIdentity() {
	modelViewMatrix = Matrix.I(4);
}


function multMatrix(m) {
	modelViewMatrix = modelViewMatrix.x(m);
}


function mvTranslate(v) {
	var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}

function perspective(fovy, aspect, znear, zfar) {
	perspectiveMatrix = makePerspective(fovy, aspect, znear, zfar);
}


function setMatrixUniforms() {
	try {
		gl.uniformMatrix4fv(uniforms.uPMatrix, false, new Float32Array(perspectiveMatrix.flatten()));
		gl.uniformMatrix4fv(uniforms.uMVMatrix, false, new Float32Array(modelViewMatrix.flatten()));
	}
	catch(e) {
		alert(e)
	}
}


getContext = function(canvas) {

	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = parseFloat(canvas.style.width, 10);
		gl.viewportHeight = parseFloat(canvas.style.height, 10);

		canvas.addEventListener("webglcontextcreationerror", function(e) {
			console.error(e.statusMessage);
		}, false);
	}
	catch(e) {
		throw new Error("Could not initialise WebGL, sorry :-(");
	}

};

//	should switch move identity to a per object basis so we can
//	store each objects initial position in relation to the identity matrix.
render = function() {

	var i;

	//	reset
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	loadIdentity();

	//	render objects
	for(i = 0, l = objects.length; i < l; i++) {
		objects[i].render();
	}
};


exports.mesh = {

	__init__: function() {

		this.type = gl.TRIANGLE_STRIP;
		this.buffer = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		objects.push(this);
	},

	render: function() {

		mvTranslate(this.position);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(attributes.aVertexPosition, this.size, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(this.type, 0, this.items);
	}
};

exports.init = function(canvas) {

	getContext(canvas);
	createProgram();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	setInterval(render, 1000/60);
	
};

