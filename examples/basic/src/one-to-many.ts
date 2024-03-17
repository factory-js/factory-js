import { count, eq } from "drizzle-orm";
import { db } from "../db";
import { posts } from "../schema";

export const getPostCount = async (authorId: number) => {
  const results = await db
    .select({ count: count() })
    .from(posts)
    .where(eq(posts.authorId, authorId));
  return results[0]?.count;
};
