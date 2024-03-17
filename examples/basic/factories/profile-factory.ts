import { factory, later } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { profiles } from "../schema";
import { userFactory } from "./user-factory";
import { create } from "./utils/create";

export const profileFactory = factory
  .define(
    {
      props: {
        userId: later<number>(),
        bio: () => faker.string.alphanumeric(40),
      },
      vars: {
        user: () => userFactory.create(),
      },
    },
    (props) => create(profiles, props),
  )
  .props({
    userId: async ({ vars }) => (await vars.user).id,
  });
