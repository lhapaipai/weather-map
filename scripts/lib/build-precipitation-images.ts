import { createWriteStream } from "node:fs";
import { fromFile, TypedArray } from "geotiff";
import { dirname, join, resolve } from "node:path";
import { PNG } from "pngjs";
import { fileURLToPath } from "node:url";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { fileExists } from "./util/file";
import { getFileDateFromFilename, parseFileDate, toISOString } from "./util/date";
import { aromePiGrids, aromePiParams, aromePiServer } from "../config";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const tmpDir = resolve(scriptDir, "../tmp");
const dataDir = resolve(scriptDir, "../data");

const publicDir = resolve(scriptDir, "../../public");

type ImageInfo = {
  filename: string;
  source: string;
  date: string;
  bbox: number[];
  width: number;
  height: number;
  min: number;
  max: number;
};

type BuildPrecipitationImagesOptions = {
  aromePiGrid: string;
  param: string;

  dateDir?: string;
  force?: boolean;
  useRaw?: boolean;
};

export async function buildPrecipitationImages({
  aromePiGrid,
  param,
  dateDir,
  force = true,
  useRaw = false,
}: BuildPrecipitationImagesOptions) {
  const gridDir = aromePiGrids[aromePiGrid];
  const paramDir = aromePiParams[param];

  const baseDir = useRaw ? dataDir : tmpDir;

  if (!dateDir) {
    const lowDirnames = await readdir(join(baseDir, `${gridDir}/${paramDir}`));

    if (lowDirnames.length === 0) {
      throw new Error("no dir inside tmp dir run resize first");
    }

    dateDir = lowDirnames.sort().at(-1);
  }

  const srcDir = join(baseDir, `${gridDir}/${paramDir}/${dateDir}`);
  const dstDir = join(publicDir, `${gridDir}/${paramDir}/${dateDir}`);

  if (!(await fileExists(srcDir))) {
    throw new Error(`${srcDir} doesn't exists`);
  }

  await mkdir(dstDir, { recursive: true });

  const filenames = (await readdir(srcDir)).filter((f) => f.endsWith(".tiff")).sort();

  const imageInfos: ImageInfo[] = [];

  for (const tiffFilename of filenames) {
    const fileDate = getFileDateFromFilename(tiffFilename);
    const date = parseFileDate(fileDate);
    const pngFilename = `${fileDate}.png`;

    const dstPng = join(dstDir, pngFilename);
    const dstJson = join(dstDir, `${fileDate}.json`);

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

    const tiff = await fromFile(join(srcDir, tiffFilename));
    const image = await tiff.getImage();
    const raster = (await image.readRasters())[0] as TypedArray;

    const width = image.getWidth();
    const height = image.getHeight();
    const bbox = image.getBoundingBox();

    const png = new PNG({
      colorType: 2, // colortype 0 (grayscale), colortype 2 (RGB), colortype 4 (grayscale alpha) and colortype 6 (RGBA)
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

        const val = raster[k];

        min = Math.min(min, val);
        max = Math.max(max, val);

        png.data[i + 0] = Math.floor(val / 256);
        png.data[i + 1] = Math.floor(val) % 256;
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
      }
    }

    png.pack().pipe(createWriteStream(dstPng));

    const jsonContent = {
      filename: pngFilename,
      source: aromePiServer,
      date: toISOString(date),
      bbox,
      width,
      height,
      min,
      max,
    };
    await writeFile(dstJson, JSON.stringify(jsonContent, null, 2) + "\n", { encoding: "utf-8" });

    imageInfos.push(jsonContent);
  }

  const { bbox, width, height } = imageInfos[0];

  const min = imageInfos.reduce((prev, imageInfo) => Math.min(prev, imageInfo.min), +Infinity);
  const max = imageInfos.reduce((prev, imageInfo) => Math.max(prev, imageInfo.max), -Infinity);

  await writeFile(
    resolve(dstDir, "manifest.json"),
    JSON.stringify(
      {
        source: aromePiServer,
        bbox,
        width,
        height,
        dateStart: imageInfos[0].date,
        dateEnd: imageInfos.at(-1)?.date,
        min,
        max,
        textures: imageInfos.map(({ min, max, filename, date }) => ({ min, max, filename, date })),
      },
      null,
      2,
    ) + "\n",
    {
      encoding: "utf-8",
    },
  );
}
