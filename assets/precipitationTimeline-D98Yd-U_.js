var w=Object.defineProperty;var b=(n,e,t)=>e in n?w(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var r=(n,e,t)=>b(n,typeof e!="symbol"?e+"":e,t);import{a as E,d as T,c as d,g as F,b as _,h as v,r as P,f as C,s as M,G as A,L as I,B as R}from"./util-hbtArgU2.js";var q=`#version 300 es

precision highp float;

uniform sampler2D u_precipitation_prev;
uniform sampler2D u_precipitation_next;
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
  
  float is_visible = smoothstep(0., 1., precipitation);
  

  out_color = vec4(texture(u_color_ramp, vec2(precipitation_normalized, .5)).rgb, is_visible * u_opacity);

  
}`;class D{constructor(e,t){r(this,"debug",!1);r(this,"opacity",1);r(this,"_rampMaxColors",0);r(this,"timelineSpeedFactor",1200);r(this,"onFrame",null);r(this,"manifest",null);r(this,"timeStart",0);r(this,"timeEnd",0);r(this,"_timeCurrent",0);r(this,"timeReferenceAnimation",0);r(this,"renderTimeStart",null);r(this,"_isPlaying",!1);r(this,"precipitationTextures",[]);r(this,"gl");r(this,"screen");r(this,"square");r(this,"render",e=>{var x;if(this.precipitationTextures.length===0||!this.manifest)return;const{gl:t}=this,i=e/1e3,o=this.timeEnd-this.timeStart;let c=0;this.isPlaying&&o!==0?(this.renderTimeStart===null&&(console.log("reinit time start"),this.renderTimeStart=i-(this.timeCurrent-this.timeStart)/this.timelineSpeedFactor),c=(i-this.renderTimeStart)*this.timelineSpeedFactor%o,this._timeCurrent=this.timeStart+c):c=this.timeCurrent-this.timeStart;let l=0,u=0,m=0;if(this.precipitationTextures.length>1){const h=this.precipitationTextures.length*c/o;l=Math.floor(h)%this.precipitationTextures.length,u=Math.ceil(h)%this.precipitationTextures.length,m=h-Math.floor(h)}_(t,this.precipitationTextures[l],2),_(t,this.precipitationTextures[u],3),P(this.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height);const{program:p,locations:a}=this.screen;t.useProgram(p),C(t,this.square.position,a.a_position,2),C(t,this.square.uv,a.a_uv,2),t.uniform1i(a.u_color_ramp,1),t.uniform1i(a.u_precipitation_prev,2),t.uniform1i(a.u_precipitation_next,3),t.uniform1f(a.u_precipitation_factor,m),t.uniform1f(a.u_opacity,this.opacity),t.uniform1f(a.u_max_precipitation,100),t.drawArrays(t.TRIANGLES,0,6),(x=this.onFrame)==null||x.call(this,this.timeCurrent),requestAnimationFrame(this.render)});this.canvas=e,this.rampColor=t;const i=e.getContext("webgl2");i.enable(i.CULL_FACE),this.gl=i,this.screen=E(i,M,q),this.square={position:T(i,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1])),uv:T(i,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1]))},this.rampMaxColors=32}set rampMaxColors(e){const{gl:t}=this,i=Math.floor(e/2)*2;this.colorRampTexture=d(t,t.LINEAR,F(this.rampColor,i),i,1),_(t,this.colorRampTexture,1),this._rampMaxColors=i}get rampMaxColors(){return this._rampMaxColors}async setTimeline(e,t){const{gl:i}=this,o=new Date(e.dateStart).getTime()/1e3,c=new Date(e.dateEnd).getTime()/1e3;this.manifest=e;const[l,...u]=e.textures;this.timeStart=this.timeEnd=this._timeCurrent=o;const m=await v(`${t}/${l.filename}`);this.precipitationTextures=[d(i,i.LINEAR,m)],requestAnimationFrame(this.render),Promise.all(u.map(({filename:p})=>v(`${t}/${p}`))).then(p=>{this.precipitationTextures=[...this.precipitationTextures,...p.map(a=>d(i,i.LINEAR,a))],this.timeEnd=c}),this.isPlaying=!0}set isPlaying(e){this._isPlaying=e,this.renderTimeStart=null}get isPlaying(){return this._isPlaying}set timeCurrent(e){console.log("setTimecurrent",e),this.isPlaying=!1,this._timeCurrent=e}get timeCurrent(){return this._timeCurrent}}const f=new A,S={0:"#ffffff",4:"#ffffff",5:"#0000ff",10:"#00ffff",20:"#00ff00",30:"#ffff00",40:"#ffbf00",50:"#ff8000",60:"#ff0000",70:"#bf0000",80:"#800000",90:"#4b0000",100:"#280000"},L=document.querySelector("#date"),$=document.querySelector("#hours"),z=document.querySelector("#principal-canvas"),s=new D(z,S);new I(S,"Réflectivité dBZ");f.add(s,"rampMaxColors",2,64);f.add(s,"opacity",0,1);f.add(s,"timelineSpeedFactor",0,14400).step(600).name("Facteur de vitesse");const g="/weather-map",y="/AROMEPI-001/REFLECTIVITY/2024-09-26_08-00-00";Promise.all([fetch(`${g}/metropole.geojson`).then(n=>n.json()),fetch(`${g}${y}/manifest.json`).then(n=>n.json())]).then(([n,e])=>{const t=document.querySelector("#boundary");new R(t,n,e.bbox),f.add(s,"timeCurrent",new Date(e.dateStart).getTime()/1e3,new Date(e.dateEnd).getTime()/1e3).onFinishChange(()=>{s.isPlaying=!0}).name("Timestamp").listen(),s.setTimeline(e,`${g}${y}`),s.onFrame=i=>{const o=new Date(i*1e3);L.textContent=o.toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),$.textContent=o.getHours().toString()}});
