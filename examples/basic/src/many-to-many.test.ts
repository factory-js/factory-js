import { describe, expect, it } from "vitest";
import { categoryFactory } from "../factories/category-factory";
import { postFactory } from "../factories/post-factory";
import { getCategoryNames } from "./many-to-many";

describe("#getCategoryNames", () => {
  describe("when a post has categories", () => {
    it("returns category names", async () => {
      const post = await postFactory.create();
      await categoryFactory
        .use((t) => t.withPost(post))
        .props({ name: () => "food" })
        .create();
      await expect(getCategoryNames(post.id)).resolves.toStrictEqual(["food"]);
    });
  });

  describe("when a post does not have categories", () => {
    it("returns an empty array", async () => {
      const post = await postFactory.create();
      await expect(getCategoryNames(post.id)).resolves.toStrictEqual([]);
    });
  });
});
