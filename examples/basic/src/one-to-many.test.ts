import { describe, expect, it } from "vitest";
import { postFactory } from "../factories/post-factory";
import { userFactory } from "../factories/user-factory";
import { getPostCount } from "./one-to-many";

describe("#getPostCount", () => {
  describe("when an author has posts", () => {
    it("returns the count", async () => {
      const author = await userFactory.create();
      await postFactory.vars({ author: () => author }).createList(3);
      await expect(getPostCount(author.id)).resolves.toBe(3);
    });
  });

  describe("when an author does not have posts", () => {
    it("returns zero", async () => {
      const author = await userFactory.create();
      await expect(getPostCount(author.id)).resolves.toBe(0);
    });
  });

  describe("when an author does not exist", () => {
    it("returns zero", async () => {
      await expect(getPostCount(0)).resolves.toBe(0);
    });
  });
});
