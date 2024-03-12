export const memo = <V, A extends unknown[]>(lazy: (...args: A) => V) => {
  let evaluated = false;
  let value: V | undefined = undefined;

  return (...args: A) => {
    if (!evaluated) value = lazy(...args);
    evaluated = true;
    return value;
  };
};
