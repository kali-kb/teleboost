import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd());
  return {
    plugins: [vue(), tailwindcss()],
  };
});
