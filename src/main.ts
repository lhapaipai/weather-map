import { Feature, MultiPolygon } from "geojson";
import BoundaryCanvas from "./BoundaryCanvas";
import "./style.css";
import { WindData } from "./types";
import WindMap from "./WindMap";
import GUI from "lil-gui";
import { Legend } from "./Legend";

const dataImageLoader = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = (e) => {
      resolve(e.target as HTMLImageElement);
    };
    img.src = url;
  });
};

const gui = new GUI();

const debug = false;
const windFile = debug ? "wind_debug" : "wind_2024-09-18T06.00.00Z";

const windSpeedRampColor = {
  0: "#3288bd",
  5: "#66c2a5",
  10: "#abdda4",
  20: "#e6f598",
  30: "#fee08b",
  40: "#fdae61",
  50: "#f46d43",
  60: "#d53e4f",
  80: "#9e0142",
  100: "#67001f",
  120: "#40000c",
};

Promise.all([
  fetch("/metropole.geojson").then((res) => res.json()) as Promise<Feature<MultiPolygon>>,
  fetch(`/${windFile}.json`).then((res) => res.json()) as Promise<WindData>,
  dataImageLoader(`/${windFile}.png`) as Promise<HTMLImageElement>,
]).then(([metropoleData, windData, windImage]) => {
  const boundaryCanvas = document.querySelector<HTMLCanvasElement>("#boundary")!;
  new BoundaryCanvas(boundaryCanvas, metropoleData, windData.bbox);

  const windCanvas = document.querySelector<HTMLCanvasElement>("#wind")!;
  const windMap = new WindMap(windCanvas, windData, windImage, windSpeedRampColor);

  new Legend(windSpeedRampColor);

  gui.add(windMap, "numParticles", 1024, 589824);
  gui.add(windMap, "fadeOpacity", 0.01, 0.999).step(0.001);
  gui.add(windMap, "speedFactor", 0.05, 1.0);
  gui.add(windMap, "dropRate", 0, 0.1);
  gui.add(windMap, "dropRateBump", 0, 0.2);
});
