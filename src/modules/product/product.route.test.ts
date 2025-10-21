/**
 * @file Integration tests for the Product module's routes.
 * This file tests the full HTTP request-response cycle for product endpoints,
 * interacting with a real database.
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../../app";
import { AppServer } from "../../server";
import prisma from "../../utils/prisma";

// Test suite for Product Routes
describe("Product Routes", () => {
  let server: AppServer;
  let authToken: string;
  let testUserId: number;

  // Build the server and create a test user before all tests
  beforeAll(async () => {
    server = await buildServer();
    await server.ready();

    // 1. Create a test user directly in the database
    const user = await prisma.user.create({
      data: {
        email: `test-user-${Date.now()}@example.com`,
        name: "Test User",
        // In a real scenario, you'd use a factory to create hashed passwords
        password: "password123",
        salt: "somesalt",
      },
    });
    testUserId = user.id;

    // 2. Generate an auth token for the test user
    authToken = server.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  });

  // Clean up the database after all tests
  afterAll(async () => {
    // Delete test data in reverse order of creation
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await server.close();
  });

  // Test case for the public GET /product route
  test("GET /product should return a list of products and a 200 status code", async () => {
    // ACT
    const response = await server.inject({
      method: "GET",
      url: "/product",
    });

    // ASSERT
    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(Array.isArray(payload)).toBe(true);
  });

  // Test case for the protected POST /product route
  test("POST /product should create a new product and return a 201 status code", async () => {
    // 1. ARRANGE
    const productData = {
      name: "A new awesome product",
      price: 150.5,
    };

    // 2. ACT
    const response = await server.inject({
      method: "POST",
      url: "/product",
      // Include the auth token in the headers
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      // Send the product data as the payload
      payload: productData,
    });

    // 3. ASSERT
    expect(response.statusCode).toBe(201);
    const payload = response.json();
    expect(payload.name).toBe(productData.name);
    expect(payload.price).toBe(productData.price);
    expect(payload.ownerId).toBe(testUserId);
  });
});
