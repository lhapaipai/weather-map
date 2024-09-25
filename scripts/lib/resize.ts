import { mkdir, readdir, unlink } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { runCommand } from "./util/process";
import { fileExists } from "./util/file";
import { aromePiGrids, aromePiParams } from "../config";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "../data");
const tmpDir = resolve(scriptDir, "../tmp");

type ResizeOptions = {
  aromePiGrid: string;
  param: string;
  dateDir?: string;
  force?: boolean;
};

export async function resize({ aromePiGrid, param, dateDir, force = false }: ResizeOptions) {
  const gridDir = aromePiGrids[aromePiGrid];
  const paramDir = aromePiParams[param];

  if (!dateDir) {
    const rawDirnames = await readdir(join(dataDir, `${gridDir}/${paramDir}`));

    if (rawDirnames.length === 0) {
      throw new Error("no dir inside raw dir run 02-fetch-wind-files first");
    }

    dateDir = rawDirnames.sort().at(-1);
  }

  const srcDir = join(dataDir, `${gridDir}/${paramDir}/${dateDir}`);
  const dstDir = join(tmpDir, `${gridDir}/${paramDir}/${dateDir}`);

  if (!(await fileExists(srcDir))) {
    throw new Error(`${srcDir} doesn't exists`);
  }

  await mkdir(dstDir, { recursive: true });

  const filenames = await readdir(srcDir);
  for (const filename of filenames) {
    if (!filename.endsWith(".tiff")) {
      continue;
    }
    const src = join(srcDir, filename);
    const dst = join(dstDir, filename);

    if (await fileExists(dst)) {
      if (!force) {
        console.log(`[skip] ${dst} already exists`);
        continue;
      }
      console.log(`[rm] ${dst} already exists`);
      await unlink(dst);
    }
    console.log(`[gdal_translate] ${filename}`);

    await runCommand(`gdal_translate -outsize 0 275 ${src} ${dst}`);
  }
}
