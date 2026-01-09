/**
 * @file This file is the core of the application server.
 * It builds the Fastify instance, registers plugins, decorators,
 * an error handler, and the main routes aggregator.
 */

import { build } from "./server";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z, ZodError } from "zod";
import prisma from "./utils/prisma";
import { PrismaClient } from "@prisma/client";
import { registerErrorHandler } from "./utils/error.handler";
import routes from "./modules/routes";

/**
 * Defines the schema for environment variables using Zod.
 * This ensures that all required environment variables are present and correctly typed.
 */
const envSchema = z.object({
  JWT_SECRET: z.string(),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("*"),
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
 * Extends the @fastify/jwt types to provide a strongly-typed `request.user` object.
 * This ensures that the JWT payload is correctly typed throughout the application.
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
 * Builds and configures the Fastify server instance.
 * This function orchestrates the entire application setup.
 * @returns A fully configured Fastify server instance.
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
  await server.register(cors, {
    origin:
      server.config.CORS_ORIGIN === "*"
        ? "*"
        : server.config.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  });
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

  // --- ERROR HANDLER REGISTRATION ---

  // This formatter intercepts validation errors from Zod and creates a custom error object.
  server.setSchemaErrorFormatter((errors, errorType) => {
    // Create a new error with a specific message
    const error = new Error("Validation Failed");
    // Attach the structured validation issues to the error object
    (error as any).issues = errors.map((e) => ({
      field: e.instancePath.substring(1), // Remove leading '/'
      message: e.message,
    }));
    return error;
  });

  // Register the generic error handler. It will now receive our custom validation error.
  registerErrorHandler(server);

  // --- ROUTE REGISTRATION ---

  // Register a simple health-check route
  server.get("/", async () => ({ status: "✅ ok" }));

  // Register the main routes plugin, which handles all application modules
  server.register(routes);

  return server;
}
