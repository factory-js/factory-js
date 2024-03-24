import { factory, later } from "@factory-js/factory";
import { categoriesOnPosts } from "../schema";
import { categoryFactory } from "./category-factory";
import { postFactory } from "./post-factory";
import { create } from "./utils/create";

export const categoriesOnPostsFactory = factory
  .define(
    {
      props: {
        postId: later<number>(),
        categoryId: later<number>(),
      },
      vars: {
        post: () => postFactory.create(),
        category: () => categoryFactory.create(),
      },
    },
    (props) => create(categoriesOnPosts, props),
  )
  .props({
    postId: async ({ vars }) => (await vars.post).id,
    categoryId: async ({ vars }) => (await vars.category).id,
  });
