import { factory, later } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import { posts } from "../schema";
import { userFactory } from "./user-factory";
import { create } from "./utils/create";

export const postFactory = factory
  .define(
    {
      props: {
        authorId: later<number>(),
        description: () => faker.string.alphanumeric(40),
      },
      vars: {
        author: () => userFactory.create(),
      },
    },
    (props) => create(posts, props),
  )
  .props({
    authorId: async ({ vars }) => (await vars.author).id,
  });
