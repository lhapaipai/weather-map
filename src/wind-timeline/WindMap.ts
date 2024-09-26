import {
  bindAttribute,
  bindFramebuffer,
  bindTextureUnit,
  createBuffer,
  createProgramInfos,
  createTexture,
  ProgramInfos,
  resizeCanvasToDisplaySize,
} from "~/lib/webgl-utils";

import drawVert from "~/shaders/draw.vert";
import drawFrag from "~/shaders/draw-timeline.frag";

import squareVert from "~/shaders/square.vert";

import updateFrag from "~/shaders/update-timeline.frag";
import screenFrag from "~/shaders/screen.frag";

import { Manifest } from "~/types";
import { dataImageLoader } from "~/lib/util";
import { getColorRamp } from "~/lib/color-ramp";

export default class WindMap {
  public fadeOpacity = 0.975;
  public speedFactor = 0.87;
  private _numParticles = 0;

  public dropRate = 0.003;
  public dropRateBump = 0.01;
  public debug = false;

  public timelineSpeedFactor = 1200; // 1sec = 20 min.

  public onFrame: ((timeCurrent: number) => void) | null = null;

  private frameBuffer: WebGLFramebuffer;

  private declare particlePositionCurrent: WebGLTexture;
  private declare particlePositionNext: WebGLTexture;
  private declare particleIndexBuffer: WebGLBuffer;

  private manifest: Manifest | null = null;
  public timeStart = 0; // all time values unit is second.
  public timeEnd = 0;
  private _timeCurrent = 0;
  public timeReferenceAnimation = 0;
  public renderTimeStart: number | null = null;
  private _isPlaying = false;
  private windTextures: WebGLTexture[] = [];

  private colorRampTexture: WebGLTexture;
  private gl: WebGL2RenderingContext;

  private declare previousScreenTexture: WebGLTexture;
  private declare screenTexture: WebGLTexture;

  private draw: ProgramInfos;
  private update: ProgramInfos;
  private screen: ProgramInfos;

  private square: {
    position: WebGLBuffer;
    uv: WebGLBuffer;
  };

  constructor(
    public canvas: HTMLCanvasElement,
    public windSpeedRampColor: Record<number, string>,
  ) {
    const gl = canvas.getContext("webgl2")!;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.enable(gl.CULL_FACE);

    this.gl = gl;
    this.frameBuffer = gl.createFramebuffer()!;

    this.colorRampTexture = createTexture(
      gl,
      gl.LINEAR,
      getColorRamp(this.windSpeedRampColor),
      256,
      1,
    );
    bindTextureUnit(gl, this.colorRampTexture, 1);

    this.draw = createProgramInfos(gl, drawVert, drawFrag);
    this.update = createProgramInfos(gl, squareVert, updateFrag);
    this.screen = createProgramInfos(gl, squareVert, screenFrag);

    // prettier-ignore
    this.square = {
      position: createBuffer(gl, new Float32Array([
        0, 0, 0, 1, 1, 0,
        1, 0, 0, 1, 1, 1
      ])),
      // la texture utilisée est issue du frame buffer qui a une origine en bas à gauche.
      // on doit donc faire un flipY
      uv: createBuffer(gl, new Float32Array([
        0, 1, 0, 0, 1, 1,
        1, 1, 0, 0, 1, 0
      ])),
    };

    /**
     * cette assignation va initialiser
     *  - _numParticles
     *  - particlePositionCurrent
     *  - particleIndexBuffer
     */
    this.numParticles = 53824;
  }

  set numParticles(rawVal: number) {
    const { gl } = this;
    // les particules sont stockées dans une texture carrée. on altère la valeur
    // afin d'avoir un compte rond
    const texSide = Math.floor(Math.sqrt(rawVal));

    this._numParticles = texSide * texSide;
    const data = new Uint8Array(this._numParticles * 4);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }

    this.particlePositionCurrent = createTexture(gl, gl.NEAREST, data, texSide, texSide);
    bindTextureUnit(gl, this.particlePositionCurrent, 2);

    this.particlePositionNext = createTexture(gl, gl.NEAREST, data, texSide, texSide);
    bindTextureUnit(gl, this.particlePositionNext, 3);

