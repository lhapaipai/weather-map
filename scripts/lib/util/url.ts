export function stringifyParams(obj: Record<string, string | string[]>) {
  const urlSearchParams = new URLSearchParams();
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      value.forEach((childValue) => {
        urlSearchParams.append(key, childValue);
      });
    } else {
      urlSearchParams.set(key, value);
    }
  }

  return urlSearchParams.toString();
}
