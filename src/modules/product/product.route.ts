/**
 * @file This file contains the route definitions for the Product module.
 * It handles product creation and retrieval.
 */

import { AppServer } from "../../server";
import { createProductSchema, getProductsSchema } from "./product.schema";

/**
 * A Fastify plugin that encapsulates all product-related routes.
 * @param server The Fastify server instance, correctly typed with our custom AppServer.
 */
const productRoutes = async (server: AppServer) => {
  /**
   * Route for creating a new product.
   * This is a protected route and requires a valid JWT for access.
   * The `onRequest` hook verifies the user's token before the handler is executed.
   */
  server.post(
    "/",
    {
      // This hook protects only this specific route
      onRequest: [
        async (request, reply) => {
          try {
            await request.jwtVerify();
          } catch (err) {
            // If jwtVerify fails, immediately send a 401 response
            reply.status(401).send({
              statusCode: 401,
              error: "Unauthorized",
              message: "Invalid or missing token",
            });
          }
        },
      ],
      schema: createProductSchema,
    },
    async (request, reply) => {
      // 1. Extract data from the request body
      const { name, price } = request.body;

      // 2. Extract the user ID from the JWT payload
      const userId = request.user.id;

      // 3. Pass the user ID to Prisma to establish the owner relationship
      const product = await server.prisma.product.create({
        data: {
          name,
          price,
          ownerId: userId, // <-- This ensures the product is linked to the user
        },
      });

      return reply.status(201).send(product);
    }
  );

  /**
   * Route for retrieving all products.
   * This is a public route and does not require authentication.
   */
  server.get(
    "/",
    {
      schema: getProductsSchema,
    },
    async (request, reply) => {
      const products = await server.prisma.product.findMany();
      return products;
    }
  );
};

export default productRoutes;
