let gl

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

	uv = sprite_position + vec2(sprite.x, sprite.y);
	vec2 flip_position = sprite_position * flip;
	vec2 cord = ( ( position / resolution ) * 2.0 - 1.0 );
	vec2 a =  (flip_position  / ( resolution / 2.0 ) + cord);
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

class Draw {
	#tAtlas
	#tPalette
	#sVertexPosition
	#sAtlas
	#sPalette
	#sResolution
	#sSprite
	#sPosition
	#sCamera
	#sSwitchPalette
	#sFlip

	#init() {
		const program = createShader(verTex, fragTex)
		gl.useProgram(program)
		this.#sVertexPosition = gl.getAttribLocation(program, "vertex_position")
		this.#sAtlas = gl.getUniformLocation(program, "atlas")
		this.#sPalette = gl.getUniformLocation(program, "palette")
		this.#sResolution = gl.getUniformLocation(program, "resolution")
		this.#sSprite = gl.getUniformLocation(program, "sprite")
		this.#sPosition = gl.getUniformLocation(program, "position")
		this.#sCamera = gl.getUniformLocation(program, "camera")
		this.#sSwitchPalette = gl.getUniformLocation(program, "switch_palette")
		this.#sFlip = gl.getUniformLocation(program, "flip")

		gl.uniform1i(this.#sAtlas, 0)
		gl.uniform1i(this.#sPalette, 1)
		gl.uniform2f(this.#sFlip, 1, -1)

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
		gl.enableVertexAttribArray(this.#sVertexPosition)
		gl.vertexAttribPointer(this.#sVertexPosition, 2, gl.FLOAT, false, 0, 0)

		this.#tAtlas = gl.createTexture()
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.#tAtlas)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 1024, 1024, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(1024 * 1024))

		this.#tPalette = gl.createTexture()
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this.#tPalette)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(32 * 32 * 4))

		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	}

	set(canvasId, width, height) {
		gl = document.getElementById(canvasId).getContext('webgl2')
		this.#init()
		gl.uniform2f(this.#sResolution, width, height)
		this.flip(false, false)
	}

	flip(flipX, flipY) {
		if (flipX && flipY)
			gl.uniform2f(this.#sFlip, -1, 1)
		else if (flipX)
			gl.uniform2f(this.#sFlip, -1, -1)
		else if (flipY)
			gl.uniform2f(this.#sFlip, 1, -1)
		else
			gl.uniform2f(this.#sFlip, 1, 1)
	}

	position(x, y) {
		gl.uniform2f(this.#sPosition, Math.round(x), Math.round(y))
	}

	sprite({ offsetX, offsetY, width, height }) {
		gl.uniform4f(this.#sSprite, offsetX, offsetY, width, height)
	}

	camera(x, y) {
		gl.uniform2f(this.#sCamera, x, y)
	}

	uploadPalette(data, palette) {
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this.#tPalette)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, palette, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data))
	}

	palette(number) {
		gl.uniform1i(this.#sSwitchPalette, number)
	}

	uploadSprite(data, { offsetX, offsetY, width, height }) {
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.#tAtlas)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, width, height, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(data))
	}

	clear() {
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.clearColor(1.0, 0.5, 0.5, 1.0)
	}

	draw() {
		gl.drawArrays(gl.TRIANGLES, 0, 6)
	}
}
export const pixel = new Draw