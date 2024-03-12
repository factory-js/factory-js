import type { DMMF } from "@prisma/generator-helper";
import type { FieldType } from "../../types/field-type";

export class FactoryWriter {
  readonly #modelName: string;
  readonly #scalarFields: DMMF.Model["fields"];
  readonly #relationFields: DMMF.Model["fields"];

  constructor(model: DMMF.Model) {
    this.#scalarFields = model.fields.filter(
      ({ relationName }) => relationName === undefined,
    );
    this.#relationFields = model.fields.filter(
      ({ relationName, relationFromFields }) =>
        relationName !== undefined &&
        relationFromFields !== undefined &&
        relationFromFields.length > 0,
    );
    this.#modelName = model.name;
  }

  write() {
    return `
      export function ${this.#writeFunctionName(this.#modelName)}(db: PrismaClient) {
        return factory.define<
          Prisma.${this.#modelName}UncheckedCreateInput,
          ${this.#writeCreatedType(this.#modelName)},
          ${this.#writeRelationTypes()}
        >(
          {
            props: {
              ${this.#scalarFields
                .map((field) => this.#writeProp(field))
                .join(",")}
            },
            vars: {
              ${this.#relationFields
                .map((field) => this.#writeRef(field))
                .join(",")}
            }
          },
          async (props) => await db.${this.#toLowerFirst(this.#modelName)}.create({ data: props })
        ).props({ ${this.#relationFields
          .map((field) => this.#writeRelationProps(field))
          .join(",")} })
      }
    `;
  }

  #writeRelationTypes() {
    if (this.#relationFields.length === 0) return "";
    return `{${this.#relationFields
      .map((field) => {
        const type = this.#writeCreatedType(field.type);
        return `${field.name}: ${type} ${field.isRequired ? "" : " | null"}`;
      })
      .join(",")}}`;
  }

  #writeRelationProps(field: DMMF.Model["fields"][number]) {
    return (field.relationFromFields ?? [])
      .map((fieldName, index) => {
        const relationToField = field.relationToFields?.[index];
        return `${fieldName}: async ({ vars }) => (await vars.${field.name})${field.isRequired ? "" : "?"}.${relationToField}`;
      })
      .join(",");
  }

  #writeCreatedType(modelName: string) {
    return `Prisma.Result<typeof db.${this.#toLowerFirst(modelName)}, unknown, 'create'>`;
  }

  #writeFunctionName(modelName: string) {
    return `define${this.#toCamelCase(modelName)}Factory`;
  }

  #writeProp(field: DMMF.Model["fields"][number]): string {
    const fieldType = field.type as FieldType;
    const value = `rands.${field.kind === "enum" ? `Enum(${fieldType})` : `${fieldType}()`}`;
    return `${field.name}: () => ${field.isList ? `rands.Array(${value})` : value}`;
  }

  #writeRef(field: DMMF.Model["fields"][number]): string {
    const isSelfRelation = field.type === this.#modelName;
    return `${field.name}: ${isSelfRelation ? "() => null" : `async () => await ${this.#writeFunctionName(field.type)}(db).create()`}`;
  }

  #toCamelCase(value: string) {
    return value
      .split("_")
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join("");
  }

  #toLowerFirst(value: string) {
    return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
  }
}
