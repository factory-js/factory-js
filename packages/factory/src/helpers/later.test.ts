import { expect, it, describe } from "vitest";
import { later } from "..";

describe("#later", () => {
  describe("when it is called", () => {
    it("throws an error", () => {
      const value = later<number>();
      expect(() => value()).toThrow(
        "The 'later' function was called. Did you forget to override it?",
      );
    });
  });
});
