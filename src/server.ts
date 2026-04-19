import Fastify from "fastify";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";

export { jsonSchemaTransform };

/**
 * Builds and configures a Fastify `server` instance.
 * This server is pre-configured with a Zod type provider,
 * validator, and serializer for out-of-the-box type safety.
 *
 * @returns The configured Fastify server instance.
 */
export const build = () => {
  const server = Fastify({
    logger: true,
    forceCloseConnections: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Set the compilers here to keep app.ts cleaner
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  return server;
};

/**
 * Represents the application's fully configured and typed Fastify server instance.
 * This type is exported and used across modules (e.g., in route plugins)
 * to ensure type safety and provide autocompletion for decorators like `prisma` and `config`.
 */
export type AppServer = ReturnType<typeof build>;
