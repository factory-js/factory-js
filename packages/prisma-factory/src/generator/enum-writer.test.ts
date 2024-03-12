import { getDMMF } from "@prisma/internals";
import { expect, it, describe } from "vitest";
import { format } from "../../vitest/utils/format";
import { removeIndents } from "../../vitest/utils/remove-indents";
import { EnumWriter } from "./enum-writer";

describe("EnumWriter", () => {
  describe("when a schema has an enum", () => {
    it("writes an enum", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        enum Role {
          USER
          ADMIN
        }
      `,
      });
      const enumValue = dmmf.datamodel.enums[0] ?? (undefined as never);
      expect(
        removeIndents(await format(new EnumWriter(enumValue).write())),
      ).toMatch(removeIndents('const Role = ["USER", "ADMIN"] as const'));
    });
  });
});
