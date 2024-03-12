import { describe, expect, it } from "vitest";
import { proxyDeps } from "./proxy-deps";

describe("#proxyDeps", () => {
  describe("when props depend each other", () => {
    it("returns props", async () => {
      type User = {
        firstName: string;
        lastName: string;
        fullName: string;
        bio: string;
      };
      const props = proxyDeps<User>({
        firstName: () => "John",
        lastName: () => "Doe",
        fullName: async ({ firstName, lastName }) =>
          `${await firstName} ${await lastName}`,
        bio: async ({ fullName }) => `I'm ${await fullName}.`,
      });
      expect(props.firstName).toBe("John");
      expect(props.lastName).toBe("Doe");
      await expect(props.fullName).resolves.toBe("John Doe");
      await expect(props.bio).resolves.toBe("I'm John Doe.");
    });
  });
});
