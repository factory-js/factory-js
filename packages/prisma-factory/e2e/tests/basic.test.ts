import type { Prisma } from "@prisma/client";
import Decimal from "decimal.js";
import { describe, expect, expectTypeOf, it } from "vitest";
import { db } from "../db";
import {
  defineAllTypesFactory,
  defineUserEventLogFactory,
  defineUserFactory,
} from "../generated/factories";

describe("Basic", () => {
  describe("when a factory builds a user", () => {
    it("returns a user", async () => {
      const user = await defineUserFactory(db).build();
      expect(user).toStrictEqual({
        id: expect.any(Number) as unknown,
        name: expect.any(String) as unknown,
        role: expect.any(String) as unknown,
      });
      expectTypeOf(user).toEqualTypeOf<Prisma.UserUncheckedCreateInput>();
    });
  });

  describe("when a value is specified", () => {
    it("uses the value", async () => {
      const user = await defineUserFactory(db)
        .props({ role: () => "ADMIN" })
        .build();
      expect(user.role).toBe("ADMIN");
    });
  });

  describe("when a factory creates a user", () => {
    it("saves a user", async () => {
      const user = await defineUserFactory(db).create();
      await expect(
        db.user.findUnique({ where: { id: user.id } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a factory name is in snake case", () => {
    it("converts the name to camel case", async () => {
      const userEventLog = await defineUserEventLogFactory(db).create();
      await expect(
        db.user_event_log.findUnique({ where: { id: userEventLog.id } }),
      ).resolves.not.toBeNull();
    });
  });

  describe("when a factory has all type values", () => {
    it("can build all values", async () => {
      const model = await defineAllTypesFactory(db).build();
      expect(model).toStrictEqual({
        bigInt: expect.any(BigInt) as unknown,
        bytes: expect.any(Buffer) as unknown,
        boolean: expect.any(Boolean) as unknown,
        dateTime: expect.any(Date) as unknown,
        decimal: expect.any(Decimal) as unknown,
        float: expect.any(Number) as unknown,
        string: expect.any(String) as unknown,
        int: expect.any(Number) as unknown,
        json: expect.any(Object) as unknown,
        enum: expect.any(String) as unknown,
        array: expect.any(Array) as unknown,
      });
      expectTypeOf(model).toEqualTypeOf<Prisma.AllTypesUncheckedCreateInput>();
    });
  });
});
