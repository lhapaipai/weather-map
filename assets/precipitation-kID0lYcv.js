var f=Object.defineProperty;var m=(e,t,a)=>t in e?f(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var r=(e,t,a)=>m(e,typeof t!="symbol"?t+"":t,a);import{a as _,d as s,c,b as p,g as h,r as v,f as l,s as d,G as g,L as x,B as y}from"./util-hbtArgU2.js";import{D as C}from"./DataImageHelper-BI3HoZXz.js";var b=`#version 300 es

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

  
}`;class w{constructor(t,a){r(this,"debug",!1);r(this,"opacity",1);r(this,"_rampMaxColors",0);r(this,"precipitation",null);r(this,"gl");r(this,"screen");r(this,"square");r(this,"render",()=>{if(!this.precipitation)return;const{gl:t}=this;v(this.canvas),t.viewport(0,0,t.canvas.width,t.canvas.height);const{program:a,locations:i}=this.screen;t.useProgram(a),l(t,this.square.position,i.a_position,2),l(t,this.square.uv,i.a_uv,2),t.uniform1i(i.u_color_ramp,1),t.uniform1i(i.u_precipitation,2),t.uniform1f(i.u_opacity,this.opacity),t.uniform1f(i.u_max_precipitation,100),t.drawArrays(t.TRIANGLES,0,6),requestAnimationFrame(this.render)});this.canvas=t,this.rampColor=a;const i=t.getContext("webgl2");i.enable(i.CULL_FACE),this.gl=i,this.screen=_(i,d,b),this.square={position:s(i,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1])),uv:s(i,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1]))},this.rampMaxColors=32}setDataImage(t,a){const{gl:i}=this;this.precipitation={data:t,texture:c(i,i.LINEAR,a)},p(i,this.precipitation.texture,2),requestAnimationFrame(this.render)}set rampMaxColors(t){const{gl:a}=this,i=Math.floor(t/2)*2;this.colorRampTexture=c(a,a.LINEAR,h(this.rampColor,i),i,1),p(a,this.colorRampTexture,1),this._rampMaxColors=i}get rampMaxColors(){return this._rampMaxColors}}const o=new g,u={0:"#0000ff",10:"#00ffff",20:"#00ff00",30:"#ffff00",40:"#ffbf00",50:"#ff8000",60:"#ff0000",70:"#bf0000",80:"#800000",90:"#4b0000",100:"#280000"},A=document.querySelector("#principal-canvas"),n=new w(A,u);new x(u,"Réflectivité dBZ");o.add(n,"rampMaxColors",2,64);o.add(n,"opacity",0,1);o.add(new C(n,"reflectivity_2024-09-26_09-45-00","basic/"),"value",["reflectivity_debug","reflectivity_2024-09-26_09-45-00"]).name("texture");const M=[-5.584626288659794,40.774618181818184,10.225373711340218,51.984618181818185];fetch("metropole.geojson").then(e=>e.json()).then(e=>{const t=document.querySelector("#boundary");new y(t,e,M)});
