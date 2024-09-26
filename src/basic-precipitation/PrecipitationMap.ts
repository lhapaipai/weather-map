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
import drawFrag from "~/shaders/draw.frag";

import squareVert from "~/shaders/square.vert";

import updateFrag from "~/shaders/update.frag";
import screenFrag from "~/shaders/screen.frag";

import { ImageMetadata } from "~/types";

export default class PrecipitationMap {
  public debug = false;

  private declare particlePositionCurrent: WebGLTexture;
  private declare particlePositionNext: WebGLTexture;
  private declare particleIndexBuffer: WebGLBuffer;

  private precipitation: {
    data: ImageMetadata;
    texture: WebGLTexture;
  } | null = null;
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

  setDataImage(metadata: ImageMetadata, precipitationImage: HTMLImageElement) {
    const { gl } = this;
    this.precipitation = {
      data: metadata,
      texture: createTexture(gl, gl.LINEAR, precipitationImage),
    };
    bindTextureUnit(gl, this.precipitation.texture, 5);
    requestAnimationFrame(this.render);
  }

  constructor(
    public canvas: HTMLCanvasElement,
    public rampColor: Record<number, string>,
  ) {
    const gl = canvas.getContext("webgl2")!;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.enable(gl.CULL_FACE);

    this.gl = gl;

    this.colorRampTexture = createTexture(gl, gl.LINEAR, getColorRamp(this.rampColor), 256, 1);
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

    bindTextureUnit(gl, texture, 4);
    gl.uniform1i(locations.u_screen, 4);
    gl.uniform1f(locations.u_opacity, opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(this.render);
  };
}

function getColorRamp(colors: Record<number, string>) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = 256;
  canvas.height = 1;

  const maxSpeed = 120;

  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  for (const speed in colors) {
    const stop = parseInt(speed) / maxSpeed;
    gradient.addColorStop(stop, colors[speed]);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  return new Uint8Array(ctx.getImageData(0, 0, 256, 1).data);
}
