import type { Props } from "./props";
import type { UnknownRecord } from "./unknown-record";
import type { Vars } from "./vars";

export type Trait<P extends UnknownRecord, V extends UnknownRecord> = Partial<{
  props: Partial<Props<P, V>>;
  vars: Partial<Vars<V>>;
}>;
