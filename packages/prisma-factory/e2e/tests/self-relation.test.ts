import { describe, expect, it } from "vitest";
import { db } from "../db";
import { defineFolderFactory } from "../generated/factories";

describe("SelfRelation", () => {
  describe("when a schema has a self relation", () => {
    it("can create the model", async () => {
      const folder = await defineFolderFactory(db).create();
      await expect(
        db.folder.findUnique({ where: { id: folder.id } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a releated model is specified with vars", () => {
    it("can create the model", async () => {
      const parent = await defineFolderFactory(db).create();
      await defineFolderFactory(db)
        .vars({ parent: () => parent })
        .createList(3);
      await expect(db.folder.count({ where: { parent } })).resolves.toBe(3);
    });
  });
});
