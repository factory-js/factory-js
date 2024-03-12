import type { Promisable } from "./promisable";
import type { UnknownRecord } from "./unknown-record";

export type PromisableRecord<P extends UnknownRecord> = {
  [K in keyof P]: Promisable<P[K]>;
};
