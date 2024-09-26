import { getColorRamp } from "~/lib/color-ramp";
import { dataImageLoader } from "~/lib/util";
import {
  bindAttribute,
  bindTextureUnit,
  createBuffer,
  createProgramInfos,
  createTexture,
  ProgramInfos,
  resizeCanvasToDisplaySize,
} from "~/lib/webgl-utils";

import screenFrag from "~/shaders/precipitation/screen-timeline.frag";
import squareVert from "~/shaders/square.vert";

import { Manifest } from "~/types";

export default class PrecipitationMap {
  public debug = false;
  public opacity = 1;
  public _rampMaxColors = 0;

  public timelineSpeedFactor = 1200; // 1sec = 20 min.

  public onFrame: ((timeCurrent: number) => void) | null = null;

  private manifest: Manifest | null = null;
  public timeStart = 0; // all time values unit is second.
  public timeEnd = 0;
  private _timeCurrent = 0;
  public timeReferenceAnimation = 0;
  public renderTimeStart: number | null = null;
  private _isPlaying = false;
  private precipitationTextures: WebGLTexture[] = [];

  private declare colorRampTexture: WebGLTexture;
  private gl: WebGL2RenderingContext;

  private screen: ProgramInfos;

  private square: {
    position: WebGLBuffer;
    uv: WebGLBuffer;
  };

  constructor(
    public canvas: HTMLCanvasElement,
    public rampColor: Record<number, string>,
  ) {
    const gl = canvas.getContext("webgl2")!;

    gl.enable(gl.CULL_FACE);

    this.gl = gl;

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
        0, 0, 0, 1, 1, 0,
        1, 0, 0, 1, 1, 1
        // 0, 1, 0, 0, 1, 1,
        // 1, 1, 0, 0, 1, 0
      ])),
    };

    this.rampMaxColors = 32;
  }

  set rampMaxColors(val: number) {
    const { gl } = this;
    const normalizedVal = Math.floor(val / 2) * 2;
    this.colorRampTexture = createTexture(
      gl,
      gl.LINEAR,
      getColorRamp(this.rampColor, normalizedVal),
      normalizedVal,
      1,
    );
    bindTextureUnit(gl, this.colorRampTexture, 1);

    this._rampMaxColors = normalizedVal;
  }

  get rampMaxColors() {
    return this._rampMaxColors;
  }

  // setDataImage(metadata: ImageMetadata, precipitationImage: HTMLImageElement) {
  //   const { gl } = this;
  //   this.precipitation = {
  //     data: metadata,
  //     texture: createTexture(gl, gl.LINEAR, precipitationImage),
  //   };
  //   bindTextureUnit(gl, this.precipitation.texture, 2);
  //   requestAnimationFrame(this.render);
  // }

  async setTimeline(manifest: Manifest, assetsBase: string) {
    const { gl } = this;
    const timeStart = new Date(manifest.dateStart).getTime() / 1000;
    const timeEnd = new Date(manifest.dateEnd).getTime() / 1000;

    this.manifest = manifest;
    const [firstTexture, ...othersTextures] = manifest.textures;
    this.timeStart = this.timeEnd = this._timeCurrent = timeStart;

    const precipitationImage = await dataImageLoader(`${assetsBase}/${firstTexture.filename}`);
    this.precipitationTextures = [createTexture(gl, gl.LINEAR, precipitationImage)];

    requestAnimationFrame(this.render);

    Promise.all<HTMLImageElement>(
      othersTextures.map(({ filename }) => dataImageLoader(`${assetsBase}/${filename}`)),
    ).then((images) => {
      this.precipitationTextures = [
        ...this.precipitationTextures,
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
    if (this.precipitationTextures.length === 0 || !this.manifest) {
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

    if (this.precipitationTextures.length > 1) {
      const textureOffset = (this.precipitationTextures.length * dt) / interval;

      prevTextureIdx = Math.floor(textureOffset) % this.precipitationTextures.length;
      nextTextureIdx = Math.ceil(textureOffset) % this.precipitationTextures.length;
      textureFactor = textureOffset - Math.floor(textureOffset);
    }

    bindTextureUnit(gl, this.precipitationTextures[prevTextureIdx], 2);
    bindTextureUnit(gl, this.precipitationTextures[nextTextureIdx], 3);

    resizeCanvasToDisplaySize(this.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const { program, locations } = this.screen;
    gl.useProgram(program);

    bindAttribute(gl, this.square.position, locations.a_position, 2);
    bindAttribute(gl, this.square.uv, locations.a_uv, 2);

    gl.uniform1i(locations.u_color_ramp, 1);
    gl.uniform1i(locations.u_precipitation_prev, 2);
    gl.uniform1i(locations.u_precipitation_next, 3);
    gl.uniform1f(locations.u_precipitation_factor, textureFactor);

    gl.uniform1f(locations.u_opacity, this.opacity);
    gl.uniform1f(locations.u_max_precipitation, 100);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.onFrame?.(this.timeCurrent);

    requestAnimationFrame(this.render);
  };
}
