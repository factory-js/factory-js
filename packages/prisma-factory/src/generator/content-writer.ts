import type { DMMF, ReadonlyDeep } from "@prisma/generator-helper";
import { EnumWriter } from "./enum-writer";
import { FactoryWriter } from "./factory-writer";

export class ContentWriter {
  readonly #enums: ReadonlyDeep<DMMF.DatamodelEnum[]>;
  readonly #models: ReadonlyDeep<DMMF.Model[]>;
  readonly #randModule: string;
  readonly #prismaClientModule: string;

  constructor({
    enums,
    models,
    randModule,
    prismaClientModule,
  }: {
    enums: ReadonlyDeep<DMMF.DatamodelEnum[]>;
    models: ReadonlyDeep<DMMF.Model[]>;
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
