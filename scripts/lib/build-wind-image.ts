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

function prepareValue(val: number) {
  return val * 100 + 32768;
}

type BuildImagesOptions = {
  aromePiGrid: string;
  uParam: string;
  vParam: string;
  dstDirname: string;

  dateDir?: string;
  force?: boolean;
};

export async function buildWindImages({
  aromePiGrid,
  uParam,
  vParam,
  dateDir,
  dstDirname,
  force = false,
}: BuildImagesOptions) {
  const gridDir = aromePiGrids[aromePiGrid];
  const uParamDir = aromePiParams[uParam];
  const vParamDir = aromePiParams[vParam];

  if (!dateDir) {
    const lowDirnames = await readdir(join(tmpDir, `${gridDir}/${uParamDir}`));

    if (lowDirnames.length === 0) {
      throw new Error("no dir inside low dir run 03-resize first");
    }

    dateDir = lowDirnames.sort().at(-1);
  }

  const uSrcDir = join(tmpDir, `${gridDir}/${uParamDir}/${dateDir}`);
  const vSrcDir = join(tmpDir, `${gridDir}/${vParamDir}/${dateDir}`);
  const dstDir = join(publicDir, `${gridDir}/${dstDirname}/${dateDir}`);

  if (!(await fileExists(uSrcDir))) {
    throw new Error(`${uSrcDir} doesn't exists`);
  }
  if (!(await fileExists(vSrcDir))) {
    throw new Error(`${vSrcDir} doesn't exists`);
  }

  await mkdir(dstDir, { recursive: true });

  const uFilenames = await readdir(uSrcDir);
  const vFilenames = await readdir(vSrcDir);

  const uFiles = uFilenames.filter((f) => f.endsWith(".tiff")).sort();
  const vFiles = vFilenames.filter((f) => f.endsWith(".tiff")).sort();

  const uvFiles = uFiles
    .map((uFile) => {
      const fileDate = getFileDateFromFilename(uFile);
      const vFile = `${fileDate}.tiff`;
      return vFiles.includes(vFile) ? [fileDate, uFile, vFile] : null;
    })
    .filter((f) => f !== null);

  const imageInfos: ImageInfo[] = [];

  for (const [fileDate, uFilename, vFilename] of uvFiles) {
    const date = parseFileDate(fileDate);
    const filename = `${fileDate}.png`;

    const dstPng = join(dstDir, filename);
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

    const uTiff = await fromFile(join(uSrcDir, uFilename));
    const uImage = await uTiff.getImage();
    const uRaster = (await uImage.readRasters())[0] as TypedArray;

    const vTiff = await fromFile(join(vSrcDir, vFilename));
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

    const jsonContent = {
      filename,
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
