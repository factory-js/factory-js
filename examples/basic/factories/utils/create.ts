import type { TableConfig } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "../../db";

export const create = async <T extends TableConfig>(
  table: SQLiteTable<T>,
  props: SQLiteTable<T>["$inferInsert"],
) => {
  const models = await db.insert(table).values(props).returning();
  if (!Array.isArray(models) || models[0] === undefined)
    throw Error("Failed to insert.");
  return models[0];
};
