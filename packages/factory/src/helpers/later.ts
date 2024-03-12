import type { Promisable } from "../../types/promisable";

export const later = <T>(): (() => Promisable<T>) => {
  return () => {
    throw new Error(
      "The 'later' function was called. Did you forget to override it?",
    );
  };
};
