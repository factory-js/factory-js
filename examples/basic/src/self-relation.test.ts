import { describe, expect, it } from "vitest";
import { folderFactory } from "../factories/folder-factory";
import { getChildFolders } from "./self-relation";

describe("#getChildFolders", () => {
  describe("when a folder has children", () => {
    it("returns the folder tree", async () => {
      const parent = await folderFactory.create();
      const children = await folderFactory
        .vars({ parent: () => parent })
        .createList(2);
      await expect(getChildFolders(parent.id)).resolves.toStrictEqual([
        { name: children[0]?.name, children: [] },
        { name: children[1]?.name, children: [] },
      ]);
    });
  });

  describe("when a folder has a grandchild", () => {
    it("returns the folder tree", async () => {
      const parent = await folderFactory.create();
      const child = await folderFactory.vars({ parent: () => parent }).create();
      const grandchild = await folderFactory
        .vars({ parent: () => child })
        .create();
      await expect(getChildFolders(parent.id)).resolves.toStrictEqual([
        {
          name: child.name,
          children: [
            {
              name: grandchild.name,
              children: [],
            },
          ],
        },
      ]);
    });
  });

  describe("when a folder does not have children", () => {
    it("returns an empty array", async () => {
      const parent = await folderFactory.create();
      await expect(getChildFolders(parent.id)).resolves.toStrictEqual([]);
    });
  });
});
