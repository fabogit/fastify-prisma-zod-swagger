/**
 * @file This file defines the Zod schemas for validating product-related API requests and responses.
 */

import { z } from "zod";
import { errorResponseSchema } from "../../utils/error.schema";

/**
 * Zod schema for the product creation (`POST /product`) route.
 * - `body`: Validates the incoming request payload for creating a new product.
 * - `response`: Defines the possible responses:
 * - `201 Created`: Successful creation, returning the new product's data.
 * - `401 Unauthorized`: Required because this is a protected route.
 */
export const createProductSchema = {
  body: z.object({
    name: z.string(),
    price: z.number(),
    // Content is optional in the body, aligning with the prisma schema
    content: z.string().optional(),
  }),
  response: {
    201: z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      content: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
    // We must define the 401 response because the route is protected
    // and the onRequest hook sends this response manually.
    401: errorResponseSchema,
  },
};

/**
 * Zod schema for the get all products (`GET /product`) route.
 * - `response`: Defines the shape of the successful `200 OK` response, which is an array of products.
 */
export const getProductsSchema = {
  response: {
    200: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
        content: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    ),
  },
};
