import { mkdir, readdir, unlink } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { runCommand } from "./lib/process-util";
import { fileExists } from "./lib/file-util";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "data");

export async function resize(dirname?: string, force = false) {
  if (!dirname) {
    const rawDirnames = await readdir(resolve(dataDir, "raw"));

    if (rawDirnames.length === 0) {
      throw new Error("no dir inside raw dir run 02-fetch-wind-files first");
    }

    dirname = rawDirnames.sort().at(-1);
  }

  const srcDir = resolve(dataDir, `raw/${dirname}`);
  const dstDir = resolve(dataDir, `low/${dirname}`);

  if (!(await fileExists(srcDir))) {
    throw new Error(`${srcDir} doesn't exists`);
  }

  await mkdir(dstDir, { recursive: true });

  const filenames = await readdir(srcDir);
  for (const filename of filenames) {
    if (!filename.endsWith(".tiff")) {
      continue;
    }
    const src = resolve(srcDir, filename);
    const dst = resolve(dstDir, filename);

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

resize();
