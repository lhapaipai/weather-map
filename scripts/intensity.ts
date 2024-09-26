import { buildPrecipitationImages } from "./lib/build-precipitation-images";
import { fetchFile } from "./lib/fetch-file";
import { resize } from "./lib/resize";

const grid = "001" as "001" | "0025";

const aromePiGrid = `MF-NWP-HIGHRES-AROMEPI-${grid}-FRANCE-WCS`;

const param = "REFLECTIVITY_MAX_DBZ__GROUND_OR_WATER_SURFACE";

const debug = false;
const subset = debug ? ["long(8.6,8.7)", "lat(45,45.1)"] : ["long(-5.6,10.2)", "lat(40.8,52)"];

const dateDir = undefined;

for (const interval of [
  900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100, 9000, 9900, 10800, 11700, 12600, 13500,
  14400, 15300, 16200, 17100, 18000, 18900, 19800, 20700, 21600,
]) {
  await fetchFile({
    dateDir,
    aromePiGrid,
    param,
    timeIntervalSubset: interval,
    subset,
  });
}

if (grid === "001") {
  await resize({ aromePiGrid, param, dateDir });
}

await buildPrecipitationImages({
  dateDir,
  aromePiGrid,
  param,
  useRaw: grid === "0025",
});
