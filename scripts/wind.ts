import { buildWindImages } from "./lib/build-wind-image";
import { fetchFile } from "./lib/fetch-file";
import { resize } from "./lib/resize";

const aromePiGrid = "MF-NWP-HIGHRES-AROMEPI-001-FRANCE-WCS";

const uParam = "U_COMPONENT_OF_WIND_GUST_15MIN__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND";
const vParam = "V_COMPONENT_OF_WIND_GUST_15MIN__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND";

const debug = false;
const subset = debug
  ? ["long(8.6,8.7)", "lat(45,45.1)", "height(10)"]
  : ["long(-5.6,10.2)", "lat(40.8,52)", "height(10)"];

for (const interval of [
  900, 1800, 2700, 3600, 4500, 5400, 6300, 7200, 8100, 9000, 9900, 10800, 11700, 12600, 13500,
  14400, 15300, 16200, 17100, 18000, 18900, 19800, 20700, 21600,
]) {
  await fetchFile({
    aromePiGrid,
    param: uParam,
    timeIntervalSubset: interval,
    subset,
  });

  await fetchFile({
    aromePiGrid,
    param: vParam,
    timeIntervalSubset: interval,
    subset,
  });
}

await resize({ aromePiGrid, param: uParam });
await resize({ aromePiGrid, param: vParam });

await buildWindImages({
  aromePiGrid,
  uParam,
  vParam,
  dstDirname: "UV_WIND_15MIN",
});
