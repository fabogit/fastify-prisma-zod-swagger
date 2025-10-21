/**
 * @file This file contains the central error handling logic for the application.
 * It catches all runtime errors and formats them into a consistent JSON response.
 * NOTE: Validation errors are formatted in `app.ts` and then caught here.
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";

/**
 * Registers a global error handler for the Fastify instance.
 * @param server The Fastify server instance.
 */
export function registerErrorHandler(server: FastifyInstance) {
  server.setErrorHandler(
    (
      error: Error & { issues?: any[] },
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      server.log.error(error, "Error caught by global handler");

      // --- Handle Custom Validation Errors (400) ---
      // This checks for the custom error we created in `setSchemaErrorFormatter` in app.ts
      if (error.message === "Validation Failed" && error.issues) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          issues: error.issues,
        });
      }

      // --- Handle Prisma "Not Found" Errors (404) ---
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "Resource not found",
        });
      }

      // --- Handle Prisma "Unique Constraint" Errors (409) ---
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return reply.status(409).send({
          statusCode: 409,
          error: "Conflict",
          message: `Unique constraint violation on field: ${
            (error.meta?.target as string[])?.join(", ") || "unknown"
          }`,
        });
      }

      // --- Default to 500 Internal Server Error ---
      return reply.status(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  );
}
