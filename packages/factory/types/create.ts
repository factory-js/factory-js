import type { Promisable } from "./promisable";
import type { UnknownRecord } from "./unknown-record";

export type Create<P extends UnknownRecord, O> = (props: P) => Promisable<O>;
