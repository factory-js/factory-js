import type { Deps } from "../../types/deps";
import type { PromisableRecord } from "../../types/promisable-record";
import type { UnknownRecord } from "../../types/unknown-record";
import { mapValues } from "./map-values";
import { memo } from "./memo";

export const proxyDeps = <T extends UnknownRecord>(deps: Deps<T>) => {
  const memos = mapValues(deps, (value) => memo(value)) as Deps<T>;
  const proxy = new Proxy(memos, {
    get: (target, key) => target[key]?.(proxy),
  }) as PromisableRecord<T>;
  return proxy;
};
