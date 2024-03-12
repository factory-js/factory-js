import { getDMMF } from "@prisma/internals";
import { expect, it, describe } from "vitest";
import { format } from "../../vitest/utils/format";
import { removeIndents } from "../../vitest/utils/remove-indents";
import { ContentWriter } from "./content-writer";

describe("ContentWriter", () => {
  describe("when it is called", () => {
    it("writes imports and factories", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model User {
          id   Int    @id
          name String
        }
      `,
      });
      const { enums, models } = dmmf.datamodel;
      const value = removeIndents(
        await format(
          new ContentWriter({ enums, models, randModule: "rands" }).write(),
        ),
      );
      expect(value).toMatch(
        removeIndents(`
          import { factory } from "@factory-js/factory";
          import type { Prisma, PrismaClient } from "@prisma/client";
          import { rands } from "rands";
        `),
      );
      expect(value).toMatch(
        removeIndents("export function defineUserFactory(db: PrismaClient) {"),
      );
    });
  });
});
