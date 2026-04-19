/**
 * @file This file is the core of the application server.
 * It builds the Fastify instance, registers plugins, decorators,
 * an error handler, and the main routes aggregator.
 */

import path from "path";
/**
 * @file Main application entry point.
 * Optimized for Prisma v7 and verified graceful shutdown.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z } from "zod";
import { PrismaClient } from "./generated/client/client.js";
import { build, jsonSchemaTransform } from "./server.ts";
import prismaPlugin from "./plugins/prisma.ts";
import { registerErrorHandler } from "./utils/error.handler.ts";
import { ValidationIssue, errorResponseSchema } from "./utils/error.schema.ts";
import { userResponseSchema } from "./modules/user/user.schema.ts";
import { productResponseSchema } from "./modules/product/product.schema.ts";
import routes from "./modules/routes.ts";

/**
 * Defines the schema for environment variables using Zod.
 * This ensures that all required environment variables are present and correctly typed.
 */
const envSchema = z.object({
  JWT_SECRET: z.string(),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
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
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
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

// --- TYPE EXTENSIONS ---

/**
 * Define the missing types for Zod 4 features in the current environment.
 * This allows us to use z.iso and z.toJSONSchema with full type safety.
 */
type Zod4 = typeof z & {
  iso: {
    datetime: () => z.ZodString;
  };
  toJSONSchema: (schema: z.ZodTypeAny) => Record<string, unknown>;
};

const zod4 = z as unknown as Zod4;

/**
 * Builds and configures the Fastify server instance.
 * This function orchestrates the entire application setup.
 * @returns A fully configured Fastify server instance.
 */
export async function buildServer() {
  const server = build();

  // --- SCHEMA REGISTRATION ---
  // Registering reusable schemas to make them appear in Swagger Models
  // Zod 4 idiomatic way: use z.iso.datetime() for JSON-serializable date fields in Swagger.
  // We extend the response schemas only for documentation purposes.
  const productSchemaForSwagger = productResponseSchema.extend({
    createdAt: zod4.iso.datetime(),
    updatedAt: zod4.iso.datetime(),
  });

  server.addSchema({
    $id: "User",
    ...zod4.toJSONSchema(userResponseSchema),
  });
  server.addSchema({
    $id: "Product",
    ...zod4.toJSONSchema(productSchemaForSwagger),
  });
  server.addSchema({
    $id: "Error",
    ...zod4.toJSONSchema(errorResponseSchema),
  });

  // --- MANUAL SWAGGER STATIC ASSET ROUTES ---
  // Registering Swagger on the instance
  await server.register(swagger, {
    openapi: {
      info: {
        title: "My API",
        description: "API documentation",
        version: "3.0.0",
      },
      servers: [],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await server.register(swaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
  });

  // Manual fallback for static assets that are 404ing in the plugin
  // This is a known issue in Fastify 5 + pnpm environments
  const assets = [
    "swagger-ui-bundle.js",
    "swagger-ui-standalone-preset.js",
    "swagger-ui.css",
    "swagger-ui.js",
    "index.css",
    "favicon-16x16.png",
    "favicon-32x32.png",
  ];

  const staticDir = path.join(
    path.dirname(require.resolve("@fastify/swagger-ui/package.json")),
    "static"
  );

  // Register fastify-static to enable reply.sendFile decorator
  await server.register(fastifyStatic, {
    root: staticDir,
    serve: false, // Avoid clashing with plugin internal static serving
  });

  for (const asset of assets) {
    server.get(
      `/docs/static/${asset}`,
      { schema: { hide: true } },
      async (_req: FastifyRequest, reply: FastifyReply) => {
        return reply.sendFile(asset);
      }
    );
  }

  // --- PLUGIN & DECORATOR REGISTRATION ---

  // Validate environment variables and decorate server with `config`
  try {
    const validatedConfig = envSchema.parse(process.env);
    server.decorate("config", validatedConfig);
  } catch (_err) {
    server.log.error(_err, "Invalid environment configuration");
    throw new Error("Invalid environment configuration", { cause: _err });
  }

  // Decorate server with authenticate method
  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Invalid or missing token",
        });
      }
    }
  );

  // Register core plugins
  await server.register(helmet);
  await server.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
  });
  await server.register(prismaPlugin);
  await server.register(jwt, { secret: server.config.JWT_SECRET });
  await server.register(cors, {
    origin: [server.config.CORS_ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  // --- ERROR HANDLER REGISTRATION ---

  // This formatter intercepts validation errors from Zod and creates a custom error object.
  server.setSchemaErrorFormatter((errors) => {
    // Create a new error with a specific message
    const error = new Error("Validation Failed");
    // Attach the structured validation issues to the error object
    (error as Error & { issues: ValidationIssue[] }).issues = errors.map(
      (e) => ({
        field: e.instancePath.substring(1), // Remove leading '/'
        message: e.message || "Invalid value",
      })
    );
    return error;
  });

  // Register the generic error handler. It will now receive our custom validation error.
  registerErrorHandler(server);

  // --- ROUTE REGISTRATION ---

  // Register a simple health-check route
  server.get("/", async () => ({ status: "✅ OK" }));

  // Register the main routes plugin, which handles all application modules
  await server.register(routes);

  return server;
}
