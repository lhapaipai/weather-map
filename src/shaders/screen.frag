#version 300 es

precision highp float;

uniform float u_opacity;
uniform sampler2D u_screen;

in vec2 v_uv;

out vec4 out_color;

void main() {
  vec4 color = texture(u_screen, v_uv);
  out_color = floor(255.*color*u_opacity) / 255.;
}