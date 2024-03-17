import { eq } from "drizzle-orm";
import { db } from "../db";
import { categoriesOnPosts } from "../schema";

export const getCategoryNames = async (postId: number) => {
  return (
    await db.query.categoriesOnPosts.findMany({
      where: eq(categoriesOnPosts.postId, postId),
      with: {
        category: true,
      },
    })
  ).map(({ category }) => category.name);
};
