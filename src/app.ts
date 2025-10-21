/**
 * @file This file is responsible for building and configuring the main Fastify application.
 * It brings together all the pieces: server instance, plugins, decorators,
 * error handling, and route modules.
 */

import { build } from "./server";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z } from "zod";
import prisma from "./utils/prisma";
import { PrismaClient } from "@prisma/client";
import { registerErrorHandler } from "./utils/error.handler";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";

/**
 * Zod schema for validating environment variables.
 * This ensures that all required variables are present and correctly typed upon startup.
 */
const envSchema = z.object({
  JWT_SECRET: z.string(),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3000),
});

// --- TYPE EXTENSIONS ---

/**
 * Extends the FastifyInstance interface to include custom decorators.
 * This provides type safety and autocompletion for `server.config` and `server.prisma`.
 */
declare module "fastify" {
  interface FastifyInstance {
    config: z.infer<typeof envSchema>;
    prisma: PrismaClient;
  }
}

/**
 * Extends the @fastify/jwt plugin's types.
 * This provides type safety for the JWT payload and the `request.user` object.
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    // Type of the object we pass to `jwt.sign`
    payload: {
      id: number;
      email: string;
      name: string | null;
    };
    // Type of `request.user` after a successful `jwtVerify`
    user: {
      id: number;
      email: string;
      name: string | null;
    };
  }
}

/**
 * Builds the complete Fastify server by assembling all plugins, decorators,
 * and routes.
 * @returns A promise that resolves to the fully configured Fastify server instance.
 */
export async function buildServer() {
  const server = build();

  // --- PLUGIN & DECORATOR REGISTRATION ---

  // Validate environment variables and decorate server with `config`
  try {
    const validatedConfig = envSchema.parse(process.env);
    server.decorate("config", validatedConfig);
  } catch (err) {
    server.log.error(err, "Invalid environment configuration");
    process.exit(1);
  }

  // Decorate server with Prisma client
  server.decorate("prisma", prisma);

  // Register core plugins
  await server.register(jwt, { secret: server.config.JWT_SECRET });
  await server.register(cors, { origin: "*" });
  await server.register(swagger, {
    openapi: {
      info: {
        title: "My API",
        description: "API documentation",
        version: "2.0.0",
      },
      servers: [],
    },
  });
  await server.register(swaggerUi, { routePrefix: "/docs" });

  // --- REGISTER ERROR HANDLER ---
  registerErrorHandler(server);

  // --- ROUTE REGISTRATION ---
  server.get("/", async () => ({ status: "ok" }));
  server.register(userRoutes, { prefix: "/user" });
  server.register(productRoutes, { prefix: "/product" });

  return server;
}
