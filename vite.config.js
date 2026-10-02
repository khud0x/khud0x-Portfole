import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/khud0x-Portfole/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
