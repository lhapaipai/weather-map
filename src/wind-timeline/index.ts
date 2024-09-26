import { Feature, MultiPolygon } from "geojson";
import BoundaryCanvas from "~/lib/BoundaryCanvas";
import "../style.css";
import "./style.css";
import WindMap from "./WindMap";
import GUI from "lil-gui";
import { Legend } from "~/lib/Legend";
import { Manifest } from "~/types";

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

const dateElt = document.querySelector<HTMLSpanElement>("#date")!;
const hoursElt = document.querySelector<HTMLSpanElement>("#hours")!;

const windCanvas = document.querySelector<HTMLCanvasElement>("#principal-canvas")!;
const windMap = new WindMap(windCanvas, windSpeedRampColor);

new Legend(windSpeedRampColor, "Vitesse du vent en m/s");

gui.add(windMap, "numParticles", 1024, 589824).name("Nombre particules");
gui.add(windMap, "fadeOpacity", 0.01, 0.999).step(0.001).name("Opacité de la trainée");
gui.add(windMap, "speedFactor", 0.05, 1.0).name("Vitesse particules");
gui.add(windMap, "dropRate", 0, 0.1).name("Longévité 1");
gui.add(windMap, "dropRateBump", 0, 0.2).name("Longévité 2");
gui.add(windMap, "timelineSpeedFactor", 0, 14400).step(600).name("Facteur de vitesse");

const baseUrl = "/wind-map";
const windDir = "/AROMEPI-001/UV_WIND_15MIN/2024-09-21_12-00-00";

Promise.all([
  fetch(`${baseUrl}/metropole.geojson`).then((res) => res.json()) as Promise<Feature<MultiPolygon>>,
  fetch(`${baseUrl}${windDir}/manifest.json`).then((res) => res.json()) as Promise<Manifest>,
]).then(([metropoleData, manifest]) => {
  const boundaryCanvas = document.querySelector<HTMLCanvasElement>("#boundary")!;
  new BoundaryCanvas(boundaryCanvas, metropoleData, manifest.bbox);

  gui
    .add(
      windMap,
      "timeCurrent",
      new Date(manifest.dateStart).getTime() / 1000,
      new Date(manifest.dateEnd).getTime() / 1000,
    )
    .onFinishChange(() => {
      windMap.isPlaying = true;
    })
    .name("Timestamp")
    .listen();
  windMap.setTimeline(manifest, `${baseUrl}${windDir}`);
  windMap.onFrame = (timeCurrent) => {
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
