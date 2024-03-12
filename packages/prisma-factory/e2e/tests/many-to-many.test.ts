import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  defineCategoriesOnPostsFactory,
  definePostFactory,
} from "../generated/factories";

describe("ManyToMany", () => {
  describe("when a factory creates post's categories", () => {
    it("saves categories", async () => {
      const post = await definePostFactory(db).create();
      await defineCategoriesOnPostsFactory(db)
        .props({ postId: () => post.id })
        .createList(2);
      await expect(
        db.categoriesOnPosts.count({ where: { post } }),
      ).resolves.toBe(2);
    });
  });
});
