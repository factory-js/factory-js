import { factory, later } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { products } from "../schema";
import { create } from "./utils/create";

type Size = "small" | "medium" | "large";

export const productFactory = factory
  .define(
    {
      props: {
        name: () => faker.string.alphanumeric(40),
        type: later<"book" | "clothing">(),
        size: (): Size | null => null,
        author: (): string | null => null,
      },
      vars: {},
    },
    (props) => create(products, props),
  )
  .traits({
    book: {
      props: {
        type: () => "book",
        author: () => faker.string.alphanumeric(40),
      },
    },
    clothing: {
      props: {
        type: () => "clothing",
        size: () => faker.helpers.arrayElement(["small", "medium", "large"]),
      },
    },
  });
