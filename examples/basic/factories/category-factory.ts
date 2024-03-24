import { factory } from "@factory-js/factory";
import { faker } from "@faker-js/faker";
import type { posts } from "../schema";
import { categories } from "../schema";
import { categoriesOnPostsFactory } from "./categories-on-posts-factory";
import { create } from "./utils/create";

export const categoryFactory = factory
  .define(
    {
      props: {
        name: () => faker.string.alphanumeric(40),
      },
      vars: {},
    },
    (props) => create(categories, props),
  )
  .traits({
    withPost: (post: typeof posts.$inferSelect) => ({
      after: async (category) => {
        await categoriesOnPostsFactory
          .vars({ post: () => post, category: () => category })
          .create();
      },
    }),
  });
