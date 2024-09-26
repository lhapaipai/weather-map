#version 300 es

precision highp float;

uniform sampler2D u_precipitation_prev;
uniform sampler2D u_precipitation_next;
uniform sampler2D u_precipitation_next_2;
uniform float u_precipitation_factor;

uniform sampler2D u_color_ramp;
uniform float u_opacity;
uniform float u_max_precipitation;

in vec2 v_uv;

out vec4 out_color;

void main() {
  vec4 precipitation_color = mix(
    texture(u_precipitation_prev, v_uv),
    texture(u_precipitation_next, v_uv),
    u_precipitation_factor
  );

  float precipitation =  precipitation_color.r * 65280. + precipitation_color.g * 255.;

  float precipitation_normalized = precipitation / u_max_precipitation;
  
  float is_visible = smoothstep(14., 15., precipitation);
  // float is_visible = step(1., precipitation);

  out_color = vec4(texture(u_color_ramp, vec2(precipitation_normalized, .5)).rgb, is_visible * u_opacity);

  // out_color = vec4(texture(u_color_ramp, vec2(v_uv.x, .5)).rgb, u_opacity);
}