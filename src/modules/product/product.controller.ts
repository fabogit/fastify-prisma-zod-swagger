/**
 * @file This file contains the controller functions for the Product module.
 * It orchestrates the flow between HTTP requests and the product service layer.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createProductSchema } from "./product.schema";
import { createProduct, getProducts } from "./product.service";

// Infer the input type from the Zod schema for type safety
type CreateProductInput = z.infer<typeof createProductSchema.body>;

/**
 * Handles the request to create a new product.
 * It extracts data from the request, calls the service to create the product,
 * and sends a 201 response with the newly created product.
 * @param request The Fastify request object, containing the product data in its body.
 * @param reply The Fastify reply object.
 */
export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) {
  // Extract the user ID from the authenticated user's token
  const ownerId = request.user.id;

  // Call the service to perform the business logic
  const product = await createProduct(request.body, ownerId);

  // Send the newly created product with a 201 status code
  return reply.status(201).send(product);
}

/**
 * Handles the request to retrieve all products.
 * It calls the service to fetch the products and sends a 200 response.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getProductsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Call the service to get all products
  const products = await getProducts();

  // Send the list of products with a 200 status code
  return reply.status(200).send(products);
}
