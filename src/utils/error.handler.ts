/**
 * @file Contains the centralized error handler for the Fastify application.
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Registers a global error handler for the Fastify server.
 * This function intercepts all errors thrown within routes and formats them
 * into a consistent, user-friendly JSON response.
 *
 * @param server The Fastify server instance to attach the error handler to.
 */
export function registerErrorHandler(server: FastifyInstance) {
  server.setErrorHandler(
    (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      // Log the full error for debugging purposes
      server.log.error(error);

      // --- Handle Zod Validation Errors (400 Bad Request) ---
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          // Map Zod issues to a clean, frontend-friendly array
          issues: error.issues.map((issue) => ({
            // e.g., 'body.name' becomes 'name'
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      // --- Handle Prisma "Record Not Found" Errors (404 Not Found) ---
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

      // --- Handle Prisma "Unique Constraint Violation" Errors (409 Conflict) ---
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return reply.status(409).send({
          statusCode: 409,
          error: "Conflict",
          message: `Unique constraint violation on field: ${error.meta?.target}`,
        });
      }

      // --- Default to 500 Internal Server Error for all other errors ---
      return reply.status(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    }
  );
}
