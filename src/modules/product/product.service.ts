/**
 * @file This file contains the business logic for the Product module.
 * It handles all database interactions related to products.
 */

import { z } from "zod";
import prisma from "../../utils/prisma";
import { createProductSchema } from "./product.schema";

// Infer the input type from the Zod schema to keep a single source of truth
type CreateProductInput = z.infer<typeof createProductSchema.body>;

/**
 * Creates a new product in the database.
 * @param data - The product's data (name, price).
 * @param ownerId - The ID of the user creating the product.
 * @returns The newly created product object.
 */
async function createProduct(data: CreateProductInput, ownerId: number) {
  const product = await prisma.product.create({
    data: {
      ...data,
      ownerId,
    },
  });
  return product;
}

/**
 * Retrieves all products from the database.
 * @returns An array of all product objects.
 */
async function getProducts() {
  const products = await prisma.product.findMany();
  return products;
}

// Export the service functions
export { createProduct, getProducts };
