#version 300 es

precision highp float;

uniform sampler2D u_wind_prev;
uniform sampler2D u_wind_next;
uniform float u_wind_factor;

uniform sampler2D u_color_ramp;

in vec2 v_particle_pos;

out vec4 out_color;

void main() {
  /**
   * v_particle_pos origin : left-top
   * u_wind HTMLImageElement. origin : left-top
   */
  vec4 raw_wind_color = mix(
    texture(u_wind_prev, vec2(v_particle_pos.x, v_particle_pos.y)),
    texture(u_wind_next, vec2(v_particle_pos.x, v_particle_pos.y)),
    u_wind_factor
  );

  // 65535 - 255 = 65280
  vec2 wind = vec2(
    (raw_wind_color.r * 65280. + raw_wind_color.b * 255.) - 32768.,
    (raw_wind_color.g * 65280. + raw_wind_color.a * 255.) - 32768.
  ) / 100.;

  float wind_length = length(wind);

  float wind_normalized = wind_length / 120.;

  out_color = texture(u_color_ramp, vec2(wind_normalized, .5));
}