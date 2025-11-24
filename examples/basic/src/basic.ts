import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema";

export const isAdmin = async (userId: number) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return user?.role === "admin";
};
