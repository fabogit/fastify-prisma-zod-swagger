/**
 * @file This file contains the controller functions for the User module.
 * It handles the HTTP request/response layer and calls the appropriate service functions.
 */

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createUserSchema, loginSchema } from "./user.schema";
import { createUser, findUserByEmailAndPassword } from "./user.service";

// Infer types from Zod schemas for request body validation
type CreateUserInput = z.infer<typeof createUserSchema.body>;
type LoginInput = z.infer<typeof loginSchema.body>;

/**
 * Handles the user registration request.
 * It calls the createUser service and sends a 201 response with the new user's data.
 * @param request The Fastify request object, typed with the user creation schema.
 * @param reply The Fastify reply object.
 */
export async function registerUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  // The request body is already validated by the route's schema
  const user = await createUser(request.body);

  // Send the newly created user with a 201 status code
  return reply.status(201).send(user);
}

/**
 * Handles the user login request.
 * It calls the findUserByEmailAndPassword service, generates a JWT on success,
 * and sends a 401 response on failure.
 * @param request The Fastify request object, typed with the login schema.
 * @param reply The Fastify reply object.
 */
export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const user = await findUserByEmailAndPassword(request.body);

  // If the service returns null, authentication failed
  if (!user) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Invalid email or password",
    });
  }

  // If authentication is successful, generate a JWT
  // We access the server instance via `reply.server` to use the jwt plugin
  const token = reply.server.jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  return { token };
}
