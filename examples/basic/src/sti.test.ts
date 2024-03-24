import { describe, expect, it } from "vitest";
import { productFactory } from "../factories/product-factory";
import { getProduct } from "./sti";

describe("#getProduct", () => {
  describe("when a product type is the book", () => {
    it("returns the book", async () => {
      const book = await productFactory.use((t) => t.book).create();
      await expect(getProduct(book.id)).resolves.toStrictEqual({
        author: book.author,
        name: book.name,
      });
    });
  });

  describe("when a product type is the clothing", () => {
    it("returns the clothing", async () => {
      const clothing = await productFactory.use((t) => t.clothing).create();
      await expect(getProduct(clothing.id)).resolves.toStrictEqual({
        name: clothing.name,
        size: clothing.size,
      });
    });
  });

  describe("when a product does not exist", () => {
    it("returns undefined", async () => {
      await expect(getProduct(0)).resolves.toBeUndefined();
    });
  });
});
