import { ImageMetadata } from "~/types";
import { dataImageLoader } from "~/lib/util";

type DataImageManager = {
  setDataImage: (metadata: ImageMetadata, image: HTMLImageElement) => void;
};

export class DataImageHelper {
  private declare _value: string;

  constructor(
    private windMap: DataImageManager,
    initialValue: string,
    private base = "",
  ) {
    this.value = initialValue;
  }

  set value(textureName: string) {
    if (this._value === textureName) {
      return;
    }
    Promise.all([
      fetch(`${this.base}${textureName}.json`).then((res) => res.json()) as Promise<ImageMetadata>,
      dataImageLoader(`${this.base}${textureName}.png`) as Promise<HTMLImageElement>,
    ]).then(([metadata, image]) => {
      this.windMap.setDataImage(metadata, image);
    });
    this._value = textureName;
  }
  get value() {
    return this._value;
  }
}
