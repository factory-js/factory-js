import type { GeneratorOptions } from "@prisma/generator-helper";
import { EnumWriter } from "./enum-writer";
import { FactoryWriter } from "./factory-writer";

type Enums = GeneratorOptions["dmmf"]["datamodel"]["enums"];
type Models = GeneratorOptions["dmmf"]["datamodel"]["models"];

export class ContentWriter {
  readonly #enums: Enums;
  readonly #models: Models;
  readonly #randModule: string;
  readonly #prismaClientModule: string;

  constructor({
    enums,
    models,
    randModule,
    prismaClientModule,
  }: {
    enums: Enums;
    models: Models;
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
