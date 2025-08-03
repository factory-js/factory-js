import { describe, expect, it } from "vitest";
import {
  defineProfileFactory,
  defineSessionFactory,
  defineUserFactory,
} from "../../generated/factories";
import { db } from "../db";

describe("OneToOne", () => {
  describe("when a schema has a one-to-one relation", () => {
    it("can create the object", async () => {
      const session = await defineSessionFactory(db).create();
      await expect(
        db.session.findUnique({ where: { id: session.id } }),
      ).resolves.not.toBeNull();
      await expect(
        db.user.findUnique({ where: { id: session.userId } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a releated object is specified with vars", () => {
    it("can create the object", async () => {
      const user = await defineUserFactory(db).create();
      const session = await defineSessionFactory(db)
        .vars({ user: () => user })
        .create();
      const savedUser = await db.session.findFirstOrThrow({
        where: { id: session.id },
      });
      expect(savedUser.userId).toBe(user.id);
    });
  });

  describe("when a releated object is specified with props", () => {
    it("can create the object", async () => {
      const user = await defineUserFactory(db).create();
      const session = await defineSessionFactory(db)
        .props({ userId: () => user.id })
        .create();
      const savedUser = await db.session.findFirstOrThrow({
        where: { id: session.id },
      });
      expect(savedUser.userId).toBe(user.id);
    });
  });

  describe("when a table has multiple foreign keys", () => {
    it("can create the object", async () => {
      const user = await defineUserFactory(db).create();
      const profile = await defineProfileFactory(db)
        .vars({ user: () => user })
        .create();
      expect(profile.firstName).toBe(user.firstName);
      expect(profile.lastName).toBe(user.lastName);
    });
  });
});
