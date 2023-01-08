import { FastifyReply, FastifyRequest } from "fastify";

import { createProduct, getProducts } from "./product.service";
import { CreateProductInput } from "./product.schema";

export async function createProductHandler(
  request: FastifyRequest<{
    Body: CreateProductInput;
  }>
) {
  const product = await createProduct({
    ...request.body,
		// fix typing fastify/jwt
    ownerId: request.user.id,
  });
}

export async function getProductsHandler() {
  const products = await getProducts();
  return products;
}
