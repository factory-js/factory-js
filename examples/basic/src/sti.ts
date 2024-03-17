import { eq } from "drizzle-orm";
import { db } from "../db";
import { products } from "../schema";

export const getProduct = async (productId: number) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  switch (product?.type) {
    case "book":
      return {
        name: product.name,
        author: product.author,
      };
    case "clothing":
      return {
        name: product.name,
        size: product.size,
      };
    default:
      return undefined;
  }
};
