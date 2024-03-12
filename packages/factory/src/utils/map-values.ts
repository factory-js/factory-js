import type { UnknownRecord } from "../../types/unknown-record";

type Iteratee<T extends UnknownRecord, R> = (
  value: T[keyof T],
  key: keyof T,
) => R;

export const mapValues = <T extends UnknownRecord, R>(
  record: T,
  iteratee: Iteratee<T, R>,
) => {
  const entries = Object.entries(record).map(([key, value]) => {
    const newValue = iteratee(value as T[keyof T], key as keyof T);
    return [key, newValue];
  }) as [[keyof T, R]];
  return Object.fromEntries(entries);
};
