import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "es2020",
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  dts: true,
});
