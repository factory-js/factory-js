import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDrizzle>["db"];

const createDrizzle = () => {
  const client = new Database("test.db");
  const db = drizzle(client, { schema });
  const disconnect: () => Database.Database = () => client.close();
  return { db, disconnect };
};

export const { db, disconnect } = createDrizzle();
