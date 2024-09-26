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
  colorType: 2, // colortype 0 (grayscale), colortype 2 (RGB), colortype 4 (grayscale alpha) and colortype 6 (RGBA)
  filterType: 4,
  width,
  height,
});

let min = Infinity;
let max = -Infinity;

/**
 * 0      0
 * 4000   0
 */

const maxValue = 4000;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;

    let val = 0;
    if (x < 80) {
      val = (y * maxValue) / 100;
    }

    min = Math.min(min, val);
    max = Math.max(max, val);

    png.data[i + 0] = Math.floor(val / 256);
    png.data[i + 1] = Math.floor(val) % 256;
    png.data[i + 2] = 0;
    png.data[i + 3] = 255;
  }
}

png.pack().pipe(createWriteStream(`${publicDir}/basic/precipitation_debug.png`));

writeFileSync(
  `${publicDir}/basic/precipitation_debug.json`,
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
