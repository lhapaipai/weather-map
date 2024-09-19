import type { Feature, MultiPolygon } from "geojson";
import { resizeCanvasToDisplaySize } from "./webgl-utils";

export default class BoundaryCanvas {
  constructor(
    public canvas: HTMLCanvasElement,
    public data: Feature<MultiPolygon>,
    public bbox: number[],
  ) {
    this.render();
    window.addEventListener("resize", this.render);
  }

  render = () => {
    const { canvas, data, bbox } = this;
    const ctx = canvas.getContext("2d")!;
    const pxRatio = Math.min(Math.floor(window.devicePixelRatio) || 1, 2);
    resizeCanvasToDisplaySize(canvas, pxRatio);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.lineWidth = pxRatio;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.lineWidth = 0.8;

    ctx.strokeStyle = "#333";

    for (let i = 0; i < data.geometry.coordinates.length; i++) {
      ctx.beginPath();

      const multiPolygon = data.geometry.coordinates[i];
      const outerPolygon = multiPolygon[0];

      for (let j = 0; j < outerPolygon.length; j++) {
        const line = outerPolygon[j];
        ctx[j ? "lineTo" : "moveTo"](
          ((line[0] - bbox[0]) * canvas.clientWidth) / (bbox[2] - bbox[0]),
          (-1 * (line[1] - bbox[3]) * canvas.clientHeight) / (bbox[3] - bbox[1]),
        );
      }
      ctx.stroke();
    }
  };
}
