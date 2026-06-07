import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(() => ({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  base: "./",
  build: {
    target: "esnext",
  },
  server: {
    proxy: {
      "/admin": "http://localhost:9091",
    },
    port: 3035,
  },
}));
