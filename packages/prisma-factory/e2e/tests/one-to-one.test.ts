import { describe, expect, it } from "vitest";
import { db } from "../db";
import {
  defineProfileFactory,
  defineUserFactory,
} from "../generated/factories";

describe("OneToOne", () => {
  describe("when a factory creates a profile", () => {
    it("saves a profile and user", async () => {
      const profile = await defineProfileFactory(db).create();
      await expect(
        db.profile.findUnique({ where: { id: profile.id } }),
      ).resolves.not.toBeNull();
      await expect(
        db.user.findUnique({ where: { id: profile.userId } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a user is specified", () => {
    it("saves the user", async () => {
      const user = await defineUserFactory(db).create();
      const profile = await defineProfileFactory(db)
        .vars({ user: () => user })
        .create();
      const savedUser = await db.profile.findFirstOrThrow({
        where: { id: profile.id },
      });
      expect(savedUser.userId).toBe(user.id);
    });
  });

  describe("when a user is specified with the userId", () => {
    it("saves the user", async () => {
      const user = await defineUserFactory(db).create();
      const profile = await defineProfileFactory(db)
        .props({ userId: () => user.id })
        .create();
      const savedUser = await db.profile.findFirstOrThrow({
        where: { id: profile.id },
      });
      expect(savedUser.userId).toBe(user.id);
    });
  });
});
