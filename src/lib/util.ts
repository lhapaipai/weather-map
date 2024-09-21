export const dataImageLoader = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = (e) => {
      resolve(e.target as HTMLImageElement);
    };
    img.src = url;
  });
};
