import type { Config } from "drizzle-kit";

export default {
  schema: "./schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: "test.db",
  },
} satisfies Config;
