var v=Object.defineProperty;var x=(o,e,t)=>e in o?v(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var i=(o,e,t)=>x(o,typeof e!="symbol"?e+"":e,t);import{c as d,b as c,a as _,d as f,r as g,e as h,f as p,g as b,s as m,h as P,i as T,G as S,L as E,B as y}from"./util-xNjKdgpA.js";var A=`#version 300 es

precision highp float;

uniform sampler2D u_wind;
uniform sampler2D u_color_ramp;

in vec2 v_particle_pos;

out vec4 out_color;

void main() {
  
  vec4 raw_wind_color = texture(u_wind, vec2(v_particle_pos.x, v_particle_pos.y));

  
  vec2 wind = vec2(
    (raw_wind_color.r * 65280. + raw_wind_color.b * 255.) - 32768.,
    (raw_wind_color.g * 65280. + raw_wind_color.a * 255.) - 32768.
  ) / 100.;

  float wind_length = length(wind);

  float wind_normalized = wind_length / 120.;

  out_color = texture(u_color_ramp, vec2(wind_normalized, .5));
}`,R=`#version 300 es

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
  
  vec2 px = 1.0 / u_wind_res;

  
  
  vec2 vc = (floor(uv * u_wind_res)) * px;

  
  vec2 f = fract(uv * u_wind_res);
  vec4 tl = texture(u_wind, vc);
  vec4 tr = texture(u_wind, vc + vec2(px.x, 0.));
  vec4 bl = texture(u_wind, vc + vec2(0., px.y));
  vec4 br = texture(u_wind, vc + px);

  vec4 raw_wind_color = mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);

  
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

  pos = fract(1.+pos+offset);

  /** todo:begin */
    vec2 seed = (pos + v_uv) * u_rand_seed;

  float speed = length(wind) / 120.;
  float drop_rate = u_drop_rate + speed * u_drop_rate_bump;
  float drop = step(1.0 - drop_rate, rand(seed));

  vec2 random_pos = vec2(
      rand(seed + 1.3),
      rand(seed + 2.1));
  pos = mix(pos, random_pos, drop);
  /** todo:end */

  out_color = vec4(
    (floor(pos*255.)/255.),
    fract(pos*255.)
  );
}`;class C{constructor(e,t){i(this,"fadeOpacity",.975);i(this,"speedFactor",.87);i(this,"_numParticles",0);i(this,"dropRate",.003);i(this,"dropRateBump",.01);i(this,"debug",!1);i(this,"frameBuffer");i(this,"wind",null);i(this,"colorRampTexture");i(this,"gl");i(this,"draw");i(this,"update");i(this,"screen");i(this,"square");i(this,"render",()=>{if(!this.wind)return;const{gl:e}=this;g(this.canvas)&&this.initTextures(),h(e,this.frameBuffer,this.screenTexture),e.viewport(0,0,e.canvas.width,e.canvas.height),this.drawScreen(this.previousScreenTexture,this.fadeOpacity),this.drawParticles(),this.updateParticles(),h(e,null),e.viewport(0,0,e.canvas.width,e.canvas.height),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),this.drawScreen(this.screenTexture,1),e.disable(e.BLEND);let t=this.previousScreenTexture;this.previousScreenTexture=this.screenTexture,this.screenTexture=t,t=this.particlePositionCurrent,this.particlePositionCurrent=this.particlePositionNext,this.particlePositionNext=t,c(e,this.particlePositionCurrent,2),requestAnimationFrame(this.render)});this.canvas=e,this.windSpeedRampColor=t;const n=e.getContext("webgl2");n.disable(n.DEPTH_TEST),n.disable(n.STENCIL_TEST),n.enable(n.CULL_FACE),this.gl=n,this.frameBuffer=n.createFramebuffer(),this.colorRampTexture=d(n,n.LINEAR,q(this.windSpeedRampColor),256,1),c(n,this.colorRampTexture,1),this.draw=_(n,b,A),this.update=_(n,m,R),this.screen=_(n,m,P),this.square={position:f(n,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1])),uv:f(n,new Float32Array([0,1,0,0,1,1,1,1,0,0,1,0]))},this.numParticles=53824}setWind(e,t){const{gl:n}=this;this.wind={data:e,texture:d(n,n.LINEAR,t)},c(n,this.wind.texture,5),requestAnimationFrame(this.render)}set numParticles(e){const{gl:t}=this,n=Math.floor(Math.sqrt(e));this._numParticles=n*n;const r=new Uint8Array(this._numParticles*4);for(let s=0;s<r.length;s++)r[s]=Math.floor(Math.random()*256);this.particlePositionCurrent=d(t,t.NEAREST,r,n,n),c(t,this.particlePositionCurrent,2),this.particlePositionNext=d(t,t.NEAREST,r,n,n),c(t,this.particlePositionNext,3);const a=new Float32Array(this._numParticles);for(let s=0;s<a.length;s++)a[s]=s;this.particleIndexBuffer=f(t,a)}get numParticles(){return this._numParticles}initTextures(){console.log("initTextures");const{gl:e}=this,{width:t,height:n}=e.canvas,r=new Uint8Array(t*n*4);this.previousScreenTexture=d(e,e.NEAREST,r,t,n),this.screenTexture=d(e,e.NEAREST,r,t,n)}drawScreen(e,t){const{gl:n}=this,{program:r,locations:a}=this.screen;n.useProgram(r),p(n,this.square.position,a.a_position,2),p(n,this.square.uv,a.a_uv,2),c(n,e,4),n.uniform1i(a.u_screen,4),n.uniform1f(a.u_opacity,t),n.drawArrays(n.TRIANGLES,0,6)}drawParticles(){const{gl:e}=this,{program:t,locations:n}=this.draw;e.useProgram(t),p(e,this.particleIndexBuffer,n.a_index,1),e.uniform1i(n.u_wind,5),e.uniform1i(n.u_color_ramp,1),e.uniform1i(n.u_particle_position_current,2),e.uniform1f(n.u_tex_width,Math.sqrt(this._numParticles)),e.drawArrays(e.POINTS,0,this._numParticles)}updateParticles(){if(!this.wind)return;const{gl:e}=this,t=Math.sqrt(this._numParticles);h(e,this.frameBuffer,this.particlePositionNext),e.viewport(0,0,t,t);const{program:n,locations:r}=this.update;e.useProgram(n),p(e,this.square.position,r.a_position,2),p(e,this.square.uv,r.a_uv,2),e.uniform1i(r.u_wind,5),e.uniform1i(r.u_particle_position_current,2),e.uniform2f(r.u_wind_res,this.wind.data.width,this.wind.data.height),e.uniform4fv(r.u_bbox,this.wind.data.bbox),e.uniform1f(r.u_speed_factor,this.speedFactor),e.uniform1f(r.u_rand_seed,Math.random()),e.uniform1f(r.u_drop_rate,this.dropRate),e.uniform1f(r.u_drop_rate_bump,this.dropRateBump),e.drawArrays(e.TRIANGLES,0,6)}}function q(o){const e=document.createElement("canvas"),t=e.getContext("2d");e.width=256,e.height=1;const n=120,r=t.createLinearGradient(0,0,256,0);for(const a in o){const s=parseInt(a)/n;r.addColorStop(s,o[a])}return t.fillStyle=r,t.fillRect(0,0,256,1),new Uint8Array(t.getImageData(0,0,256,1).data)}class B{constructor(e,t){this.windMap=e,this.value=t}set value(e){this._value!==e&&(Promise.all([fetch(`/wind-map/basic/${e}.json`).then(t=>t.json()),T(`/wind-map/basic/${e}.png`)]).then(([t,n])=>{this.windMap.setWind(t,n)}),this._value=e)}get value(){return this._value}}const u=new S,w={0:"#3288bd",5:"#66c2a5",10:"#abdda4",20:"#e6f598",30:"#fee08b",40:"#fdae61",50:"#f46d43",60:"#d53e4f",80:"#9e0142",100:"#67001f",120:"#40000c"},N=document.querySelector("#wind"),l=new C(N,w);new E(w);u.add(l,"numParticles",1024,589824);u.add(l,"fadeOpacity",.01,.999).step(.001);u.add(l,"speedFactor",.05,1);u.add(l,"dropRate",0,.1);u.add(l,"dropRateBump",0,.2);u.add(new B(l,"wind_2024-09-18_06-00-00"),"value",["wind_2024-09-18_06-00-00","wind_debug"]).name("texture");const L=[-5.584626288659794,40.774618181818184,10.225373711340218,51.984618181818185];fetch("/wind-map/metropole.geojson").then(o=>o.json()).then(o=>{const e=document.querySelector("#boundary");new y(e,o,L)});
