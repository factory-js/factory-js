import { getDMMF } from "@prisma/internals";
import { expect, it, describe } from "vitest";
import { format } from "../../vitest/utils/format";
import { removeIndents } from "../../vitest/utils/remove-indents";
import { FactoryWriter } from "./factory-writer";

describe("FactoryWriter", () => {
  describe("when a model has no relations", () => {
    it("writes props and empty vars", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model User {
          id   Int    @id
          name String
        }
      `,
      });
      const model = dmmf.datamodel.models[0] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents(`
          props: {
            id: () => rands.Int(),
            name: () => rands.String(),
          }
        `),
      );
      expect(value).toMatch("vars: {}");
    });
  });

  describe("when a model has an enum", () => {
    it("writes an enum prop", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        enum Role {
          USER
          ADMIN
        }
        model User {
          id   Int  @id
          role Role
        }
      `,
      });
      const model = dmmf.datamodel.models[0] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents(`
          props: {
            id: () => rands.Int(),
            role: () => rands.Enum(Role),
          }
        `),
      );
    });
  });

  describe("when a model has a relation", () => {
    it("writes vars, types and the id prop", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model User {
          id      Int      @id
          profile Profile?
        }
        model Profile {
          id     Int  @id
          userId Int  @unique
          user   User @relation(fields: [userId], references: [id])
        }
      `,
      });
      const model = dmmf.datamodel.models[1] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents(`
          vars: {
            user: async () => await defineUserFactory(db).create(),
          }
        `),
      );
      expect(value).toMatch(
        removeIndents(
          '{ user: Prisma.Result<typeof db.user, unknown, "create"> }',
        ),
      );
      expect(value).toMatch(
        removeIndents(
          ".props({ userId: async ({ vars }) => (await vars.user).id })",
        ),
      );
    });
  });

  describe("when a model has a self relation", () => {
    it("writes vars that is null", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model Folder {
          id       Int      @id
          parentId Int?
          parent   Folder?  @relation("Folder", fields: [parentId], references: [id])
          children Folder[] @relation("Folder")
        }
      `,
      });
      const model = dmmf.datamodel.models[0] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents(`
          vars: {
            parent: () => null,
          }
        `),
      );
    });
  });

  describe("when a relation is optional", () => {
    it("writes types and the id prop as optional", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model User {
          id      Int      @id
          profile Profile?
        }
        model Profile {
          id     Int   @id
          userId Int   @unique
          user   User? @relation(fields: [userId], references: [id])
        }
      `,
      });
      const model = dmmf.datamodel.models[1] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents(
          '{ user: Prisma.Result<typeof db.user, unknown, "create"> | null }',
        ),
      );
      expect(value).toMatch(
        removeIndents(
          ".props({ userId: async ({ vars }) => (await vars.user)?.id })",
        ),
      );
    });
  });

  describe("when a model name is in snake case", () => {
    it("converts the name to camel case", async () => {
      const dmmf = await getDMMF({
        datamodel: `
        model user_event_log {
          id Int @id
        }
      `,
      });
      const model = dmmf.datamodel.models[0] ?? (undefined as never);
      const value = removeIndents(
        await format(new FactoryWriter(model).write()),
      );
      expect(value).toMatch(
        removeIndents("function defineUserEventLogFactory"),
      );
    });
  });
});