    // on va définir un attribut qui contient l'indice de notre particule. cela nous permettra
    // d'itérer du nombre de particules dans notre Vertex Shader
    const indexArr = new Float32Array(this._numParticles);
    for (let i = 0; i < indexArr.length; i++) {
      indexArr[i] = i;
    }
    this.particleIndexBuffer = createBuffer(gl, indexArr);
  }

  get numParticles() {
    return this._numParticles;
  }

  initTextures() {
    console.log("initTextures");
    const { gl } = this;
    const { width, height } = gl.canvas;
    const emptyPixels = new Uint8Array(width * height * 4);

    this.previousScreenTexture = createTexture(gl, gl.NEAREST, emptyPixels, width, height);
    this.screenTexture = createTexture(gl, gl.NEAREST, emptyPixels, width, height);
  }

  async setTimeline(manifest: Manifest, assetsBase: string) {
    const { gl } = this;
    const timeStart = new Date(manifest.dateStart).getTime() / 1000;
    const timeEnd = new Date(manifest.dateEnd).getTime() / 1000;

    this.manifest = manifest;
    const [firstTexture, ...othersTextures] = manifest.textures;
    this.timeStart = this.timeEnd = this._timeCurrent = timeStart;

    const windImage = await dataImageLoader(`${assetsBase}/${firstTexture.filename}`);
    this.windTextures = [createTexture(gl, gl.LINEAR, windImage)];

    requestAnimationFrame(this.render);

    Promise.all<HTMLImageElement>(
      othersTextures.map(({ filename }) => dataImageLoader(`${assetsBase}/${filename}`)),
    ).then((images) => {
      this.windTextures = [
        ...this.windTextures,
        ...images.map((image) => createTexture(gl, gl.LINEAR, image)),
      ];
      this.timeEnd = timeEnd;
    });

    this.isPlaying = true;
  }

  set isPlaying(val: boolean) {
    this._isPlaying = val;
    this.renderTimeStart = null;
  }
  get isPlaying() {
    return this._isPlaying;
  }

  set timeCurrent(time: number) {
    console.log("setTimecurrent", time);
    this.isPlaying = false;
    this._timeCurrent = time;
  }

  get timeCurrent() {
    return this._timeCurrent;
  }

  render = (renderTimeMs: number) => {
    if (this.windTextures.length === 0 || !this.manifest) {
      return;
    }
    const { gl } = this;

    const renderTime = renderTimeMs / 1000;
    const interval = this.timeEnd - this.timeStart;

    let dt = 0;

    if (this.isPlaying && interval !== 0) {
      if (this.renderTimeStart === null) {
        console.log("reinit time start");
        this.renderTimeStart =
          renderTime - (this.timeCurrent - this.timeStart) / this.timelineSpeedFactor;
      }
      dt = ((renderTime - this.renderTimeStart) * this.timelineSpeedFactor) % interval;
      this._timeCurrent = this.timeStart + dt;
    } else {
      dt = this.timeCurrent - this.timeStart;
    }

    let prevTextureIdx = 0;
    let nextTextureIdx = 0;
    let textureFactor = 0;

    if (this.windTextures.length > 1) {
      const textureOffset = (this.windTextures.length * dt) / interval;

      prevTextureIdx = Math.floor(textureOffset) % this.windTextures.length;
      nextTextureIdx = Math.ceil(textureOffset) % this.windTextures.length;
      textureFactor = textureOffset - Math.floor(textureOffset);
    }

    bindTextureUnit(gl, this.windTextures[prevTextureIdx], 5);
    bindTextureUnit(gl, this.windTextures[nextTextureIdx], 6);

    if (resizeCanvasToDisplaySize(this.canvas)) {
      this.initTextures();
    }

    bindFramebuffer(gl, this.frameBuffer, this.screenTexture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.drawScreen(this.previousScreenTexture, this.fadeOpacity);
    this.drawParticles(textureFactor);
    this.updateParticles(textureFactor);

    bindFramebuffer(gl, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.drawScreen(this.screenTexture, 1);

    gl.disable(gl.BLEND);

    let temp = this.previousScreenTexture;
    this.previousScreenTexture = this.screenTexture;
    this.screenTexture = temp;

    temp = this.particlePositionCurrent;
    this.particlePositionCurrent = this.particlePositionNext;
    this.particlePositionNext = temp;
    bindTextureUnit(gl, this.particlePositionCurrent, 2);

    this.onFrame?.(this.timeCurrent);

    requestAnimationFrame(this.render);
  };

  drawScreen(texture: WebGLTexture, opacity: number) {
    const { gl } = this;
    const { program, locations } = this.screen;
    gl.useProgram(program);

    bindAttribute(gl, this.square.position, locations.a_position, 2);
    bindAttribute(gl, this.square.uv, locations.a_uv, 2);

    bindTextureUnit(gl, texture, 4);
    gl.uniform1i(locations.u_screen, 4);
    gl.uniform1f(locations.u_opacity, opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawParticles(windTextureFactor: number) {
    const { gl } = this;
    const { program, locations } = this.draw;
    gl.useProgram(program);

    bindAttribute(gl, this.particleIndexBuffer, locations.a_index, 1);

    gl.uniform1i(locations.u_wind_prev, 5);
    gl.uniform1i(locations.u_wind_next, 6);
    gl.uniform1f(locations.u_wind_factor, windTextureFactor);
    gl.uniform1i(locations.u_color_ramp, 1);
    gl.uniform1i(locations.u_particle_position_current, 2);
    gl.uniform1f(locations.u_tex_width, Math.sqrt(this._numParticles));

    gl.drawArrays(gl.POINTS, 0, this._numParticles);
  }

  updateParticles(windTextureFactor: number) {
    if (!this.manifest) {
      return;
    }
    const { gl } = this;
    const res = Math.sqrt(this._numParticles);

    bindFramebuffer(gl, this.frameBuffer, this.particlePositionNext);
    gl.viewport(0, 0, res, res);

    const { program, locations } = this.update;
    gl.useProgram(program);

    bindAttribute(gl, this.square.position, locations.a_position, 2);
    bindAttribute(gl, this.square.uv, locations.a_uv, 2);

    gl.uniform1i(locations.u_wind_prev, 5);
    gl.uniform1i(locations.u_wind_next, 6);
    gl.uniform1f(locations.u_wind_factor, windTextureFactor);
    gl.uniform1i(locations.u_particle_position_current, 2);

    gl.uniform2f(locations.u_wind_res, this.manifest.width, this.manifest.height);
    gl.uniform4fv(locations.u_bbox, this.manifest.bbox);
    gl.uniform1f(locations.u_speed_factor, this.speedFactor);

    /** todo:begin */
    gl.uniform1f(locations.u_rand_seed, Math.random());
    gl.uniform1f(locations.u_drop_rate, this.dropRate);
    gl.uniform1f(locations.u_drop_rate_bump, this.dropRateBump);
    /** todo:end */

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
