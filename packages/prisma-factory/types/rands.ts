import type Decimal from "decimal.js";

export type Rands = {
  BigInt: () => bigint;
  Bytes: () => Buffer;
  Boolean: () => boolean;
  DateTime: () => Date;
  Decimal: () => Decimal;
  Float: () => number;
  String: () => string;
  Int: () => number;
  Json: () => Record<string, unknown>;
  Enum: <T>(values: readonly [T, ...T[]]) => T;
  Array: <T>(value: T) => T[];
};
