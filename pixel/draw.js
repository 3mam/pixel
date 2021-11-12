import { verTex, fragTex } from './shaders.js'

let gl = null
let textures = {
	atlas: null,
	palette: null,
}

let shaders = {
	atlas: null,
	palette: null,
	resolution: null,
	sprite: null,
	position: null,
	camera: null,
	switchPalette: null,
	flip: null,
	index: null,
}

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

function init(width, height) {
	const program = createShader(verTex, fragTex)
	gl.useProgram(program)
	const sVertexPosition = gl.getAttribLocation(program, 'vertex_position')
	shaders.atlas = gl.getUniformLocation(program, 'atlas')
	shaders.palette = gl.getUniformLocation(program, 'palette')
	shaders.resolution = gl.getUniformLocation(program, 'resolution')
	shaders.sprite = gl.getUniformLocation(program, 'sprite')
	shaders.position = gl.getUniformLocation(program, 'position')
	shaders.camera = gl.getUniformLocation(program, 'camera')
	shaders.switchPalette = gl.getUniformLocation(program, 'switch_palette')
	shaders.flip = gl.getUniformLocation(program, 'flip')
	shaders.index = gl.getUniformLocation(program, 'index')

	gl.uniform1i(shaders.atlas, 0)
	gl.uniform1i(shaders.palette, 1)
	gl.uniform2f(shaders.flip, 1, 1)
	gl.uniform1f(shaders.index, 0)

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

	textures.atlas = gl.createTexture()
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, textures.atlas)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 1024, 1024, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(1024 * 1024))

	textures.palette = gl.createTexture()
	gl.activeTexture(gl.TEXTURE1)
	gl.bindTexture(gl.TEXTURE_2D, textures.palette)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(32 * 32 * 4))

	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.enable(gl.DEPTH_TEST)
	//gl.depthMask(gl.FALSE)  
	//gl.depthFunc(gl.ALWAYS)
}

function set(canvasId, width, height) {
	let canvas = document.getElementById(canvasId)
	gl = canvas.getContext('webgl2')
	init(width, height)
	gl.uniform2f(shaders.resolution, width, height)
}

function flip(flipX = false, flipY = false) {
	if (flipX && flipY)
		gl.uniform2f(shaders.flip, -1, -1)
	else if (flipX)
		gl.uniform2f(shaders.flip, -1, 1)
	else if (flipY)
		gl.uniform2f(shaders.flip, 1, -1)
	else
		gl.uniform2f(shaders.flip, 1, 1)
}

function position(x, y) {
	gl.uniform2f(shaders.position, Math.round(x), Math.round(y))
}

function sprite({ offsetX, offsetY, width, height }) {
	gl.uniform4f(shaders.sprite, offsetX, offsetY, width, height)
}

function camera(x, y) {
	gl.uniform2f(shaders.camera, Math.round(x), Math.round(y))
}

function uploadPalette(data, palette) {
	gl.activeTexture(gl.TEXTURE1)
	gl.bindTexture(gl.TEXTURE_2D, textures.palette)
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, palette, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data))
}

function palette(val = 0) {
	gl.uniform1i(shaders.switchPalette, val)
}

function uploadSprite(data, { offsetX, offsetY, width, height }) {
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, textures.atlas)
	gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, width, height, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(data))
}

function clear() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.clearColor(1.0, 0.5, 0.5, 1.0)
}

function show() {
	gl.drawArrays(gl.TRIANGLES, 0, 6)
	gl.uniform1f(shaders.index, 0)
	flip(false, false)
}

function index(val = 0) {
	gl.uniform1f(shaders.index, val/100)
}

export const draw = {
	init: set,
	flip: flip,
	position: position,
	sprite: sprite,
	camera: camera,
	uploadPalette: uploadPalette,
	palette: palette,
	uploadSprite: uploadSprite,
	clear: clear,
	draw: show,
	index: index,
}