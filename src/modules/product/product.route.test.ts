/**
 * @file Integration tests for the Product module's routes.
 * This file tests the full HTTP request-response cycle for product endpoints,
 * interacting with a real database.
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../../app";
import { AppServer } from "../../server";
import prisma from "../../utils/prisma";

describe("Product Routes", () => {
  let server: AppServer;
  let authToken: string;
  let testUserId: number;

  // Test data
  const productData = { name: "Test Product", price: 123.45 };

  // Build the server and create a test user before all tests
  beforeAll(async () => {
    server = await buildServer();
    await server.ready();

    // Create a test user to own the products
    const user = await prisma.user.create({
      data: {
        email: `product-test-user-${Date.now()}@example.com`,
        name: "Product Test User",
        password: "password123",
        salt: "testsalt",
      },
    });
    testUserId = user.id;

    // Generate a token for the test user
    authToken = server.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  });

  // Clean up the database and close the server after all tests
  afterAll(async () => {
    await prisma.$transaction([
      prisma.product.deleteMany(),
      prisma.user.deleteMany({ where: { id: testUserId } }),
    ]);
    await server.close();
  });

  // Test suite for the public GET route
  describe("GET /product", () => {
    test("should return a list of products and a 200 status code", async () => {
      // ACT
      const response = await server.inject({
        method: "GET",
        url: "/product",
      });

      // ASSERT
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.json())).toBe(true);
    });
  });

  // Test suite for the protected POST route
  describe("POST /product", () => {
    // Test suite for successful creation
    describe("Success Scenarios", () => {
      test("should create a new product and return a 201 status code", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: productData,
        });

        // ASSERT
        const payload = response.json();
        expect(response.statusCode).toBe(201);
        expect(payload.name).toBe(productData.name);
        expect(payload.price).toBe(productData.price);
        expect(payload.ownerId).toBe(testUserId);
      });
    });

    // Test suite for authorization errors
    describe("Authorization Scenarios", () => {
      test("should return a 401 error if no token is provided", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          payload: productData,
        });

        // ASSERT
        expect(response.statusCode).toBe(401);
      });

      test("should return a 401 error if the token is invalid", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: "Bearer invalidtoken",
          },
          payload: productData,
        });

        // ASSERT
        expect(response.statusCode).toBe(401);
      });
    });

    // Test suite for validation errors
    describe("Validation Scenarios", () => {
      test("should return a 400 error if the 'name' field is missing", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: { price: 99.99 }, // Missing 'name'
        });

        // ASSERT
        expect(response.statusCode).toBe(400);
        const payload = response.json();
        expect(payload.issues[0].field).toBe("name");
      });

      /**
       * @new Test case for missing 'price' field
       */
      test("should return a 400 error if the 'price' field is missing", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: { name: "Missing Price" }, // Missing 'price'
        });

        // ASSERT
        expect(response.statusCode).toBe(400);
        const payload = response.json();
        expect(payload.issues[0].field).toBe("price");
      });

      /**
       * @new Test case for incorrect data type for 'price'
       */
      test("should return a 400 error if 'price' is not a number", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: { name: "Wrong Type", price: "one hundred" }, // 'price' is a string
        });

        // ASSERT
        expect(response.statusCode).toBe(400);
        const payload = response.json();
        expect(payload.issues[0].field).toBe("price");
      });

      /**
       * @new Test case for an empty payload
       */
      test("should return a 400 error with multiple issues for an empty payload", async () => {
        // ACT
        const response = await server.inject({
          method: "POST",
          url: "/product",
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {}, // Empty object
        });

        // ASSERT
        expect(response.statusCode).toBe(400);
        const payload = response.json();
        expect(payload.issues).toHaveLength(2); // 'name' and 'price' are missing
        const fields = payload.issues.map((issue: any) => issue.field);
        expect(fields).toContain("name");
        expect(fields).toContain("price");
      });
    });
  });
});
