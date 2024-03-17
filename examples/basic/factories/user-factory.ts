import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { users } from "../schema";
import { create } from "./utils/create";

export const userFactory = factory.define(
  {
    props: {
      name: () => faker.string.alphanumeric(40),
      email: () => faker.internet.exampleEmail(),
      role: () => faker.helpers.arrayElement(["guest", "admin"] as const),
    },
    vars: {},
  },
  (props) => create(users, props),
);
