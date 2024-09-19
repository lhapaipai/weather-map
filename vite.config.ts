import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
export default defineConfig({
  base: "/wind-map/",
  plugins: [glsl()],
});
