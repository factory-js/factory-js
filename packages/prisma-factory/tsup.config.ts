import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin/index.ts",
    index: "src/index.ts",
  },
  target: "es2020",
  format: ["cjs", "esm"],
  sourcemap: false,
  clean: true,
  dts: true,
});
