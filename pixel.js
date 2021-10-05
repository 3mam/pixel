var gl


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

uniform sampler2D canvas;
uniform sampler2D palette;
uniform int switch_palette;
in vec2 uv;
out vec4 outColor;

void main() {
	int color = int(texelFetch(canvas, ivec2(uv),0).a*255.0);
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


export class Pixel {
	#texture
	#palette
	#shavar

	#init() {
		const program = createShader(verTex, fragTex)
		gl.useProgram(program)
		this.#shavar = {
			vertexPosition: gl.getAttribLocation(program, "vertex_position"),
			texture: gl.getUniformLocation(program, "canvas"),
			palette: gl.getUniformLocation(program, "palette"),
			resolution: gl.getUniformLocation(program, "resolution"),
			sprite: gl.getUniformLocation(program, "sprite"),
			position: gl.getUniformLocation(program, "position"),
			camera: gl.getUniformLocation(program, "camera"),
			switchPalette: gl.getUniformLocation(program, "switch_palette"),
			flip: gl.getUniformLocation(program, "flip")
		}

		gl.uniform1i(this.#shavar.texture, 0)
		gl.uniform1i(this.#shavar.palette, 1)
		gl.uniform2f(this.#shavar.flip, 1, -1)

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
		gl.enableVertexAttribArray(this.#shavar.vertexPosition)
		gl.vertexAttribPointer(this.#shavar.vertexPosition, 2, gl.FLOAT, false, 0, 0)

		this.#texture = gl.createTexture()
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.#texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 1024, 1024, 0, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(1024 * 1024))

		this.#palette = gl.createTexture()
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this.#palette)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(32 * 32 * 4))

		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	}


	static create(canvasId, width, height) {
		gl = document.getElementById(canvasId).getContext('webgl2')
		const pixel = new Pixel
		pixel.#init()
		gl.uniform2f(pixel.#shavar.resolution, width, height)
		pixel.flip(false, false)
		return pixel
	}

	flip(flipX, flipY) {
		if (flipX && flipY)
			gl.uniform2f(this.#shavar.flip, -1, 1)
		else if (flipX)
			gl.uniform2f(this.#shavar.flip, -1, -1)
		else if (flipY)
			gl.uniform2f(this.#shavar.shader.flip, 1, -1)
		else
			gl.uniform2f(this.#shavar.flip, 1, 1)

		return this
	}

	position(x, y) {
		gl.uniform2f(this.#shavar.position, Math.round(x), Math.round(y))
		return this
	}

	sprite(offsetX, offsetY, width, height) {
		gl.uniform4f(this.#shavar.sprite, offsetX, offsetY, width, height)
		return this
	}

	camera(x, y) {
		gl.uniform2f(this.#shavar.camera, x, y)
		return this
	}

	uploadPalette(palette, colors) {
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this.#palette)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, palette, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(colors))
		return this
	}

	palette(number) {
		gl.uniform1i(this.#shavar.switchPalette, number)
		return this
	}

	uploadSprite(data, offsetX, offsetY, width, height) {
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.#texture)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, width, height, gl.ALPHA, gl.UNSIGNED_BYTE, new Uint8Array(data))
		return this
	}

	clear() {
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.clearColor(1.0, 0.5, 0.5, 1.0)
		return this
	}

	draw() {
		gl.drawArrays(gl.TRIANGLES, 0, 6)
		return this
	}
}

