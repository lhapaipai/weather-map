function pad(number: number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

/**
 * date    : Date
 * return  : "2024-09-20T06:15:00Z"
 */
export function toISOString(date: Date) {
  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    ":" +
    pad(date.getUTCMinutes()) +
    ":" +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * date    : Date
 * return  : "2024-09-20_06-15-00"
 */
export function dateToFilename(date: Date) {
  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate()) +
    "_" +
    pad(date.getUTCHours()) +
    "-" +
    pad(date.getUTCMinutes()) +
    "-" +
    pad(date.getUTCSeconds())
  );
}

/**
 * filename: "2024-09-20_06-15-00-u-wind.tiff"
 * return  : "2024-09-20_06-15-00"
 */
export function getFileDateFromFilename(filename: string) {
  return filename.substring(0, 19);
}

/**
 * fileDate: "2024-09-20_06-15-00"
 * return  : Date instance
 */
export function parseFileDate(fileDate: string) {
  const matches = fileDate.match(
    /^([0-9]{4})-([0-9]{2})-([0-9]{2})_([0-9]{2})-([0-9]{2})-([0-9]{2})$/,
  );
  if (!matches) {
    throw new Error(`invalid fileDate ${fileDate}`);
  }
  const [, year, month, day, hours, minutes, seconds] = matches;
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
}
