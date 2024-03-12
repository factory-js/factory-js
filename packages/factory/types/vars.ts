import type { Deps } from "./deps";
import type { UnknownRecord } from "./unknown-record";

export type Vars<V extends UnknownRecord> = Deps<V>;
