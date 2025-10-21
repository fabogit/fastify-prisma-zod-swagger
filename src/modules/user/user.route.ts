/**
 * @file This file contains the route definitions for the User module.
 * It handles user registration and authentication.
 */

import bcrypt from "bcrypt";
import { createUserSchema, loginSchema } from "./user.schema";
import { AppServer } from "../../server";

/**
 * A Fastify plugin that encapsulates all user-related routes.
 * @param server The Fastify server instance, correctly typed with our custom AppServer.
 */
const userRoutes = async (server: AppServer) => {
  /**
   * Route for user registration.
   * Handles user creation, password hashing, and returns the newly created user's data.
   */
  server.post(
    "/",
    {
      schema: createUserSchema,
    },
    async (request, reply) => {
      const { email, name, password } = request.body;

      // Generate a salt and hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the user in the database
      const user = await server.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          salt: salt,
        },
        // Instruct Prisma to return ONLY these safe fields.
        // This prevents leaking the password hash and salt in the response.
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      // The `user` object now matches the 201 response schema perfectly.
      return reply.status(201).send(user);
    }
  );

  /**
   * Route for user login.
   * Authenticates a user based on email and password, and returns a JWT if successful.
   */
  server.post(
    "/login",
    {
      schema: loginSchema,
    },
    async (request, reply) => {
      const { email, password } = request.body;

      // Find the user by their email address
      const user = await server.prisma.user.findUnique({ where: { email } });

      // If user is not found, return a generic 401 Unauthorized error
      if (!user) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Invalid email or password",
        });
      }

      // Re-hash the incoming password with the user's stored salt to compare
      const hashedPassword = await bcrypt.hash(password, user.salt);
      const match = hashedPassword === user.password;

      // If passwords do not match, return a generic 401 Unauthorized error
      if (!match) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Invalid email or password",
        });
      }

      // If authentication is successful, generate a JWT
      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
      });

      return { token };
    }
  );
};

export default userRoutes;
