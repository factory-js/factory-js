import type { Promisable } from "./promisable";

export type After<O> = (object: O) => Promisable<void>;
