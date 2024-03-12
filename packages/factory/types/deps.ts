import type { Promisable } from "./promisable";
import type { PromisableRecord } from "./promisable-record";
import type { UnknownRecord } from "./unknown-record";

export type Deps<T extends UnknownRecord> = {
  [K in keyof T]: (deps: PromisableRecord<T>) => Promisable<T[K]>;
};
