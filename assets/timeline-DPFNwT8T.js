var E=Object.defineProperty;var C=(o,n,e)=>n in o?E(o,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[n]=e;var s=(o,n,e)=>C(o,typeof n!="symbol"?n+"":n,e);import{c as d,b as l,a as x,d as v,i as S,r as A,e as g,f as p,g as R,s as b,h as F,G as N,L as I,B as q}from"./util-xNjKdgpA.js";var D=`#version 300 es

precision highp float;

uniform sampler2D u_wind_prev;
uniform sampler2D u_wind_next;
uniform float u_wind_factor;

uniform sampler2D u_color_ramp;

in vec2 v_particle_pos;

out vec4 out_color;

void main() {
  
  vec4 raw_wind_color = mix(
    texture(u_wind_prev, vec2(v_particle_pos.x, v_particle_pos.y)),
    texture(u_wind_next, vec2(v_particle_pos.x, v_particle_pos.y)),
    u_wind_factor
  );

  
  vec2 wind = vec2(
    (raw_wind_color.r * 65280. + raw_wind_color.b * 255.) - 32768.,
    (raw_wind_color.g * 65280. + raw_wind_color.a * 255.) - 32768.
  ) / 100.;

  float wind_length = length(wind);

  float wind_normalized = wind_length / 120.;

  out_color = texture(u_color_ramp, vec2(wind_normalized, .5));
}`,L=`#version 300 es

precision highp float;

uniform sampler2D u_wind_prev;
uniform sampler2D u_wind_next;
uniform float u_wind_factor;
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
  vec4 tl = mix(
    texture(u_wind_prev, vc),
    texture(u_wind_next, vc),
    u_wind_factor
  );
  vec4 tr = mix(
    texture(u_wind_prev, vc + vec2(px.x, 0.)),
    texture(u_wind_next, vc + vec2(px.x, 0.)),
    u_wind_factor
  );
  vec4 bl = mix(
    texture(u_wind_prev, vc + vec2(0., px.y)),
    texture(u_wind_next, vc + vec2(0., px.y)),
    u_wind_factor
  );
  vec4 br = mix(
    texture(u_wind_prev, vc + px),
    texture(u_wind_next, vc + px),
    u_wind_factor
  );

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
}`;class M{constructor(n,e){s(this,"fadeOpacity",.975);s(this,"speedFactor",.87);s(this,"_numParticles",0);s(this,"dropRate",.003);s(this,"dropRateBump",.01);s(this,"debug",!1);s(this,"timelineSpeedFactor",1200);s(this,"onFrame",null);s(this,"frameBuffer");s(this,"manifest",null);s(this,"timeStart",0);s(this,"timeEnd",0);s(this,"_timeCurrent",0);s(this,"timeReferenceAnimation",0);s(this,"renderTimeStart",null);s(this,"_isPlaying",!1);s(this,"windTextures",[]);s(this,"colorRampTexture");s(this,"gl");s(this,"draw");s(this,"update");s(this,"screen");s(this,"square");s(this,"render",n=>{var f;if(this.windTextures.length===0||!this.manifest)return;const{gl:e}=this,t=n/1e3,r=this.timeEnd-this.timeStart;let i=0;this.isPlaying&&r!==0?(this.renderTimeStart===null&&(console.log("reinit time start"),this.renderTimeStart=t-(this.timeCurrent-this.timeStart)/this.timelineSpeedFactor),i=(t-this.renderTimeStart)*this.timelineSpeedFactor%r,this._timeCurrent=this.timeStart+i):i=this.timeCurrent-this.timeStart;let a=0,h=0,m=0;if(this.windTextures.length>1){const w=this.windTextures.length*i/r;a=Math.floor(w)%this.windTextures.length,h=Math.ceil(w)%this.windTextures.length,m=w-Math.floor(w)}l(e,this.windTextures[a],5),l(e,this.windTextures[h],6),A(this.canvas)&&this.initTextures(),g(e,this.frameBuffer,this.screenTexture),e.viewport(0,0,e.canvas.width,e.canvas.height),this.drawScreen(this.previousScreenTexture,this.fadeOpacity),this.drawParticles(m),this.updateParticles(m),g(e,null),e.viewport(0,0,e.canvas.width,e.canvas.height),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),this.drawScreen(this.screenTexture,1),e.disable(e.BLEND);let c=this.previousScreenTexture;this.previousScreenTexture=this.screenTexture,this.screenTexture=c,c=this.particlePositionCurrent,this.particlePositionCurrent=this.particlePositionNext,this.particlePositionNext=c,l(e,this.particlePositionCurrent,2),(f=this.onFrame)==null||f.call(this,this.timeCurrent),requestAnimationFrame(this.render)});this.canvas=n,this.windSpeedRampColor=e;const t=n.getContext("webgl2");t.disable(t.DEPTH_TEST),t.disable(t.STENCIL_TEST),t.enable(t.CULL_FACE),this.gl=t,this.frameBuffer=t.createFramebuffer(),this.colorRampTexture=d(t,t.LINEAR,B(this.windSpeedRampColor),256,1),l(t,this.colorRampTexture,1),this.draw=x(t,R,D),this.update=x(t,b,L),this.screen=x(t,b,F),this.square={position:v(t,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1])),uv:v(t,new Float32Array([0,1,0,0,1,1,1,1,0,0,1,0]))},this.numParticles=53824}set numParticles(n){const{gl:e}=this,t=Math.floor(Math.sqrt(n));this._numParticles=t*t;const r=new Uint8Array(this._numParticles*4);for(let a=0;a<r.length;a++)r[a]=Math.floor(Math.random()*256);this.particlePositionCurrent=d(e,e.NEAREST,r,t,t),l(e,this.particlePositionCurrent,2),this.particlePositionNext=d(e,e.NEAREST,r,t,t),l(e,this.particlePositionNext,3);const i=new Float32Array(this._numParticles);for(let a=0;a<i.length;a++)i[a]=a;this.particleIndexBuffer=v(e,i)}get numParticles(){return this._numParticles}initTextures(){console.log("initTextures");const{gl:n}=this,{width:e,height:t}=n.canvas,r=new Uint8Array(e*t*4);this.previousScreenTexture=d(n,n.NEAREST,r,e,t),this.screenTexture=d(n,n.NEAREST,r,e,t)}async setTimeline(n,e){const{gl:t}=this,r=new Date(n.dateStart).getTime()/1e3,i=new Date(n.dateEnd).getTime()/1e3;this.manifest=n;const[a,...h]=n.textures;this.timeStart=this.timeEnd=this._timeCurrent=r;const m=await S(`${e}/${a.filename}`);this.windTextures=[d(t,t.LINEAR,m)],requestAnimationFrame(this.render),Promise.all(h.map(({filename:c})=>S(`${e}/${c}`))).then(c=>{this.windTextures=[...this.windTextures,...c.map(f=>d(t,t.LINEAR,f))],this.timeEnd=i}),this.isPlaying=!0}set isPlaying(n){this._isPlaying=n,this.renderTimeStart=null}get isPlaying(){return this._isPlaying}set timeCurrent(n){console.log("setTimecurrent",n),this.isPlaying=!1,this._timeCurrent=n}get timeCurrent(){return this._timeCurrent}drawScreen(n,e){const{gl:t}=this,{program:r,locations:i}=this.screen;t.useProgram(r),p(t,this.square.position,i.a_position,2),p(t,this.square.uv,i.a_uv,2),l(t,n,4),t.uniform1i(i.u_screen,4),t.uniform1f(i.u_opacity,e),t.drawArrays(t.TRIANGLES,0,6)}drawParticles(n){const{gl:e}=this,{program:t,locations:r}=this.draw;e.useProgram(t),p(e,this.particleIndexBuffer,r.a_index,1),e.uniform1i(r.u_wind_prev,5),e.uniform1i(r.u_wind_next,6),e.uniform1f(r.u_wind_factor,n),e.uniform1i(r.u_color_ramp,1),e.uniform1i(r.u_particle_position_current,2),e.uniform1f(r.u_tex_width,Math.sqrt(this._numParticles)),e.drawArrays(e.POINTS,0,this._numParticles)}updateParticles(n){if(!this.manifest)return;const{gl:e}=this,t=Math.sqrt(this._numParticles);g(e,this.frameBuffer,this.particlePositionNext),e.viewport(0,0,t,t);const{program:r,locations:i}=this.update;e.useProgram(r),p(e,this.square.position,i.a_position,2),p(e,this.square.uv,i.a_uv,2),e.uniform1i(i.u_wind_prev,5),e.uniform1i(i.u_wind_next,6),e.uniform1f(i.u_wind_factor,n),e.uniform1i(i.u_particle_position_current,2),e.uniform2f(i.u_wind_res,this.manifest.width,this.manifest.height),e.uniform4fv(i.u_bbox,this.manifest.bbox),e.uniform1f(i.u_speed_factor,this.speedFactor),e.uniform1f(i.u_rand_seed,Math.random()),e.uniform1f(i.u_drop_rate,this.dropRate),e.uniform1f(i.u_drop_rate_bump,this.dropRateBump),e.drawArrays(e.TRIANGLES,0,6)}}function B(o){const n=document.createElement("canvas"),e=n.getContext("2d");n.width=256,n.height=1;const t=120,r=e.createLinearGradient(0,0,256,0);for(const i in o){const a=parseInt(i)/t;r.addColorStop(a,o[i])}return e.fillStyle=r,e.fillRect(0,0,256,1),new Uint8Array(e.getImageData(0,0,256,1).data)}const _=new N,y={0:"#3288bd",5:"#66c2a5",10:"#abdda4",20:"#e6f598",30:"#fee08b",40:"#fdae61",50:"#f46d43",60:"#d53e4f",80:"#9e0142",100:"#67001f",120:"#40000c"},U=document.querySelector("#date"),$=document.querySelector("#hours"),O=document.querySelector("#wind"),u=new M(O,y);new I(y);_.add(u,"numParticles",1024,589824).name("Nombre particules");_.add(u,"fadeOpacity",.01,.999).step(.001).name("Opacité de la trainée");_.add(u,"speedFactor",.05,1).name("Vitesse particules");_.add(u,"dropRate",0,.1).name("Longévité 1");_.add(u,"dropRateBump",0,.2).name("Longévité 2");_.add(u,"timelineSpeedFactor",0,14400).step(600).name("Facteur de vitesse");const T="/wind-map",P="/AROMEPI-001/UV_WIND_15MIN/2024-09-21_12-00-00";Promise.all([fetch(`${T}/metropole.geojson`).then(o=>o.json()),fetch(`${T}${P}/manifest.json`).then(o=>o.json())]).then(([o,n])=>{const e=document.querySelector("#boundary");new q(e,o,n.bbox),_.add(u,"timeCurrent",new Date(n.dateStart).getTime()/1e3,new Date(n.dateEnd).getTime()/1e3).onFinishChange(()=>{u.isPlaying=!0}).name("Timestamp").listen(),u.setTimeline(n,`${T}${P}`),u.onFrame=t=>{const r=new Date(t*1e3);U.textContent=r.toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),$.textContent=r.getHours().toString()}});
