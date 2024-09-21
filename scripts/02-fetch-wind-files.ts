import { mkdir, readdir, readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { dateToFilename, toISOString } from "./lib/date-util";
import { downloadFile } from "./lib/file-util";

const apikey = process.env.MF_APIKEY!;

const forceDownload = false;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "data");

const files = await readdir(resolve(dataDir, "get-capabilities"));

if (files.length === 0) {
  throw new Error("GetCapabilities doesn't exists run 01-get-capabilities.ts first");
}

const lastFile = files.sort().at(-1);
const capabilitiesContent = await readFile(resolve(dataDir, `get-capabilities/${lastFile}`), {
  encoding: "utf-8",
});

const capabilities = JSON.parse(capabilitiesContent);

const coverages = capabilities["wcs:Capabilities"]["wcs:Contents"]["wcs:CoverageSummary"];
const coverageIds: string[] = coverages
  .map((c) => c["wcs:CoverageId"])
  .filter((id) => id.includes("WIND"));

const uComponent = coverageIds
  .filter((id) => id.startsWith("U_COMPONENT_OF_WIND_GUST_15MIN"))
  .sort()
  .at(-1)!;

const vComponent = coverageIds
  .filter((id) => id.startsWith("V_COMPONENT_OF_WIND_GUST_15MIN"))
  .sort()
  .at(-1)!;

// const titles = [...new Set(coverages.map((c) => c["ows:Title"]))];

const matches = uComponent.match(/___([-0-9]*)T([0-9]{2})\.([0-9]{2})\.([0-9]{2})Z$/);
if (!matches) {
  throw new Error(`unable to parse time ${uComponent}`);
}
const [_, dateStr, hours, min, sec] = matches;

const currentDate = new Date(`${dateStr}T${hours}:${min}:${sec}Z`);
const timestamp = currentDate.getTime();

const intervals = [
  900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100, 9000, 9900, 10800, 11700, 12600, 13500,
  14400, 15300, 16200, 17100, 18000, 18900, 19800, 20700, 21600,
];

const aromeServer = "https://public-api.meteofrance.fr/public/aromepi/1.0";
const getCoverageUrl = "/wcs/MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS/GetCoverage";
const getCoverageParams = "service=WCS&version=2.0.1&format=image/tiff";
const bbox = "subset=long(-5.6,10.2)&subset=lat(40.8,52)";
// const bbox = "subset=long(8.6,8.7)&subset=lat(45,45.1)";

const uLayers = intervals.map((interval) => {
  const date = new Date(timestamp + interval * 1000);
  return {
    url: `${aromeServer}${getCoverageUrl}?${getCoverageParams}&coverageid=${uComponent}&${bbox}&subset=time(${toISOString(date)})&subset=height(10)`,
    filename: `${dateToFilename(date)}-u-wind.tiff`,
  };
});
const vLayers = intervals.map((interval) => {
  const date = new Date(timestamp + interval * 1000);
  return {
    url: `${aromeServer}${getCoverageUrl}?${getCoverageParams}&coverageid=${vComponent}&${bbox}&subset=time(${toISOString(date)})&subset=height(10)`,
    filename: `${dateToFilename(date)}-v-wind.tiff`,
  };
});

const layers = [...uLayers, ...vLayers];
// const layers = [uLayers[0]];

await mkdir(resolve(dataDir, `raw/${dateToFilename(currentDate)}`), { recursive: true });

for (const { url, filename } of layers) {
  await downloadFile(
    url,
    { headers: { apikey } },
    resolve(dataDir, `raw/${dateToFilename(currentDate)}/${filename}`),
    forceDownload,
  );
}
