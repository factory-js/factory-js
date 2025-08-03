import { describe, expect, it } from "vitest";
import {
  defineCategoriesOnPostsFactory,
  definePostFactory,
} from "../../generated/factories";
import { db } from "../db";

describe("ManyToMany", () => {
  describe("when a schema has a many-to-many relation", () => {
    it("can create the object", async () => {
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
