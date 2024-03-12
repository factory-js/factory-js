import type { DMMF } from "@prisma/generator-helper";

export class EnumWriter {
  readonly #enumValue: DMMF.DatamodelEnum;

  constructor(enumValue: DMMF.DatamodelEnum) {
    this.#enumValue = enumValue;
  }

  write() {
    return `const ${this.#enumValue.name} = [
      ${this.#enumValue.values.map((value) => `'${value.name}'`).join(",")}
    ] as const`;
  }
}
