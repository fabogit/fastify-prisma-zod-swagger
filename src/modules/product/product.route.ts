import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import { $ref } from "./product.schema";

async function productRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("createProductSchema"),
        response: {
          201: $ref("productReplySchema"),
        },
      },
    },
    createProductHandler
  );

  server.get(
    "/",
    {
      schema: {
        response: {
          200: $ref("productsReplySchema"),
        },
      },
    },
    getProductsHandler
  );
}

export default productRoutes;
