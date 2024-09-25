#version 300 es

precision highp float;

uniform sampler2D u_wind;
uniform sampler2D u_particle_position_current;

uniform vec2 u_wind_res;
uniform vec4 u_bbox;
uniform float u_speed_factor;

uniform float u_rand_seed;
uniform float u_drop_rate;
uniform float u_drop_rate_bump;


in vec2 v_uv;

out vec4 out_color;

const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
float rand(const vec2 co) {
    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));
}

vec2 lookup_wind(const vec2 uv) {
  // vec4 raw_wind_color = texture(u_wind, uv);
  vec2 px = 1.0 / u_wind_res;

  // vc -> uv un peu modifié pour tomber sur le centre du pixel concerné
  // de cette manière c'est plus facile de regarder autour.
  vec2 vc = (floor(uv * u_wind_res)) * px;

  /**
   *  tl (référence)   tr
   *  bl               br
   * 
   * f = vec2(.2, .5) -> pour la composante horizontale on prendra 20% de tl et 80% de tr
   */
  vec2 f = fract(uv * u_wind_res);
  vec4 tl = texture(u_wind, vc);
  vec4 tr = texture(u_wind, vc + vec2(px.x, 0.));
  vec4 bl = texture(u_wind, vc + vec2(0., px.y));
  vec4 br = texture(u_wind, vc + px);

  vec4 raw_wind_color = mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);

  // 65280 -> 65535 - 255
  return vec2(
    (raw_wind_color.r * 65280. + raw_wind_color.b * 255.) - 32768.,
    (raw_wind_color.g * 65280. + raw_wind_color.a * 255.) - 32768.
  ) / 100.;
}

void main() {
  vec4 pos_color = texture(u_particle_position_current, v_uv);
  vec2 pos = vec2(
    pos_color.r+pos_color.b/255.,
    pos_color.g+pos_color.a/255.
  );

  vec2 wind = lookup_wind(pos);

  /**
   * u_bbox = [left, bottom, right, top]
   * à cause de la projection une particule devra se déplacer plus vers les pôles
   * qui prennent plus de surface de carte qu'au niveau de l'équateur.
   * selon la donnée de météo france wind.y positif correspond à un déplacement du
   * sud vers le nord, nous avons besoin de l'intervertir 
   */
  float distortion = cos(radians(mix(u_bbox[3], u_bbox[1], pos.y)));
  vec2 offset = vec2(wind.x / distortion, -wind.y) * .0001 * u_speed_factor;

  pos = pos+offset;

  /** todo:begin */
    vec2 seed = (pos + v_uv) * u_rand_seed;

  float speed = length(wind) / 120.;
  /**
   * drop_rate correspond à la durée de vie d'une particule
   * on peut allonger ou diminuer la durée de vie avec u_drop_rate
   * les particules rapides vont également avoir tendance à s'accumuler 
   * plus rapidement. Il convient donc de leur donner une durée de vie plus faible
   * 
   * plus u_drop_rate est important plus la durée de vie de la particule est courte.
   * plus u_drop_rate_bump est important plus la vitesse de la particule raccourcira
   * la durée de vie de la particule.
   */
  float drop_rate = u_drop_rate + speed * u_drop_rate_bump;
  float drop = step(1.0 - drop_rate, rand(seed));

  /* les valeures 1.1 et 2.9 sont subjectives */
  vec2 random_pos = vec2(
      rand(seed + 1.1),
      rand(seed + 2.9)
  );
  pos = mix(pos, random_pos, drop);

  /**
   * si l'élément est sorti de l'écran réinitialiser sa position
   */
  float mask = clamp(
    step(1.0, pos.x) + step(0., -pos.x) + step(1.0, pos.y) + step(0., -pos.y),
    0.,
    1.
  );
  pos = pos * (1.-mask) + random_pos * mask;

  out_color = vec4(
    (floor(pos*255.)/255.),
    fract(pos*255.)
  );
}