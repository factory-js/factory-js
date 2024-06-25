import { describe, expect, expectTypeOf, it } from "vitest";
import { mapValuesAsync } from "./map-values-async";

describe("#mapValuesAsync", () => {
  describe("when a record is an object", () => {
    it("returns a mapped object", async () => {
      const object = await mapValuesAsync(
        { foo: 1, bar: 2 },
        (value: number, key: string) =>
          Promise.resolve(`${key}:${value.toString()}`),
      );
      expect(object).toStrictEqual({ foo: "foo:1", bar: "bar:2" });
      expectTypeOf(object).toEqualTypeOf<Record<string, string>>();
    });
  });

  describe("when a record is empty object", () => {
    it("returns an empty object", async () => {
      const object = await mapValuesAsync({}, (value: string) => value);
      expect(object).toStrictEqual({});
      expectTypeOf(object).toEqualTypeOf<Record<string, string>>();
    });
  });
});
