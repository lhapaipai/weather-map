import { createWriteStream } from "node:fs";
import { fromFile, TypedArray } from "geotiff";
import { dirname, resolve } from "node:path";
import { PNG } from "pngjs";
import { fileURLToPath } from "node:url";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { fileExists } from "./lib/file-util";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "data");
const publicDir = resolve(scriptDir, "../public");

const source = "https://portail-api.meteofrance.fr";

type Report = {
  filename: string;
  source: string;
  datetime: string;
  bbox: number[];
  width: number;
  height: number;
  min: number;
  max: number;
}[];

function prepareValue(val: number) {
  return val * 100 + 32768;
}

export async function buildImages(dirname?: string, force = false) {
  if (!dirname) {
    const lowDirnames = await readdir(resolve(dataDir, "low"));

    if (lowDirnames.length === 0) {
      throw new Error("no dir inside low dir run 03-resize first");
    }

    dirname = lowDirnames.sort().at(-1);
  }

  const srcDir = resolve(dataDir, `low/${dirname}`);
  const dstDir = resolve(publicDir, dirname!);

  if (!(await fileExists(srcDir))) {
    throw new Error(`${srcDir} doesn't exists`);
  }

  await mkdir(dstDir, { recursive: true });

  const filenames = await readdir(srcDir);

  const uFiles = filenames.filter((f) => f.endsWith("-u-wind.tiff")).sort();
  const vFiles = filenames.filter((f) => f.endsWith("-v-wind.tiff")).sort();

  const uvFiles = uFiles
    .map((uFile) => {
      const isoTime = uFile.substring(0, 17);
      const vFile = `${isoTime}-v-wind.tiff`;
      return vFiles.includes(vFile) ? [isoTime, uFile, vFile] : null;
    })
    .filter((f) => f !== null);

  console.log(uvFiles);

  const report: Report = [];

  for (const [datetime, uFilename, vFilename] of uvFiles) {
    const filename = `${datetime}-wind.png`;
    const dstPng = resolve(dstDir, filename);
    const dstJson = resolve(dstDir, `${datetime}-wind.json`);
    if ((await fileExists(dstPng)) && (await fileExists(dstJson))) {
      if (!force) {
        console.log(`[skip] ${dstPng} already exists`);
        continue;
      }
      console.log(`[rm] ${dstPng} already exists`);
      await unlink(dstPng);
      await unlink(dstJson);
    }
    console.log(`[build-image] ${dstPng}`);

    const uTiff = await fromFile(resolve(srcDir, uFilename));
    const uImage = await uTiff.getImage();
    const uRaster = (await uImage.readRasters())[0] as TypedArray;

    const vTiff = await fromFile(resolve(srcDir, vFilename));
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

    png.pack().pipe(createWriteStream(dstPng));

    const jsonContent = { filename, source, datetime, bbox, width, height, min, max };
    await writeFile(dstJson, JSON.stringify(jsonContent, null, 2) + "\n", { encoding: "utf-8" });

    report.push(jsonContent);
  }

  await writeFile(resolve(dstDir, "report.json"), JSON.stringify(report, null, 2) + "\n", {
    encoding: "utf-8",
  });
}

buildImages();
