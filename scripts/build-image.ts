import { createWriteStream, writeFileSync } from "node:fs";
import { fromFile, TypedArray } from "geotiff";
import { dirname, resolve } from "node:path";
import { PNG } from "pngjs";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(currentDir, "../public");

const layer = "WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND";
const datetime = "2024-09-18T06.00.00Z";

const ufilename = `U_COMPONENT_OF_${layer}___${datetime}-low.tiff`;
const vfilename = `V_COMPONENT_OF_${layer}___${datetime}-low.tiff`;

const uTiff = await fromFile(`${currentDir}/tmp/${ufilename}`);
const uImage = await uTiff.getImage();
const uRaster = (await uImage.readRasters())[0] as TypedArray;

const vTiff = await fromFile(`${currentDir}/tmp/${vfilename}`);
const vImage = await vTiff.getImage();
const vRaster = (await vImage.readRasters())[0] as TypedArray;

const width = uImage.getWidth();
const height = uImage.getHeight();
const bbox = uImage.getBoundingBox();

const png = new PNG({
  colorType: 6,
  filterType: 4,
  width,
  height,
});

let min = Infinity;
let max = -Infinity;

function prepareValue(val: number) {
  return val * 100 + 32768;
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const k = y * width + x;

    const uVal = uRaster[k];
    const vVal = vRaster[k];

    const normalizedU = prepareValue(uVal);
    const normalizedV = prepareValue(vVal);

    min = Math.min(min, Math.sqrt(uVal * uVal + vVal * vVal));
    max = Math.max(max, Math.sqrt(uVal * uVal + vVal * vVal));

    png.data[i + 0] = Math.floor(normalizedU / 256);
    png.data[i + 1] = Math.floor(normalizedV / 256);
    png.data[i + 2] = Math.floor(normalizedU) % 256;
    png.data[i + 3] = Math.floor(normalizedV) % 256;
  }
}

png.pack().pipe(createWriteStream(`${publicDir}/wind_${datetime}.png`));

writeFileSync(
  `${publicDir}/wind_${datetime}.json`,
  JSON.stringify(
    {
      source: "https://portail-api.meteofrance.fr",
      date: datetime,
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
