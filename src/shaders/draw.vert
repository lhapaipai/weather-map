#version 300 es

in float a_index;

uniform sampler2D u_particle_position_current;
uniform float u_tex_width;

out vec2 v_particle_pos;

void main() {
  vec4 pos_color = texture(u_particle_position_current, vec2(
    fract(a_index/u_tex_width),
    floor(a_index/u_tex_width) / u_tex_width
  ));

  v_particle_pos = vec2(
    pos_color.r+pos_color.b/255.,
    pos_color.g+pos_color.a/255.
  );

  vec2 clipSpace = vec2(1., -1.) * (2.*v_particle_pos - 1.);

  gl_PointSize = 1.0;
  gl_Position = vec4(clipSpace, 0., 1.);
}