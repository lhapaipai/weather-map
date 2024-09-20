import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { XMLParser } from "fast-xml-parser";
import { writeFile } from "fs/promises";

const apikey = process.env.MF_APIKEY!;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(scriptDir, "data");

const xmlCapabilities = await fetch(
  "https://public-api.meteofrance.fr/public/aromepi/1.0/wcs/MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS/GetCapabilities?service=WCS&version=2.0.1&language=fre",
  { headers: { apikey } },
).then((res) => res.text());

const parser = new XMLParser();
const capabilities = parser.parse(xmlCapabilities);

const coverages = capabilities["wcs:Capabilities"]["wcs:Contents"]["wcs:CoverageSummary"];
const coverageIds: string[] = coverages
  .map((c) => c["wcs:CoverageId"])
  .filter((id) => id.includes("WIND"));

const uComponent = coverageIds
  .filter((id) => id.startsWith("U_COMPONENT_OF_WIND_GUST_15MIN"))
  .sort()
  .at(-1)!;

const matches = uComponent.match(/___([-0-9]*)T([0-9]{2})\.([0-9]{2})\.([0-9]{2})Z$/);
if (!matches) {
  throw new Error(`unable to parse time ${uComponent}`);
}
const [_, dateStr, hours, min, sec] = matches;

const now = `${dateStr}T${hours}${min}${sec}`;

writeFile(
  resolve(dataDir, `get-capabilities/${now}.json`),
  JSON.stringify(capabilities, undefined, 2),
);
