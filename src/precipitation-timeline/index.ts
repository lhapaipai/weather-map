import { Feature, MultiPolygon } from "geojson";
import BoundaryCanvas from "~/lib/BoundaryCanvas";
import "../style.css";
import "./style.css";
import PrecipitationMap from "./PrecipitationMap";
import GUI from "lil-gui";
import { Legend } from "~/lib/Legend";
import { Manifest } from "~/types";

const gui = new GUI();

const rampColor = {
  0: "#ffffff",
  4: "#ffffff",
  5: "#0000ff",
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

const dateElt = document.querySelector<HTMLSpanElement>("#date")!;
const hoursElt = document.querySelector<HTMLSpanElement>("#hours")!;

const precipitationCanvas = document.querySelector<HTMLCanvasElement>("#principal-canvas")!;
const precipitationMap = new PrecipitationMap(precipitationCanvas, rampColor);

new Legend(rampColor, "Réflectivité dBZ");

gui.add(precipitationMap, "rampMaxColors", 2, 64);
gui.add(precipitationMap, "opacity", 0, 1);
gui.add(precipitationMap, "timelineSpeedFactor", 0, 14400).step(600).name("Facteur de vitesse");

const baseUrl = "/weather-map";
const windDir = "/AROMEPI-001/REFLECTIVITY/2024-09-26_08-00-00";

Promise.all([
  fetch(`${baseUrl}/metropole.geojson`).then((res) => res.json()) as Promise<Feature<MultiPolygon>>,
  fetch(`${baseUrl}${windDir}/manifest.json`).then((res) => res.json()) as Promise<Manifest>,
]).then(([metropoleData, manifest]) => {
  const boundaryCanvas = document.querySelector<HTMLCanvasElement>("#boundary")!;
  new BoundaryCanvas(boundaryCanvas, metropoleData, manifest.bbox);

  gui
    .add(
      precipitationMap,
      "timeCurrent",
      new Date(manifest.dateStart).getTime() / 1000,
      new Date(manifest.dateEnd).getTime() / 1000,
    )
    .onFinishChange(() => {
      precipitationMap.isPlaying = true;
    })
    .name("Timestamp")
    .listen();
  precipitationMap.setTimeline(manifest, `${baseUrl}${windDir}`);
  precipitationMap.onFrame = (timeCurrent) => {
    const date = new Date(timeCurrent * 1000);
    dateElt.textContent = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    hoursElt.textContent = date.getHours().toString();
  };
});
