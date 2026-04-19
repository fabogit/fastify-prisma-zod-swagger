/**
 * @file This file defines the Zod schemas for validating user-related API requests and responses.
 * These schemas act as the single source of truth for the shape of data flowing in and out of the user routes.
 */

import { z } from "zod";
import { errorResponseSchema } from "../../utils/error.schema.ts";

/**
 * Core user data schema returned by the API.
 */
export const userResponseSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().nullable(),
});

/**
 * Zod schema for the user creation (`POST /user`) route.
 * - `body`: Validates the incoming request payload for creating a new user.
 * - `response`: Defines the shape of the successful `201 Created` response.
 */
export const createUserSchema = {
  tags: ["User"],
  body: z.object({
    email: z.email(),
    name: z.string().optional(),
    password: z.string().min(6),
  }),
  response: {
    201: userResponseSchema,
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
  tags: ["User"],
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

/**
 * Zod schema for getting the current user profile (`GET /user/me`).
 * This is a protected route.
 * - `security`: Indicates that this route requires JWT authentication.
 */
export const getUserMeSchema = {
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      user: userResponseSchema,
    }),
    401: errorResponseSchema,
  },
};
