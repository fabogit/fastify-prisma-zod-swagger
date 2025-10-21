/**
 * @file Integration tests for the User module's routes.
 * This file tests the full HTTP request-response cycle for user registration
 * and authentication endpoints.
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../../app";
import { AppServer } from "../../server";
import prisma from "../../utils/prisma";

describe("User Routes", () => {
  let server: AppServer;
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    name: "Test User",
    password: "Password123!",
  };

  // Build the server before all tests
  beforeAll(async () => {
    server = await buildServer();
    await server.ready();
  });

  // Clean up the database and close the server after all tests
  afterAll(async () => {
    await prisma.user.deleteMany();
    await server.close();
  });

  // Test suite for User Registration
  describe("POST /user", () => {
    test("should create a new user and return a 201 status code", async () => {
      // ACT
      const response = await server.inject({
        method: "POST",
        url: "/user",
        payload: testUser,
      });

      // ASSERT
      expect(response.statusCode).toBe(201);
      const payload = response.json();
      expect(payload.email).toBe(testUser.email);
      expect(payload.name).toBe(testUser.name);
      expect(payload.password).toBeUndefined(); // Ensure password is not returned
    });

    test("should return a 409 conflict error if the email already exists", async () => {
      // ACT: Try to create the same user again
      const response = await server.inject({
        method: "POST",
        url: "/user",
        payload: testUser,
      });

      // ASSERT
      expect(response.statusCode).toBe(409);
      const payload = response.json();
      expect(payload.message).toContain("Unique constraint violation");
    });
  });

  // Test suite for User Login
  describe("POST /user/login", () => {
    test("should return a JWT token for valid credentials and a 200 status code", async () => {
      // ACT
      const response = await server.inject({
        method: "POST",
        url: "/user/login",
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      // ASSERT
      expect(response.statusCode).toBe(200);
      const payload = response.json();
      expect(payload.token).toBeDefined();
    });

    test("should return a 401 unauthorized error for an incorrect password", async () => {
      // ACT
      const response = await server.inject({
        method: "POST",
        url: "/user/login",
        payload: {
          email: testUser.email,
          password: "wrong-password",
        },
      });

      // ASSERT
      expect(response.statusCode).toBe(401);
    });

    test("should return a 401 unauthorized error for a non-existent email", async () => {
      // ACT
      const response = await server.inject({
        method: "POST",
        url: "/user/login",
        payload: {
          email: "non-existent@example.com",
          password: "some-password",
        },
      });

      // ASSERT
      expect(response.statusCode).toBe(401);
    });
  });
});
