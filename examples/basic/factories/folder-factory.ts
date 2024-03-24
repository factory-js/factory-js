import { factory, later } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { folders } from "../schema";
import { create } from "./utils/create";

type Folder = (typeof folders)["$inferSelect"];

export const folderFactory = factory
  .define(
    {
      props: {
        name: () => faker.string.alphanumeric(40),
        parentId: later<number | null>(),
      },
      vars: {
        parent: (): Folder | undefined => undefined,
      },
    },
    (props) => create(folders, props),
  )
  .props({
    parentId: async ({ vars }) => (await vars.parent)?.id ?? null,
  });
