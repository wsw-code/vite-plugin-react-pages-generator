import { defineConfig } from "tsup";

export default defineConfig({
  external: ["vite", "vitepress", /^vitepress/],
  entryPoints: ["src/index.ts"],
  outDir: "dist",
  dts: true,
  format: ["esm", "cjs"],
});
