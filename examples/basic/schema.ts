import { relations } from "drizzle-orm";
import {
  integer,
  text,
  sqliteTable,
  primaryKey,
  foreignKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().notNull().unique(),
  role: text("role", { enum: ["guest", "admin"] }).notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts, { relationName: "author" }),
}));

export const profiles = sqliteTable("profiles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio").notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  authorId: integer("author_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  categoriesOnPosts: many(categories),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
    relationName: "author",
  }),
}));

export const categories = sqliteTable("categories", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const categoriesRelations = relations(posts, ({ many }) => ({
  categoriesOnPosts: many(posts),
}));

export const categoriesOnPosts = sqliteTable(
  "categories_on_posts",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  }),
);

export const categoriesOnPostsRelations = relations(
  categoriesOnPosts,
  ({ one }) => ({
    post: one(posts, {
      fields: [categoriesOnPosts.postId],
      references: [posts.id],
    }),
    category: one(categories, {
      fields: [categoriesOnPosts.categoryId],
      references: [categories.id],
    }),
  }),
);

export const folders = sqliteTable(
  "folders",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    parentId: integer("parent_id", { mode: "number" }),
    name: text("name").notNull().unique(),
  },
  (table) => {
    return {
      parentReference: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
      }).onDelete("cascade"),
    };
  },
);

export const foldersRelations = relations(folders, ({ one }) => ({
  invitee: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
}));

export const products = sqliteTable("products", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["book", "clothing"] }).notNull(),
  size: text("size", { enum: ["small", "medium", "large"] }),
  author: text("author"),
  name: text("name").notNull().unique(),
});
