export const verTex = `#version 300 es
uniform vec2 resolution;
uniform vec4 sprite;
uniform vec2 position;
uniform vec2 camera;
uniform vec2 flip;
uniform float index;
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
	gl_Position = vec4((a + cam), index, 1)*vec4(1,-1,-1,1);
}
`

export const fragTex = `#version 300 es
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