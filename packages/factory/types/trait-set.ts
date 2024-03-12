import type { Trait } from "./trait";
import type { UnknownRecord } from "./unknown-record";

export type TraitSet<P extends UnknownRecord, V extends UnknownRecord> = Record<
  string,
  Trait<P, V>
>;
