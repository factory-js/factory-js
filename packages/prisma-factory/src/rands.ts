import {
  rand,
  randBoolean,
  randFloat,
  randNumber,
  randPastDate,
  randTextRange,
} from "@ngneat/falso";
import { Decimal } from "decimal.js";
import type { Rands } from "../types/rands";

export const rands = {
  BigInt: () => BigInt(randNumber({ min: 1, max: 2000000000 })),
  Bytes: () => Buffer.from([randNumber({ min: 0, max: 255 })]),
  Boolean: () => randBoolean(),
  DateTime: () => randPastDate(),
  Decimal: () => new Decimal(randNumber({ min: 1, max: 2000000000 })),
  Float: () => randFloat(),
  String: () => randTextRange({ min: 1, max: 200 }),
  Int: () => randNumber({ min: 1, max: 2000000000 }),
  Json: () => ({}),
  Enum: (values) => rand(values),
  Array: (value) => [value],
} satisfies Rands;
