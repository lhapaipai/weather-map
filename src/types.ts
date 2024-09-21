export type WindData = {
  source: string;
  date: string;
  width: number;
  height: number;
  bbox: number[];
  min: number;
  max: number;
};

export type Manifest = {
  source: string;
  bbox: number[];
  width: number;
  height: number;
  dateStart: string;
  dateEnd: string;
  min: number;
  max: number;
  textures: {
    min: number;
    max: number;
    date: string;
    filename: string;
  }[];
};
