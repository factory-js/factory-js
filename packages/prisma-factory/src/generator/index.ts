import fs from "fs";
import path from "path";
import type { GeneratorOptions } from "@prisma/generator-helper";
import { generatorHandler } from "@prisma/generator-helper";
import prettier from "prettier";
import { ContentWriter } from "./content-writer.js";

const DEFAULT_OUTPUT_DIR = "./generated";
const DEFAULT_RAND_MODULE = "@factory-js/prisma-factory";
const DEFAULT_PRISMA_CLIENT_MODULE = "@prisma/client";

const writeFileSafely = async (filePath: string, value: string) => {
  const formatted = await prettier.format(value, { parser: "typescript" });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, formatted);
};

const getRandModule = (randsPath: string | string[] | undefined) => {
  return typeof randsPath === "string" ? randsPath : DEFAULT_RAND_MODULE;
};

const getPrismaClientModule = (
  prismaClientPath: string | string[] | undefined,
) => {
  return typeof prismaClientPath === "string"
    ? prismaClientPath
    : DEFAULT_PRISMA_CLIENT_MODULE;
};

generatorHandler({
  onManifest() {
    return {
      defaultOutput: DEFAULT_OUTPUT_DIR,
      prettyName: "Prisma Factory",
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const { models, enums } = options.dmmf.datamodel;
    const { config, output } = options.generator;
    const randModule = getRandModule(config["randModule"]);
    const prismaClientModule = getPrismaClientModule(
      config["prismaClientModule"],
    );

    await writeFileSafely(
      path.join(output?.value ?? DEFAULT_OUTPUT_DIR, "factories.ts"),
      new ContentWriter({
        enums,
        models,
        randModule,
        prismaClientModule,
      }).write(),
    );
  },
});
