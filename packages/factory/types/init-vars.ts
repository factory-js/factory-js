import type { Promisable } from "./promisable";
import type { UnknownRecord } from "./unknown-record";

export type InitVars<V extends UnknownRecord> = {
  [K in keyof V]: () => Promisable<V[K]>;
};
