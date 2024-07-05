import type { Promisable } from "./promisable";
import type { PromisableRecord } from "./promisable-record";
import type { UnknownRecord } from "./unknown-record";

export type After<O, V extends UnknownRecord> = (
  object: O,
  vars: PromisableRecord<V>,
) => Promisable<void>;
