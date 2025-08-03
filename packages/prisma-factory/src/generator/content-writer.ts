import type { DMMF } from "@prisma/generator-helper";
import { EnumWriter } from "./enum-writer";
import { FactoryWriter } from "./factory-writer";

export class ContentWriter {
  readonly #enums: DMMF.DatamodelEnum[];
  readonly #models: DMMF.Model[];
  readonly #randModule: string;
  readonly #prismaClientModule: string;

  constructor({
    enums,
    models,
    randModule,
    prismaClientModule,
  }: {
    enums: DMMF.DatamodelEnum[];
    models: DMMF.Model[];
    randModule: string;
    prismaClientModule: string;
  }) {
    this.#enums = enums;
    this.#models = models;
    this.#randModule = randModule;
    this.#prismaClientModule = prismaClientModule;
  }

  write() {
    return `
      import { factory } from "@factory-js/factory";
      import type { Prisma, PrismaClient } from "${this.#prismaClientModule}";
      import { rands } from "${this.#randModule}";
      ${this.#enums.map((enumValue) => new EnumWriter(enumValue).write()).join("\n")}
      ${this.#models.map((model) => new FactoryWriter(model).write()).join("\n")}
    `;
  }
}
