import type { Promisable } from "./promisable";
import type { UnknownRecord } from "./unknown-record";

export type InitProps<P extends UnknownRecord> = {
  [K in keyof P]: () => Promisable<P[K]>;
};
