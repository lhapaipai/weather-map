import { WindData } from "~/types";
import WindMap from "~/WindMap";
import { dataImageLoader } from "../util";

export class WindTextureHelper {
  private declare _value: string;

  constructor(
    private windMap: WindMap,
    initialValue: string,
  ) {
    this.value = initialValue;
  }

  set value(textureName: string) {
    if (this._value === textureName) {
      return;
    }
    Promise.all([
      fetch(`/wind-map/basic/${textureName}.json`).then((res) => res.json()) as Promise<WindData>,
      dataImageLoader(`/wind-map/basic/${textureName}.png`) as Promise<HTMLImageElement>,
    ]).then(([windData, windImage]) => {
      this.windMap.setWind(windData, windImage);
    });
    this._value = textureName;
  }
  get value() {
    return this._value;
  }
}
