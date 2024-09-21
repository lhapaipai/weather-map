import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/wind-map/",
  plugins: [glsl()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectDir, "index.html"),
        basic: resolve(projectDir, "01-basic.html"),
        timeline: resolve(projectDir, "02-timeline.html"),
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(projectDir, "src"),
    },
  },
});
