import { describe, expect, it } from "vitest";
import { profileFactory } from "../factories/profile-factory";
import { userFactory } from "../factories/user-factory";
import { getProfile } from "./one-to-one";

describe("#getProfile", () => {
  describe("when a user exists", () => {
    it("returns the user profile", async () => {
      const user = await userFactory.create();
      const profile = await profileFactory.vars({ user: () => user }).create();
      await expect(getProfile(user.id)).resolves.toStrictEqual({
        name: user.name,
        bio: profile.bio,
      });
    });
  });

  describe("when a user does not exist", () => {
    it("returns undefined", async () => {
      await expect(getProfile(0)).resolves.toBeUndefined();
    });
  });
});
