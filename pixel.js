let canvas
let renderWidth
let renderHight

let gl
let tAtlas
let tPalette
let sAtlas
let sPalette
let sResolution
let sSprite
let sPosition
let sCamera
let sSwitchPalette
let sFlip

let input = []

const verTex = `#version 300 es
uniform vec2 resolution;
uniform vec4 sprite;
uniform vec2 position;
uniform vec2 camera;
uniform vec2 flip;
in vec2 vertex_position;
out vec2 uv;

void main() {
	vec2 sprite_position;
	if (vertex_position.x != 0.0 && vertex_position.y != 0.0)
		sprite_position = vec2(sprite.z, sprite.w);
  else if (vertex_position.x != 0.0)
		sprite_position = vec2(sprite.z, 0.0);
	else if (vertex_position.y != 0.0)
		sprite_position = vec2(0.0, sprite.w);
	else
		sprite_position = vertex_position;

	vec2 flip_position = sprite_position * flip;
	if (flip == vec2(-1.0,1.0))
		flip_position += vec2(sprite.w, 0.0);
	if (flip == vec2(1.0,-1.0))
		flip_position += vec2(0.0, sprite.z);
	if (flip == vec2(-1.0,-1.0))
		flip_position += vec2(sprite.w, sprite.z);

	uv = sprite_position + vec2(sprite.x, sprite.y);
	vec2 cord = ( ( position / resolution ) * 2.0 - 1.0 );
	vec2 a = (flip_position  / ( resolution / 2.0 ) + cord);
	vec2 cam = ( camera / resolution ) * 2.0;
	gl_Position = vec4((a + cam)*vec2(1,-1), 0, 1);
}
`

const fragTex = `#version 300 es
precision mediump float;

uniform sampler2D atlas;
uniform sampler2D palette;
uniform int switch_palette;
in vec2 uv;
out vec4 outColor;

void main() {
	int color = int(texelFetch(atlas, ivec2(uv),0).a*255.0);
	for (int i = 0; i<32; i+=1) {		
		if (color == i) {
			outColor = texelFetch(palette, ivec2(i,switch_palette),0);
			break;
		}
	}
}
`

function shader(str, typ) {
	const shader = gl.createShader(typ)
	gl.shaderSource(shader, str)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader))
		return -1
	}
	return shader
}

function createShader(ver, frag) {
	const verShader = shader(ver, gl.VERTEX_SHADER)
	const fragShader = shader(frag, gl.FRAGMENT_SHADER)
	const id = gl.createProgram()
	gl.attachShader(id, verShader)
	gl.attachShader(id, fragShader)
	gl.linkProgram(id)

	return id
}

function init() {
	const program = createShader(verTex, fragTex)
	gl.useProgram(program)
	const sVertexPosition = gl.getAttribLocation(program, "vertex_position")
	sAtlas = gl.getUniformLocation(program, "atlas")
	sPalette = gl.getUniformLocation(program, "palette")
	sResolution = gl.getUniformLocation(program, "resolution")
	sSprite = gl.getUniformLocation(program, "sprite")
	sPosition = gl.getUniformLocation(program, "position")
	sCamera = gl.getUniformLocation(program, "camera")
	sSwitchPalette = gl.getUniformLocation(program, "switch_palette")
	sFlip = gl.getUniformLocation(program, "flip")

	gl.uniform1i(sAtlas, 0)
	gl.uniform1i(sPalette, 1)
	gl.uniform2f(sFlip, 1, 1)

	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			0, 8,
			8, 8,
			0, 0,
			0, 0,
			8, 8,
			8, 0,
		]),
		gl.STATIC_DRAW)
	gl.enableVertexAttribArray(sVertexPosition)
	gl.vertexAttribPointer(sVertexPosition, 2, gl.FLOAT, false, 0, 0)

	tAtlas = gl.createTexture()
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, tAtlas)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 1024, 1024, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(1024 * 1024))

	tPalette = gl.createTexture()
	gl.activeTexture(gl.TEXTURE1)
	gl.bindTexture(gl.TEXTURE_2D, tPalette)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(32 * 32 * 4))

	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
}

