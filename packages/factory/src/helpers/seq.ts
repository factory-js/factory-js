import type { Promisable } from "../../types/promisable";

type Iteratee<A extends unknown[], O> = (
  count: number,
  ...args: A
) => Promisable<O>;

export const seq = <A extends unknown[], O>(
  initialCount: number,
  iteratee: Iteratee<A, O>,
) => {
  let count = initialCount;
  return (...args: A) => iteratee(count++, ...args);
};
