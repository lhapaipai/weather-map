import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/wind-map/",
  plugins: [glsl()],
  resolve: {
    alias: {
      "~": resolve(projectDir, "src"),
    },
  },
});
