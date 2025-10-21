/**
 * @file This file defines the Zod schemas for validating user-related API requests and responses.
 * These schemas act as the single source of truth for the shape of data flowing in and out of the user routes.
 */

import { z } from "zod";
import { errorResponseSchema } from "../../utils/error.schema";

/**
 * Zod schema for the user creation (`POST /user`) route.
 * - `body`: Validates the incoming request payload for creating a new user.
 * - `response`: Defines the shape of the successful `201 Created` response.
 */
export const createUserSchema = {
  body: z.object({
    email: z.email(),
    name: z.string(),
    password: z.string().min(6),
  }),
  response: {
    201: z.object({
      id: z.number(),
      email: z.email(),
      name: z.string().nullable(),
    }),
  },
};

/**
 * Zod schema for the user login (`POST /user/login`) route.
 * - `body`: Validates the incoming request payload for user authentication.
 * - `response`: Defines the possible responses:
 * - `200 OK`: Successful login, returning a JWT.
 * - `401 Unauthorized`: Failed login. This must be defined here because we send this response manually from the route handler.
 */
export const loginSchema = {
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
  response: {
    200: z.object({
      token: z.string(),
    }),
    401: errorResponseSchema,
  },
};
