import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("e2e", "schema.prisma"),
} satisfies PrismaConfig;
