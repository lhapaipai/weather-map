#version 300 es

precision highp float;

uniform sampler2D u_precipitation;
uniform sampler2D u_color_ramp;
uniform float u_opacity;
uniform float u_max_precipitation;

in vec2 v_uv;

out vec4 out_color;

void main() {
  vec4 precipitation_color = texture(u_precipitation, v_uv);
  float precipitation =  precipitation_color.r * 65280. + precipitation_color.g * 255.;

  float precipitation_normalized = precipitation / u_max_precipitation;
  
  float is_visible = smoothstep(0., 10., precipitation);

  out_color = vec4(texture(u_color_ramp, vec2(precipitation_normalized, .5)).rgb, is_visible * u_opacity);

  // out_color = vec4(texture(u_color_ramp, vec2(v_uv.x, .5)).rgb, u_opacity);
}