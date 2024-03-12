import prettier from "prettier";

export const format = async (value: string) => {
  return await prettier.format(value, { parser: "typescript" });
};
