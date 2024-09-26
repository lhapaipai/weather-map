export function getColorRamp(colors: Record<number, string>, width = 256) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = width;
  canvas.height = 1;

  let max = -Infinity;
  for (const stop of Object.keys(colors)) {
    max = Math.max(parseInt(stop));
  }

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  for (const speed in colors) {
    const stop = parseInt(speed) / max;
    gradient.addColorStop(stop, colors[speed]);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 1);
  return new Uint8Array(ctx.getImageData(0, 0, width, 1).data);
}
