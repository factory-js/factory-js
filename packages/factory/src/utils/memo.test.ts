import { describe, expect, it } from "vitest";
import { memo } from "./memo";

describe("#memo", () => {
  describe("when a function is wrapped with the memo", () => {
    it("returns the same value", () => {
      let count = 0;
      const value = memo(() => count++);
      expect(value()).toBe(0);
      expect(value()).toBe(0);
      expect(value()).toBe(0);
    });
  });

  describe("when a function is a promise", () => {
    it("supports the promise function", async () => {
      let count = 0;
      const value = memo(() => Promise.resolve(count++));
      await expect(value()).resolves.toBe(0);
      await expect(value()).resolves.toBe(0);
      await expect(value()).resolves.toBe(0);
    });
  });
});
