import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/weather-map/",
  plugins: [glsl()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectDir, "index.html"),
        wind: resolve(projectDir, "wind.html"),
        windTimeline: resolve(projectDir, "wind-timeline.html"),
        precipitation: resolve(projectDir, "precipitation.html"),
        precipitationTimeline: resolve(projectDir, "precipitation-timeline.html"),
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(projectDir, "src"),
    },
  },
});
