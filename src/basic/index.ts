import { Feature, MultiPolygon } from "geojson";
import BoundaryCanvas from "~/lib/BoundaryCanvas";
import "./style.css";
import WindMap from "./WindMap";
import GUI from "lil-gui";
import { Legend } from "~/lib/Legend";
import { WindTextureHelper } from "./WindTextureHelper";

const gui = new GUI();

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

const windCanvas = document.querySelector<HTMLCanvasElement>("#wind")!;
const windMap = new WindMap(windCanvas, windSpeedRampColor);

new Legend(windSpeedRampColor);

gui.add(windMap, "numParticles", 1024, 589824);
gui.add(windMap, "fadeOpacity", 0.01, 0.999).step(0.001);
gui.add(windMap, "speedFactor", 0.05, 1.0);
gui.add(windMap, "dropRate", 0, 0.1);
gui.add(windMap, "dropRateBump", 0, 0.2);
gui
  .add(new WindTextureHelper(windMap, "wind_2024-09-18_06-00-00"), "value", [
    "wind_2024-09-18_06-00-00",
    "wind_debug",
  ])
  .name("texture");

const franceBBox = [-5.584626288659794, 40.774618181818184, 10.225373711340218, 51.984618181818185];

fetch("/wind-map/metropole.geojson")
  .then((res) => res.json())
  .then((metropoleData: Feature<MultiPolygon>) => {
    const boundaryCanvas = document.querySelector<HTMLCanvasElement>("#boundary")!;
    new BoundaryCanvas(boundaryCanvas, metropoleData, franceBBox);
  });
