import { createWriteStream, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PNG } from "pngjs";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(currentDir, "../../public");

const width = 100;
const height = 100;
const bbox = [-5.584626288659794, 40.774618181818184, 10.225373711340218, 51.984618181818185];
const png = new PNG({
  colorType: 6, // colortype 0 (grayscale), colortype 2 (RGB), colortype 4 (grayscale alpha) and colortype 6 (RGBA)
  filterType: 4,
  width,
  height,
});

let min = Infinity;
let max = -Infinity;

function prepareValue(val: number) {
  return val * 100 + 32768;
}

/**
 * 0   0  +u -v
 * 0   0  +v -u
 * <-- <- 0 -> -->   équivalent --u -u 0 +u ++u
 * --> -> 0 <- <--   équivalent ++u +u 0 -u --u
 * --v -v 0 +v ++v
 */

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;

    let uVal = 0,
      vVal = 0;

    if (x > 50 && x < 75 && y < 25) {
      uVal = 20;
    } else if (x >= 75 && y < 25) {
      vVal = -20;
    } else if (x > 50 && x < 75 && y >= 25 && y < 50) {
      vVal = 20;
    } else if (x >= 75 && y >= 25 && y < 50) {
      uVal = -20;
    } else if (y >= 50 && y < 60) {
      uVal = x - 50;
    } else if (y >= 60 && y < 70) {
      uVal = 50 - x;
    } else if (y >= 70 && y < 85) {
      vVal = x - 50;
    } else if (y >= 85) {
      vVal = 50 - x;
    }

    const normalizedU = prepareValue(uVal);
    const normalizedV = prepareValue(vVal);

    min = Math.min(min, Math.sqrt(uVal * uVal + vVal * vVal));
    max = Math.max(max, Math.sqrt(uVal * uVal + vVal * vVal));

    png.data[i + 0] = Math.floor(normalizedU / 256);
    png.data[i + 1] = Math.floor(normalizedV / 256);
    png.data[i + 2] = normalizedU % 256;
    png.data[i + 3] = normalizedV % 256;
  }
}

png.pack().pipe(createWriteStream(`${publicDir}/wind_debug.png`));

writeFileSync(
  `${publicDir}/wind_debug.json`,
  JSON.stringify(
    {
      source: "https://portail-api.meteofrance.fr",
      date: "2024-09-18T06.00.00Z",
      bbox,
      width,
      height,
      min,
      max,
    },
    null,
    2,
  ) + "\n",
);
