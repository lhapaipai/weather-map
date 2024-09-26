import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

import "dotenv/config";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

import { dateToFilename } from "./lib/util/date";
import { aromePiGrids } from "./config";

const apikey = process.env.MF_APIKEY!;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "data");

const mfUrl = "https://public-api.meteofrance.fr/public/aromepi/1.0";

for (const aromePiGrid of [
  "MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS",
  "MF-NWP-HIGHRES-AROMEPI-0025-FRANCE-WCS",
]) {
  const gridDir = aromePiGrids[aromePiGrid];

  const xmlCapabilities = await fetch(
    `${mfUrl}/wcs/${aromePiGrid}/GetCapabilities?service=WCS&version=2.0.1&language=fre`,
    { headers: { apikey } },
  ).then((res) => res.text());

  const parser = new XMLParser({
    removeNSPrefix: true,
  });
  const capabilities = parser.parse(xmlCapabilities);

  const coverages = capabilities.Capabilities.Contents.CoverageSummary;
  const coverageIds: string[] = coverages
    .map((c) => c.CoverageId)
    .filter((id) => id.includes("WIND"));

  /**
   * we take some random Coverage who is present in each grid
   */
  const uComponent = coverageIds
    .filter((id) => id.startsWith("U_COMPONENT_OF_WIND_GUST_15MIN"))
    .sort()
    .at(-1)!;

  const matches = uComponent.match(/___([-0-9]*)T([0-9]{2})\.([0-9]{2})\.([0-9]{2})Z$/);
  if (!matches) {
    throw new Error(`unable to parse time ${uComponent}`);
  }
  const [_, dateStr, hours, min, sec] = matches;

  const currentDate = new Date(`${dateStr}T${hours}:${min}:${sec}Z`);

  const dstDir = join(dataDir, `${gridDir}/get-capabilities`);

  await mkdir(dstDir, { recursive: true });

  await writeFile(
    join(dstDir, `${dateToFilename(currentDate)}.json`),
    JSON.stringify(capabilities, undefined, 2),
  );
}
