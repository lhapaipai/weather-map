import fetch, { RequestInit } from "node-fetch";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

import { access, unlink } from "node:fs/promises";

export async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

const streamPipeline = promisify(pipeline);

export async function downloadFile(url: string, init: RequestInit, path, force = false) {
  if (await fileExists(path)) {
    if (!force) {
      console.log(`[skip] ${path} already exists`);
      return;
    }
    console.log(`[rm] ${path} already exists`);
    await unlink(path);
  }
  console.log(`[download] ${path}`);

  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body!, createWriteStream(path));
}
