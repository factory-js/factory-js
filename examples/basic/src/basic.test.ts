import { describe, expect, it } from "vitest";
import { userFactory } from "../factories/user-factory";
import { isAdmin } from "./basic";

describe("#isAdmin", () => {
  describe("when a user is guest", () => {
    it("returns false", async () => {
      const user = await userFactory.props({ role: () => "guest" }).create();
      await expect(isAdmin(user.id)).resolves.toBe(false);
    });
  });

  describe("when a user is admin", () => {
    it("returns true", async () => {
      const user = await userFactory.props({ role: () => "admin" }).create();
      await expect(isAdmin(user.id)).resolves.toBe(true);
    });
  });
});
