var U=Object.defineProperty;var H=(n,t,e)=>t in n?U(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var c=(n,t,e)=>H(n,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();function k(n,t,e){const i=n.createShader(t);if(!i)throw new Error("Unable to create shader");if(n.shaderSource(i,e),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS))throw console.log(n.getShaderInfoLog(i)),n.deleteShader(i),new Error("Unable to compile shader");return i}function z(n,t,e){const i=n.createProgram();if(!i)throw new Error("Unable to create program");const r=k(n,n.VERTEX_SHADER,t),s=k(n,n.FRAGMENT_SHADER,e);if(n.attachShader(i,r),n.attachShader(i,s),n.linkProgram(i),!n.getProgramParameter(i,n.LINK_STATUS))throw console.log(n.getProgramInfoLog(i)),n.deleteProgram(i),new Error("Unable to link program");return i}function X(n,t){const e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const o=n.getActiveAttrib(t,s);e[o.name]=n.getAttribLocation(t,o.name)}const r=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let s=0;s<r;s++){const o=n.getActiveUniform(t,s);e[o.name]=n.getUniformLocation(t,o.name)}return e}function T(n,t,e){const i=z(n,t,e);return{program:i,locations:X(n,i)}}function w(n,t,e,i=0,r=0){const s=n.createTexture();if(!s)throw new Error("Unable to create texture");return n.activeTexture(n.TEXTURE31),n.bindTexture(n.TEXTURE_2D,s),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,t),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,t),e instanceof Uint8Array?n.texImage2D(n.TEXTURE_2D,0,n.RGBA,i,r,0,n.RGBA,n.UNSIGNED_BYTE,e):n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,e),n.bindTexture(n.TEXTURE_2D,null),s}function A(n,t,e){n.activeTexture(n.TEXTURE0+e),n.bindTexture(n.TEXTURE_2D,t)}function L(n,t){const e=n.createBuffer();return n.bindBuffer(n.ARRAY_BUFFER,e),n.bufferData(n.ARRAY_BUFFER,t,n.STATIC_DRAW),e}function b(n,t,e,i){n.bindBuffer(n.ARRAY_BUFFER,t),n.enableVertexAttribArray(e),n.vertexAttribPointer(e,i,n.FLOAT,!1,0,0)}function D(n,t,e){n.bindFramebuffer(n.FRAMEBUFFER,t),e&&n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,e,0)}function V(n,t){if(n instanceof OffscreenCanvas)return console.log("Offscreen Canvas"),!1;const e=t??Math.min(Math.floor(window.devicePixelRatio)||1,2),i=n.clientWidth*e,r=n.clientHeight*e;return n.width!==i||n.height!==r?(n.width=i,n.height=r,!0):!1}class Y{constructor(t,e,i){c(this,"render",()=>{const{canvas:t,data:e,bbox:i}=this,r=t.getContext("2d"),s=Math.min(Math.floor(window.devicePixelRatio)||1,2);V(t,s),r.clearRect(0,0,t.clientWidth,t.clientHeight),r.lineWidth=s,r.lineJoin=r.lineCap="round",r.lineWidth=.8,r.strokeStyle="#333";for(let o=0;o<e.geometry.coordinates.length;o++){r.beginPath();const u=e.geometry.coordinates[o][0];for(let h=0;h<u.length;h++){const p=u[h];r[h?"lineTo":"moveTo"]((p[0]-i[0])*t.clientWidth/(i[2]-i[0])*s,-1*(p[1]-i[3])*t.clientHeight/(i[3]-i[1])*s)}r.stroke()}});this.canvas=t,this.data=e,this.bbox=i,this.render(),window.addEventListener("resize",this.render)}}var G=`#version 300 es

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
}`,W=`#version 300 es

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
}`,M=`#version 300 es

in vec2 a_position;
in vec2 a_uv;

out vec2 v_uv;

void main() {
  vec2 clipSpace = vec2(1., -1.) * (a_position * 2. - 1.);
  gl_Position = vec4(clipSpace, 0., 1.);
  v_uv = a_uv;
}`,j=`#version 300 es

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
}`,J=`#version 300 es

precision highp float;

uniform float u_opacity;
uniform sampler2D u_screen;

in vec2 v_uv;

out vec4 out_color;

void main() {
  vec4 color = texture(u_screen, v_uv);
  out_color = floor(255.*color*u_opacity) / 255.;
}`;class K{constructor(t,e,i,r){c(this,"fadeOpacity",.975);c(this,"speedFactor",.87);c(this,"_numParticles",0);c(this,"dropRate",.003);c(this,"dropRateBump",.01);c(this,"frameBuffer");c(this,"windTexture");c(this,"colorRampTexture");c(this,"gl");c(this,"draw");c(this,"update");c(this,"screen");c(this,"square");c(this,"render",()=>{const{gl:t}=this;V(this.canvas)&&this.initTextures(),D(t,this.frameBuffer,this.screenTexture),t.viewport(0,0,t.canvas.width,t.canvas.height),this.drawScreen(this.previousScreenTexture,this.fadeOpacity),this.drawParticles(),this.updateParticles(),D(t,null),t.viewport(0,0,t.canvas.width,t.canvas.height),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),this.drawScreen(this.screenTexture,1),t.disable(t.BLEND);let e=this.previousScreenTexture;this.previousScreenTexture=this.screenTexture,this.screenTexture=e,e=this.particlePositionCurrent,this.particlePositionCurrent=this.particlePositionNext,this.particlePositionNext=e,A(t,this.particlePositionCurrent,2),requestAnimationFrame(this.render)});this.canvas=t,this.windData=e,this.windSpeedRampColor=r;const s=t.getContext("webgl2");s.disable(s.DEPTH_TEST),s.disable(s.STENCIL_TEST),s.enable(s.CULL_FACE),this.gl=s,this.frameBuffer=s.createFramebuffer(),this.windTexture=w(s,s.LINEAR,i),A(s,this.windTexture,0),this.colorRampTexture=w(s,s.LINEAR,q(this.windSpeedRampColor),256,1),A(s,this.colorRampTexture,1),this.draw=T(s,G,W),this.update=T(s,M,j),this.screen=T(s,M,J),this.square={position:L(s,new Float32Array([0,0,0,1,1,0,1,0,0,1,1,1])),uv:L(s,new Float32Array([0,1,0,0,1,1,1,1,0,0,1,0]))},this.numParticles=53824,this.render()}set numParticles(t){const{gl:e}=this,i=Math.floor(Math.sqrt(t));this._numParticles=i*i;const r=new Uint8Array(this._numParticles*4);for(let o=0;o<r.length;o++)r[o]=Math.floor(Math.random()*256);this.particlePositionCurrent=w(e,e.NEAREST,r,i,i),A(e,this.particlePositionCurrent,2),this.particlePositionNext=w(e,e.NEAREST,r,i,i),A(e,this.particlePositionNext,3);const s=new Float32Array(this._numParticles);for(let o=0;o<s.length;o++)s[o]=o;this.particleIndexBuffer=L(e,s)}get numParticles(){return this._numParticles}initTextures(){console.log("initTextures");const{gl:t}=this,{width:e,height:i}=t.canvas,r=new Uint8Array(e*i*4);this.previousScreenTexture=w(t,t.NEAREST,r,e,i),this.screenTexture=w(t,t.NEAREST,r,e,i)}drawScreen(t,e){const{gl:i}=this,{program:r,locations:s}=this.screen;i.useProgram(r),b(i,this.square.position,s.a_position,2),b(i,this.square.uv,s.a_uv,2),A(i,t,4),i.uniform1i(s.u_screen,4),i.uniform1f(s.u_opacity,e),i.drawArrays(i.TRIANGLES,0,6)}drawParticles(){const{gl:t}=this,{program:e,locations:i}=this.draw;t.useProgram(e),b(t,this.particleIndexBuffer,i.a_index,1),t.uniform1i(i.u_wind,0),t.uniform1i(i.u_color_ramp,1),t.uniform1i(i.u_particle_position_current,2),t.uniform1f(i.u_tex_width,Math.sqrt(this._numParticles)),t.drawArrays(t.POINTS,0,this._numParticles)}updateParticles(){const{gl:t}=this,e=Math.sqrt(this._numParticles);D(t,this.frameBuffer,this.particlePositionNext),t.viewport(0,0,e,e);const{program:i,locations:r}=this.update;t.useProgram(i),b(t,this.square.position,r.a_position,2),b(t,this.square.uv,r.a_uv,2),t.uniform1i(r.u_wind,0),t.uniform1i(r.u_particle_position_current,2),t.uniform2f(r.u_wind_res,this.windData.width,this.windData.height),t.uniform4fv(r.u_bbox,this.windData.bbox),t.uniform1f(r.u_speed_factor,this.speedFactor),t.uniform1f(r.u_rand_seed,Math.random()),t.uniform1f(r.u_drop_rate,this.dropRate),t.uniform1f(r.u_drop_rate_bump,this.dropRateBump),t.drawArrays(t.TRIANGLES,0,6)}}function q(n){const t=document.createElement("canvas"),e=t.getContext("2d");t.width=256,t.height=1;const i=120,r=e.createLinearGradient(0,0,256,0);for(const s in n){const o=parseInt(s)/i;r.addColorStop(o,n[s])}return e.fillStyle=r,e.fillRect(0,0,256,1),new Uint8Array(e.getImageData(0,0,256,1).data)}/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.19.2
 * @author George Michael Brower
 * @license MIT
 */class g{constructor(t,e,i,r,s="div"){this.parent=t,this.object=e,this.property=i,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(s),this.domElement.classList.add("controller"),this.domElement.classList.add(r),this.$name=document.createElement("div"),this.$name.classList.add("name"),g.nextNameID=g.nextNameID||0,this.$name.id=`lil-gui-name-${++g.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",o=>o.stopPropagation()),this.domElement.addEventListener("keyup",o=>o.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(i)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const e=this.parent.add(this.object,this.property,t);return e.name(this._name),this.destroy(),e}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class Z extends g{constructor(t,e,i){super(t,e,i,"boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function P(n){let t,e;return(t=n.match(/(#|0x)?([a-f0-9]{6})/i))?e=t[2]:(t=n.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?e=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=n.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(e=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),e?"#"+e:!1}const Q={isPrimitive:!0,match:n=>typeof n=="string",fromHexString:P,toHexString:P},E={isPrimitive:!0,match:n=>typeof n=="number",fromHexString:n=>parseInt(n.substring(1),16),toHexString:n=>"#"+n.toString(16).padStart(6,0)},tt={isPrimitive:!1,match:n=>Array.isArray(n),fromHexString(n,t,e=1){const i=E.fromHexString(n);t[0]=(i>>16&255)/255*e,t[1]=(i>>8&255)/255*e,t[2]=(i&255)/255*e},toHexString([n,t,e],i=1){i=255/i;const r=n*i<<16^t*i<<8^e*i<<0;return E.toHexString(r)}},et={isPrimitive:!1,match:n=>Object(n)===n,fromHexString(n,t,e=1){const i=E.fromHexString(n);t.r=(i>>16&255)/255*e,t.g=(i>>8&255)/255*e,t.b=(i&255)/255*e},toHexString({r:n,g:t,b:e},i=1){i=255/i;const r=n*i<<16^t*i<<8^e*i<<0;return E.toHexString(r)}},it=[Q,E,tt,et];function nt(n){return it.find(t=>t.match(n))}class rt extends g{constructor(t,e,i,r){super(t,e,i,"color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=nt(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const s=P(this.$text.value);s&&this._setValueFromHexString(s)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const e=this._format.fromHexString(t);this.setValue(e)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class F extends g{constructor(t,e,i){super(t,e,i,"function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",r=>{r.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class st extends g{constructor(t,e,i,r,s,o){super(t,e,i,"number"),this._initInput(),this.min(r),this.max(s);const d=o!==void 0;this.step(d?o:this._getImplicitStep(),d),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,e=!0){return this._step=t,this._stepExplicit=e,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let e=(t-this._min)/(this._max-this._min);e=Math.max(0,Math.min(e,1)),this.$fill.style.width=e*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const e=()=>{let a=parseFloat(this.$input.value);isNaN(a)||(this._stepExplicit&&(a=this._snap(a)),this.setValue(this._clamp(a)))},i=a=>{const m=parseFloat(this.$input.value);isNaN(m)||(this._snapClampSetValue(m+a),this.$input.value=this.getValue())},r=a=>{a.key==="Enter"&&this.$input.blur(),a.code==="ArrowUp"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a))),a.code==="ArrowDown"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a)*-1))},s=a=>{this._inputFocused&&(a.preventDefault(),i(this._step*this._normalizeMouseWheel(a)))};let o=!1,d,u,h,p,f;const v=5,$=a=>{d=a.clientX,u=h=a.clientY,o=!0,p=this.getValue(),f=0,window.addEventListener("mousemove",y),window.addEventListener("mouseup",_)},y=a=>{if(o){const m=a.clientX-d,C=a.clientY-u;Math.abs(C)>v?(a.preventDefault(),this.$input.blur(),o=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(m)>v&&_()}if(!o){const m=a.clientY-h;f-=m*this._step*this._arrowKeyMultiplier(a),p+f>this._max?f=this._max-p:p+f<this._min&&(f=this._min-p),this._snapClampSetValue(p+f)}h=a.clientY},_=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",y),window.removeEventListener("mouseup",_)},S=()=>{this._inputFocused=!0},l=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",e),this.$input.addEventListener("keydown",r),this.$input.addEventListener("wheel",s,{passive:!1}),this.$input.addEventListener("mousedown",$),this.$input.addEventListener("focus",S),this.$input.addEventListener("blur",l)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const t=(l,a,m,C,N)=>(l-a)/(m-a)*(N-C)+C,e=l=>{const a=this.$slider.getBoundingClientRect();let m=t(l,a.left,a.right,this._min,this._max);this._snapClampSetValue(m)},i=l=>{this._setDraggingStyle(!0),e(l.clientX),window.addEventListener("mousemove",r),window.addEventListener("mouseup",s)},r=l=>{e(l.clientX)},s=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",r),window.removeEventListener("mouseup",s)};let o=!1,d,u;const h=l=>{l.preventDefault(),this._setDraggingStyle(!0),e(l.touches[0].clientX),o=!1},p=l=>{l.touches.length>1||(this._hasScrollBar?(d=l.touches[0].clientX,u=l.touches[0].clientY,o=!0):h(l),window.addEventListener("touchmove",f,{passive:!1}),window.addEventListener("touchend",v))},f=l=>{if(o){const a=l.touches[0].clientX-d,m=l.touches[0].clientY-u;Math.abs(a)>Math.abs(m)?h(l):(window.removeEventListener("touchmove",f),window.removeEventListener("touchend",v))}else l.preventDefault(),e(l.touches[0].clientX)},v=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",f),window.removeEventListener("touchend",v)},$=this._callOnFinishChange.bind(this),y=400;let _;const S=l=>{if(Math.abs(l.deltaX)<Math.abs(l.deltaY)&&this._hasScrollBar)return;l.preventDefault();const m=this._normalizeMouseWheel(l)*this._step;this._snapClampSetValue(this.getValue()+m),this.$input.value=this.getValue(),clearTimeout(_),_=setTimeout($,y)};this.$slider.addEventListener("mousedown",i),this.$slider.addEventListener("touchstart",p,{passive:!1}),this.$slider.addEventListener("wheel",S,{passive:!1})}_setDraggingStyle(t,e="horizontal"){this.$slider&&this.$slider.classList.toggle("active",t),document.body.classList.toggle("lil-gui-dragging",t),document.body.classList.toggle(`lil-gui-${e}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:e,deltaY:i}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(e=0,i=-t.wheelDelta/120,i*=this._stepExplicit?1:10),e+-i}_arrowKeyMultiplier(t){let e=this._stepExplicit?1:10;return t.shiftKey?e*=10:t.altKey&&(e/=10),e}_snap(t){const e=Math.round(t/this._step)*this._step;return parseFloat(e.toPrecision(15))}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class ot extends g{constructor(t,e,i,r){super(t,e,i,"option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(e=>{const i=document.createElement("option");i.textContent=e,this.$select.appendChild(i)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),e=this._values.indexOf(t);return this.$select.selectedIndex=e,this.$display.textContent=e===-1?t:this._names[e],this}}class at extends g{constructor(t,e,i){super(t,e,i,"string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",r=>{r.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}const lt=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: none;
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
  }
  .lil-gui button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function ht(n){const t=document.createElement("style");t.innerHTML=n;const e=document.querySelector("head link[rel=stylesheet], head style");e?document.head.insertBefore(t,e):document.head.appendChild(t)}let I=!1;class R{constructor({parent:t,autoPlace:e=t===void 0,container:i,width:r,title:s="Controls",closeFolders:o=!1,injectStyles:d=!0,touchStyles:u=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("div"),this.$title.classList.add("title"),this.$title.setAttribute("role","button"),this.$title.setAttribute("aria-expanded",!0),this.$title.setAttribute("tabindex",0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("keydown",h=>{(h.code==="Enter"||h.code==="Space")&&(h.preventDefault(),this.$title.click())}),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(s),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("root"),u&&this.domElement.classList.add("allow-touch-styles"),!I&&d&&(ht(lt),I=!0),i?i.appendChild(this.domElement):e&&(this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty("--width",r+"px"),this._closeFolders=o}add(t,e,i,r,s){if(Object(i)===i)return new ot(this,t,e,i);const o=t[e];switch(typeof o){case"number":return new st(this,t,e,i,r,s);case"boolean":return new Z(this,t,e);case"string":return new at(this,t,e);case"function":return new F(this,t,e)}console.error(`gui.add failed
	property:`,e,`
	object:`,t,`
	value:`,o)}addColor(t,e,i=1){return new rt(this,t,e,i)}addFolder(t){const e=new R({parent:this,title:t});return this.root._closeFolders&&e.close(),e}load(t,e=!0){return t.controllers&&this.controllers.forEach(i=>{i instanceof F||i._name in t.controllers&&i.load(t.controllers[i._name])}),e&&t.folders&&this.folders.forEach(i=>{i._title in t.folders&&i.load(t.folders[i._title])}),this}save(t=!0){const e={controllers:{},folders:{}};return this.controllers.forEach(i=>{if(!(i instanceof F)){if(i._name in e.controllers)throw new Error(`Cannot save GUI with duplicate property "${i._name}"`);e.controllers[i._name]=i.save()}}),t&&this.folders.forEach(i=>{if(i._title in e.folders)throw new Error(`Cannot save GUI with duplicate folder "${i._title}"`);e.folders[i._title]=i.save()}),e}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const e=this.$children.clientHeight;this.$children.style.height=e+"px",this.domElement.classList.add("transition");const i=s=>{s.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",i))};this.$children.addEventListener("transitionend",i);const r=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("closed",!t),requestAnimationFrame(()=>{this.$children.style.height=r+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(i=>i.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(e=>{t=t.concat(e.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(e=>{t=t.concat(e.foldersRecursive())}),t}}class dt{constructor(t){const e=Object.entries(t).map(([o,d])=>({value:parseInt(o),color:d})).sort((o,d)=>o.value<d.value?-1:1),i=document.createElement("div");i.className="legend";const r=document.createElement("div");r.className="colors",e.forEach(({value:o,color:d})=>{const u=document.createElement("div");u.className="group";const h=document.createElement("div");h.className="rectangle",h.style.backgroundColor=d;const p=document.createElement("span");p.textContent=o.toString(),u.append(h,p),r.append(u)});const s=document.createElement("div");s.textContent="Vitesse du vent en m/s",i.append(r,s),document.body.append(i)}}const ct=n=>new Promise(t=>{const e=document.createElement("img");e.onload=i=>{t(i.target)},e.src=n}),x=new R,B="wind_2024-09-18T06.00.00Z",O={0:"#3288bd",5:"#66c2a5",10:"#abdda4",20:"#e6f598",30:"#fee08b",40:"#fdae61",50:"#f46d43",60:"#d53e4f",80:"#9e0142",100:"#67001f",120:"#40000c"};Promise.all([fetch("/wind-map/metropole.geojson").then(n=>n.json()),fetch(`/wind-map/${B}.json`).then(n=>n.json()),ct(`/wind-map/${B}.png`)]).then(([n,t,e])=>{const i=document.querySelector("#boundary");new Y(i,n,t.bbox);const r=document.querySelector("#wind"),s=new K(r,t,e,O);new dt(O),x.add(s,"numParticles",1024,589824),x.add(s,"fadeOpacity",.01,.999).step(.001),x.add(s,"speedFactor",.05,1),x.add(s,"dropRate",0,.1),x.add(s,"dropRateBump",0,.2)});
