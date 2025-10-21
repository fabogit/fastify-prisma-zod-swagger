/**
 * @file General integration tests for the server's lifecycle and health.
 * This file verifies that the server can start, connect to the database,
 * and respond to basic health checks.
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "./app";
import { AppServer } from "./server";
import prisma from "./utils/prisma";

describe("Server Lifecycle & Health", () => {
  let server: AppServer;

  /**
   * Builds the server instance once before any tests are run.
   * If this fails, none of the tests will execute.
   */
  beforeAll(async () => {
    server = await buildServer();
    await server.ready();
  });

  /**
   * Closes the server instance after all tests have completed
   * to release resources.
   */
  afterAll(async () => {
    await server.close();
  });

  /**
   * Test to confirm that the server object was successfully built.
   * The successful execution of `beforeAll` is the primary proof.
   */
  test("should build and start the server successfully", () => {
    expect(server).toBeDefined();
  });

  /**
   * Test to verify the health-check route is responsive.
   * This confirms that the routing engine is working.
   */
  test("GET / should return 200 with a status message", async () => {
    // ACT
    const response = await server.inject({
      method: "GET",
      url: "/",
    });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "✅ ok" });
  });

  /**
   * Test to explicitly verify the database connection.
   * It runs a raw, simple query to ensure Prisma can communicate with the database.
   */
  test("should connect to the database successfully", async () => {
    // ACT & ASSERT
    // We expect this raw query to execute without throwing an error.
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });

  /**
   * @new Test to verify the documentation route is available.
   * This confirms that the Swagger UI plugin is correctly configured.
   */
  test("GET /docs should return 200 and HTML content", async () => {
    // ACT
    const response = await server.inject({
      method: "GET",
      url: "/docs",
    });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
  });

  /**
   * @new Test to verify the 404 Not Found handler.
   * This ensures that the server correctly handles requests to non-existent routes.
   */
  test("GET /non-existent-route should return 404", async () => {
    // ACT
    const response = await server.inject({
      method: "GET",
      url: "/a-route-that-does-not-exist",
    });

    // ASSERT
    expect(response.statusCode).toBe(404);
  });

  /**
   * @new Test to verify CORS headers are present.
   * This confirms that the @fastify/cors plugin is active.
   */
  test("should include CORS headers in the response", async () => {
    // ACT
    const response = await server.inject({
      method: "GET",
      url: "/",
    });

    // ASSERT
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });
});
