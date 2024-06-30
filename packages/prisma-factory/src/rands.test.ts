import Decimal from "decimal.js";
import { expect, it, describe } from "vitest";
import { rands } from "./rands";

describe("#rands", () => {
  describe("when a byte value is generated", () => {
    it("returns a value", () => {
      expect(rands.Bytes()).toStrictEqual(expect.any(Buffer) as unknown);
    });
  });

  describe("when a boolean value is generated", () => {
    it("returns a value", () => {
      expect(rands.Boolean()).toStrictEqual(expect.any(Boolean) as unknown);
    });
  });

  describe("when a datetime value is generated", () => {
    it("returns a value", () => {
      expect(rands.DateTime()).toStrictEqual(expect.any(Date) as unknown);
    });
  });

  describe("when a decimal value is generated", () => {
    it("returns a value", () => {
      expect(rands.Decimal()).toStrictEqual(expect.any(Decimal) as unknown);
    });
  });

  describe("when a float value is generated", () => {
    it("returns a value", () => {
      expect(rands.Float()).toStrictEqual(expect.any(Number) as unknown);
    });
  });

  describe("when a string value is generated", () => {
    it("returns a value", () => {
      expect(rands.String()).toStrictEqual(expect.any(String) as unknown);
    });
  });

  describe("when an int value is generated", () => {
    it("returns a value", () => {
      expect(rands.Int() % 1).toBe(0);
    });
  });

  describe("when an json value is generated", () => {
    it("returns a value", () => {
      expect(rands.Json()).toStrictEqual({});
    });
  });

  describe("when an enum value is generated", () => {
    it("returns a value", () => {
      expect(rands.Enum(["ADMIN"])).toBe("ADMIN");
    });
  });

  describe("when an array value is generated", () => {
    it("returns an array", () => {
      expect(rands.Array("value")).toStrictEqual(["value"]);
    });
  });
});