function set(canvasId, width, height) {
	canvas = document.getElementById(canvasId)
	renderWidth = width
	renderHight = height
	gl = canvas.getContext('webgl2')
	init()
	gl.uniform2f(sResolution, width, height)
	eventsInit()
}

function flip(flipX, flipY) {
	if (flipX && flipY)
		gl.uniform2f(sFlip, -1, -1)
	else if (flipX)
		gl.uniform2f(sFlip, -1, 1)
	else if (flipY)
		gl.uniform2f(sFlip, 1, -1)
	else
		gl.uniform2f(sFlip, 1, 1)
}

function position(x, y) {
	gl.uniform2f(sPosition, Math.round(x), Math.round(y))
}

function sprite({ offsetX, offsetY, width, height }) {
	gl.uniform4f(sSprite, offsetX, offsetY, width, height)
}

function camera(x, y) {
	gl.uniform2f(sCamera, Math.round(x), Math.round(y))
}

function uploadPalette(data, palette) {
	gl.activeTexture(gl.TEXTURE1)
	gl.bindTexture(gl.TEXTURE_2D, tPalette)
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, palette, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data))
}

function palette(number) {
	gl.uniform1i(sSwitchPalette, number)
}

function uploadSprite(data, { offsetX, offsetY, width, height }) {
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, tAtlas)
	gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, width, height, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(data))
}

function clear() {
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.clearColor(1.0, 0.5, 0.5, 1.0)
}

function draw() {
	gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function loop(gameloop) {
	let last = 0
	const l = timestamp => {
		const delta = Math.min(1, (timestamp - last) / 1000)
		last = timestamp
		gameloop(delta)
		window.requestAnimationFrame(l)
	}
	l(0)
}

function toggleFullScreen() {
	if (!document.fullscreenElement)
		document.documentElement.requestFullscreen()
	else if (document.exitFullscreen)
		document.exitFullscreen()
	screen.orientation.lock('portrait')
}

function correctPointerPosition({ pageX, pageY }) {
	let { top, left, width, height } = canvas.getBoundingClientRect()
	let x = ((pageX - left) / width) * renderWidth
	let y = ((pageY - top) / height) * renderHight
	return { x: Math.floor(x), y: Math.floor(y) }
}

function mousePoint(event, type) {
	return [({
		type: type,
		timeStamp: event.timeStamp,
		identifier: 0,
		...correctPointerPosition(event)
	})]
}

function eventsInit() {
	let mouseType = 'mouseup'
	canvas.onmousedown = e => {
		mouseType = e.type
		input = mousePoint(e, 'start')
	}
	canvas.onmouseup = e => {
		mouseType = e.type
		input = mousePoint(e, 'end')
	}
	canvas.onmousemove = e => {
		if (mouseType === 'mousedown')
			input = mousePoint(e, 'move')
	}

	canvas.ontouchstart = e => {
		input = Array.from(e.touches).map(v => ({
			type: 'start',
			timeStamp: e.timeStamp,
			identifier: v.identifier,
			...correctPointerPosition(v)
		}))
	}

	canvas.ontouchend = e => {
		input = Array.from(e.changedTouches).map(v => ({
			type: 'end',
			timeStamp: e.timeStamp,
			identifier: v.identifier,
			...correctPointerPosition(v)
		}))
	}

	canvas.ontouchmove = e => {
		input = Array.from(e.changedTouches).map(v => ({
			type: 'move',
			timeStamp: e.timeStamp,
			identifier: v.identifier,
			...correctPointerPosition(v)
		}))
	}
}

function getInput() {
	const tmpInput = [...input]
	input = []
	return tmpInput
}

function isInput() {
	return input.length > 0
}

function boxCollision(a = { x, y, width, height }, b = { x, y, width, height }) {
	return (a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.height + a.y > b.y)
}

export const pixel = {
	set: set,
	flip: flip,
	position: position,
	sprite: sprite,
	camera: camera,
	uploadPalette: uploadPalette,
	palette: palette,
	uploadSprite: uploadSprite,
	clear: clear,
	draw: draw,
	loop: loop,
	toggleFullScreen: toggleFullScreen,
	getInput: getInput,
	isInput: isInput,
	boxCollision: boxCollision,
}