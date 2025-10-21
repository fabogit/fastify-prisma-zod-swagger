/**
 * @file This file defines the HTTP routes for the Product module.
 * It maps endpoints, schemas, and authentication hooks to their corresponding controller handlers.
 */

import { AppServer } from "../../server";
import { createProductSchema, getProductsSchema } from "./product.schema";
import { createProductHandler, getProductsHandler } from "./product.controller";

/**
 * A Fastify plugin that encapsulates all product-related routes.
 * @param server The Fastify server instance.
 */
const productRoutes = async (server: AppServer) => {
  /**
   * Defines the `POST /` route for creating a product.
   * - `onRequest`: An authentication hook that verifies the JWT. This route is protected.
   * - `schema`: Attaches the validation and response schemas.
   * - `handler`: Delegates all logic to the `createProductHandler`.
   */
  server.post(
    "/",
    {
      onRequest: [
        async (request, reply) => {
          try {
            await request.jwtVerify();
          } catch (err) {
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
    createProductHandler
  );

  /**
   * Defines the `GET /` route for retrieving all products.
   * This route is public.
   * - `schema`: Attaches the response schema.
   * - `handler`: Delegates all logic to the `getProductsHandler`.
   */
  server.get(
    "/",
    {
      schema: getProductsSchema,
    },
    getProductsHandler
  );
};

export default productRoutes;
