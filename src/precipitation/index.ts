import { Feature, MultiPolygon } from "geojson";
import BoundaryCanvas from "~/lib/BoundaryCanvas";
import "../style.css";
import PrecipitationMap from "./PrecipitationMap";
import GUI from "lil-gui";
import { Legend } from "~/lib/Legend";
import { DataImageHelper } from "~/lib/DataImageHelper";

const gui = new GUI();

const rampColor = {
  0: "#0000ff",
  10: "#00ffff",
  20: "#00ff00",
  30: "#ffff00",
  40: "#ffbf00",
  50: "#ff8000",
  60: "#ff0000",
  70: "#bf0000",
  80: "#800000",
  90: "#4b0000",
  100: "#280000",
};

const precipitationCanvas = document.querySelector<HTMLCanvasElement>("#principal-canvas")!;
const precipitationMap = new PrecipitationMap(precipitationCanvas, rampColor);

new Legend(rampColor, "Réflectivité dBZ");

gui.add(precipitationMap, "rampMaxColors", 2, 64);
gui.add(precipitationMap, "opacity", 0, 1);
gui
  .add(
    new DataImageHelper(precipitationMap, "reflectivity_2024-09-26_09-45-00", "basic/"),
    "value",
    ["reflectivity_debug", "reflectivity_2024-09-26_09-45-00"],
  )
  .name("texture");

const franceBBox = [-5.584626288659794, 40.774618181818184, 10.225373711340218, 51.984618181818185];

fetch("metropole.geojson")
  .then((res) => res.json())
  .then((metropoleData: Feature<MultiPolygon>) => {
    const boundaryCanvas = document.querySelector<HTMLCanvasElement>("#boundary")!;
    new BoundaryCanvas(boundaryCanvas, metropoleData, franceBBox);
  });
