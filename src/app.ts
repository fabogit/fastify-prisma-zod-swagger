import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z } from "zod";

// 1. Our Zod schema remains the single source of truth
const envSchema = z.object({
  JWT_SECRET: z.string(),
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().default(3000), // Coerce string to number
});

// 2. Extend the Fastify types (remains identical)
declare module "fastify" {
  interface FastifyInstance {
    config: z.infer<typeof envSchema>;
  }
}

export async function buildServer() {
  const server = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // --- PLUGIN REGISTRATION ---

  // 3. Validate and decorate manually (ONCE)
  try {
    const validatedConfig = envSchema.parse(process.env);
    server.decorate("config", validatedConfig);
  } catch (err) {
    server.log.error("Invalid environment configuration:");
    server.log.error(err);
    process.exit(1); // Stop the server if config is invalid
  }

  // 4. Now we can safely use server.config
  await server.register(jwt, {
    secret: server.config.JWT_SECRET,
  });

  await server.register(cors, {
    origin: "*", // Set specific domains in production
  });

  await server.register(swagger, {
    openapi: {
      info: {
        title: "My API",
        description: "API documentation",
        version: "1.0.0",
      },
      servers: [],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // --- ROUTE REGISTRATION ---

  server.get("/", async () => {
    return { status: "ok" };
  });

  return server;
}
