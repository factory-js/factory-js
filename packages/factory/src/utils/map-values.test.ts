import { describe, expect, expectTypeOf, it } from "vitest";
import { mapValues } from "./map-values";

describe("#mapValues", () => {
  describe("when a record is an object", () => {
    it("returns a mapped object", () => {
      const object = mapValues(
        { foo: 1, bar: 2 },
        (value: number, key: string) => `${key}:${value.toString()}`,
      );
      expect(object).toStrictEqual({ foo: "foo:1", bar: "bar:2" });
      expectTypeOf(object).toEqualTypeOf<Record<string, string>>();
    });
  });

  describe("when a record is empty object", () => {
    it("returns an empty object", () => {
      const object = mapValues({}, (value: string) => value);
      expect(object).toStrictEqual({});
      expectTypeOf(object).toEqualTypeOf<Record<string, string>>();
    });
  });
});
