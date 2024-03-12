import type { Promisable } from "./promisable";
import type { PromisableRecord } from "./promisable-record";
import type { UnknownRecord } from "./unknown-record";

export type Props<P extends UnknownRecord, V extends UnknownRecord> = {
  [K in keyof P]: (params: {
    props: PromisableRecord<P>;
    vars: PromisableRecord<V>;
  }) => Promisable<P[K]>;
};
