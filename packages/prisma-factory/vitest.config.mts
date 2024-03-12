import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    chaiConfig: {
      truncateThreshold: 3000,
    },
    coverage: {
      all: true,
      include: ["src/**/*"],
      exclude: ["src/index.ts", "src/bin/index.ts", "src/generator/index.ts"],
    },
  },
});
