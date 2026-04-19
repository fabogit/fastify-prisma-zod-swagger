/**
 * @file This file initializes and exports a singleton instance of the PrismaClient.
 * By exporting a single instance, we ensure that the application uses a single
 * database connection pool, which is a best practice for performance and
 * resource management.
 */

import { PrismaClient } from "./generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

/**
 * Singleton instance of the PrismaClient.
 */
export const prisma = new PrismaClient({
  adapter,
  // Only log queries in development to reduce I/O overhead in production
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

/**
 * Helper to end the database pool.
 * Useful for graceful shutdown and tests.
 */
export async function closeDb() {
  await prisma.$disconnect();
  await pool.end();
}
