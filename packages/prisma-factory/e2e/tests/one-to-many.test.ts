import { describe, expect, it } from "vitest";
import { db } from "../db";
import { definePostFactory, defineUserFactory } from "../generated/factories";

describe("OneToMany", () => {
  describe("when a factory creates author's posts", () => {
    it("saves posts", async () => {
      const author = await defineUserFactory(db).create();
      await definePostFactory(db)
        .vars({ author: () => author })
        .createList(2);
      await expect(db.post.count({ where: { author } })).resolves.toBe(2);
    });
  });
});
