import { describe, expect, it } from "vitest";
import { db } from "../db";
import { defineFolderFactory } from "../generated/factories";

describe("SelfRelation", () => {
  describe("when a factory creates a folder", () => {
    it("saves a folder", async () => {
      const folder = await defineFolderFactory(db).create();
      await expect(
        db.folder.findUnique({ where: { id: folder.id } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a factory creates a parent and children", () => {
    it("save a parent and children", async () => {
      const parent = await defineFolderFactory(db).create();
      await defineFolderFactory(db)
        .vars({ parent: () => parent })
        .createList(3);
      await expect(db.folder.count({ where: { parent } })).resolves.toBe(3);
    });
  });
});
