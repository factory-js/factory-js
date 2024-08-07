import { expect, it, describe } from "vitest";
import { seq } from "..";

describe("#seq", () => {
  describe("when an iteratee is called multiple times", () => {
    it("increments a count and returns a value", async () => {
      const count = seq(1, (count) =>
        Promise.resolve(`count: ${count.toString()}`),
      );
      await expect(count()).resolves.toBe("count: 1");
      await expect(count()).resolves.toBe("count: 2");
      await expect(count()).resolves.toBe("count: 3");
    });
  });

  describe("when it is used multiple times", () => {
    it("has an independent count", () => {
      const count1 = seq(1, (count) => `count1: ${count.toString()}`);
      const count2 = seq(1, (count) => `count2: ${count.toString()}`);
      expect(count1()).toBe("count1: 1");
      expect(count2()).toBe("count2: 1");
    });
  });

  describe("when an iteratee has an additional argument", () => {
    it("accepts the argument", async () => {
      const count = seq(1, (count, label: string) =>
        Promise.resolve(`${label}: ${count.toString()}`),
      );
      await expect(count("label")).resolves.toBe("label: 1");
    });
  });
});
