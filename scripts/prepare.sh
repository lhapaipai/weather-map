#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

mkdir -p tmp

gdal_translate -outsize 0 275 \
  raw/V_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z.tiff \
  tmp/V_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z-low.tiff

gdal_translate -outsize 0 275 \
  raw/U_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z.tiff \
  tmp/U_COMPONENT_OF_WIND_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND___2024-09-18T06.00.00Z-low.tiff

pnpm exec tsx src/other-04-france-weather/scripts/build-image.ts

rm -rf tmp
