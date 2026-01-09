/**
 * @file This file initializes and exports a singleton instance of the PrismaClient.
 * By exporting a single instance, we ensure that the application uses a single
 * database connection pool, which is a best practice for performance and
- * resource management.
 */

import { PrismaClient } from "@prisma/client";

/**
 * Singleton instance of the PrismaClient.
 * Logging is enabled for 'query', 'info', 'warn', and 'error' to provide
 * detailed database interaction feedback during development.
 */
const prisma = new PrismaClient({
  // Only log queries in development to reduce I/O overhead in production
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

export default prisma;
