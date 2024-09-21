function pad(number: number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}

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

export function toFileString(date: Date) {
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
