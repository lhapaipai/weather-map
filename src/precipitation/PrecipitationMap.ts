import { getColorRamp } from "~/lib/color-ramp";
import {
  bindAttribute,
  bindTextureUnit,
  createBuffer,
  createProgramInfos,
  createTexture,
  ProgramInfos,
  resizeCanvasToDisplaySize,
} from "~/lib/webgl-utils";

import screenFrag from "~/shaders/precipitation/screen.frag";
import squareVert from "~/shaders/square.vert";

import { ImageMetadata } from "~/types";

export default class PrecipitationMap {
  public debug = false;
  public opacity = 1;
  public _rampMaxColors = 0;

  private precipitation: {
    data: ImageMetadata;
    texture: WebGLTexture;
  } | null = null;

  private declare colorRampTexture: WebGLTexture;
  private gl: WebGL2RenderingContext;

  private screen: ProgramInfos;

  private square: {
    position: WebGLBuffer;
    uv: WebGLBuffer;
  };

  setDataImage(metadata: ImageMetadata, precipitationImage: HTMLImageElement) {
    const { gl } = this;
    this.precipitation = {
      data: metadata,
      texture: createTexture(gl, gl.LINEAR, precipitationImage),
    };
    bindTextureUnit(gl, this.precipitation.texture, 2);
    requestAnimationFrame(this.render);
  }

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

  render = () => {
    if (!this.precipitation) {
      return;
    }
    const { gl } = this;
    resizeCanvasToDisplaySize(this.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const { program, locations } = this.screen;
    gl.useProgram(program);

    bindAttribute(gl, this.square.position, locations.a_position, 2);
    bindAttribute(gl, this.square.uv, locations.a_uv, 2);

    gl.uniform1i(locations.u_color_ramp, 1);
    gl.uniform1i(locations.u_precipitation, 2);

    gl.uniform1f(locations.u_opacity, this.opacity);
    gl.uniform1f(locations.u_max_precipitation, 100);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(this.render);
  };
}
