export function createShader(gl: WebGLRenderingContext, shaderType: GLenum, shaderSource: string) {
  const shader = gl.createShader(shaderType);
  if (!shader) {
    throw new Error("Unable to create shader");
  }
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!isCompiled) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Unable to compile shader");
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Unable to create program");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const isCompiled = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!isCompiled) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Unable to link program");
  }
  return program;
}

export function getLocations(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const wrapper: {
    [aKey: `a_${string}`]: GLint;
    [uKey: `u_${string}`]: WebGLUniformLocation;
  } = {};

  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const attribute = gl.getActiveAttrib(program, i)!;
    // @ts-ignore
    wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
  }

  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniform = gl.getActiveUniform(program, i)!;
    // @ts-ignore
    wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name)!;
  }

  return wrapper;
}

export type ProgramInfos = {
  program: WebGLProgram;
  locations: {
    [aKey: `a_${string}`]: GLint;
    [uKey: `u_${string}`]: WebGLUniformLocation;
  };
};
export function createProgramInfos(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): ProgramInfos {
  const program = createProgram(gl, vertexSource, fragmentSource);

  return {
    program,
    locations: getLocations(gl, program),
  };
}

export function createTexture(
  gl: WebGL2RenderingContext,
  filter: number,
  data: Uint8Array | HTMLImageElement,
  width = 0,
  height = 0,
) {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Unable to create texture");
  }
  gl.activeTexture(gl.TEXTURE31);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  if (data instanceof Uint8Array) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export function bindTextureUnit(gl: WebGL2RenderingContext, texture: WebGLTexture, unit: number) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

export function createBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer) {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

export function bindAttribute(
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
  attributeLocation: GLint,
  numComponents: number,
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attributeLocation);
  gl.vertexAttribPointer(attributeLocation, numComponents, gl.FLOAT, false, 0, 0);
}

export function bindFramebuffer(
  gl: WebGL2RenderingContext,
  framebuffer: WebGLFramebuffer | null,
  texture?: WebGLTexture,
) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  if (texture) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  multiplier?: number,
) {
  if (canvas instanceof OffscreenCanvas) {
    console.log("Offscreen Canvas");
    return false;
  }
  const pxRatio = multiplier ?? Math.min(Math.floor(window.devicePixelRatio) || 1, 2);

  const width = canvas.clientWidth * pxRatio;
  const height = canvas.clientHeight * pxRatio;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
