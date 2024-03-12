export const removeIndents = (value: string) => {
  return value.replaceAll(/^ +/gm, "").replaceAll("\n", "");
};
