import { mkdir, readdir, readFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { dateToFilename, fileDateToMfDate, toISOString } from "./util/date";
import { downloadFile } from "./util/file";
import { stringifyParams } from "./util/url";
import { aromePiGrids, aromePiParams, aromePiServer } from "../config";

const apikey = process.env.MF_APIKEY!;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "../data");

type FetchOptions = {
  aromePiGrid: string;
  param: string;
  dateDir?: string;
  force?: boolean;
  subset: string[];
  timeIntervalSubset?: number;
};

export async function fetchFile({
  aromePiGrid,
  param,
  force = false,
  dateDir,
  subset,
  timeIntervalSubset,
}: FetchOptions) {
  const gridDir = aromePiGrids[aromePiGrid];
  const capabilitiesDir = join(dataDir, `${gridDir}/get-capabilities`);

  const files = await readdir(capabilitiesDir);

  if (files.length === 0) {
    throw new Error("GetCapabilities doesn't exists run 01-get-capabilities.ts first");
  }

  const capabilitiesFile = files.sort().at(-1)!;

  const capabilitiesContent = await readFile(join(capabilitiesDir, capabilitiesFile!), {
    encoding: "utf-8",
  });

  const capabilities = JSON.parse(capabilitiesContent);

  const coverages = capabilities.Capabilities.Contents.CoverageSummary;
  const coverageIds: string[] = coverages.map((c) => c.CoverageId);

  let coverageId;

  if (!dateDir) {
    const lastCoverageId = coverageIds
      .filter((id) => id.startsWith(param))
      .sort()
      .at(-1)!;
    coverageId = lastCoverageId;
  } else {
    const mfDateSuffix = fileDateToMfDate(dateDir);
    coverageId = coverageIds.find((id) => id.endsWith(mfDateSuffix));
  }
  if (!coverageId) {
    throw new Error(`Unable to find coverageId with dateDir ${dateDir}`);
  }

  const matches = coverageId.match(/___([-0-9]*)T([0-9]{2})\.([0-9]{2})\.([0-9]{2})Z$/);
  if (!matches) {
    throw new Error(`unable to parse time ${coverageId}`);
  }
  const [_, dateStr, hours, min, sec] = matches;

  const currentDate = new Date(`${dateStr}T${hours}:${min}:${sec}Z`);
  const timestamp = currentDate.getTime();

  const subsetCopy = [...subset];

  let date = new Date(timestamp);
  if (timeIntervalSubset) {
    date = new Date(timestamp + timeIntervalSubset * 1000);
    subsetCopy.push(`time(${toISOString(date)})`);
  }

  const url = `${aromePiServer}/wcs/${aromePiGrid}/GetCoverage?${stringifyParams({
    service: "WCS",
    version: "2.0.1",
    format: "image/tiff",
    coverageid: coverageId,
    subset: subsetCopy,
  })}`;
  const filename = `${dateToFilename(date)}.tiff`;

  const dstDir = join(
    dataDir,
    `${aromePiGrids[aromePiGrid]}/${aromePiParams[param]}/${dateToFilename(currentDate)}`,
  );

  await mkdir(dstDir, { recursive: true });

  await downloadFile(url, { headers: { apikey } }, resolve(dstDir, filename), force);
}
