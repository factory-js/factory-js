import type { Promisable } from "../../types/promisable";
import type { UnknownRecord } from "../../types/unknown-record";

type Iteratee<T extends UnknownRecord, R> = (
  value: T[keyof T],
  key: keyof T,
) => Promisable<R>;

export const mapValuesAsync = async <T extends UnknownRecord, R>(
  record: T,
  iteratee: Iteratee<T, R>,
) => {
  const promises = Object.entries(record).map(async ([key, value]) => {
    const newValue = await iteratee(value as T[keyof T], key as keyof T);
    return [key, newValue];
  });
  return Object.fromEntries((await Promise.all(promises)) as [[keyof T, R]]);
};
