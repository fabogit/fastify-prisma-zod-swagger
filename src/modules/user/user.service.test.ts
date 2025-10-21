/**
 * @file Unit tests for the User service.
 * This file tests the business logic of user creation and authentication in isolation
 * by mocking both the Prisma client and the bcrypt library.
 */

import { describe, test, expect, vi } from "vitest";
import prisma from "../../utils/prisma";
import bcrypt from "bcrypt";
import { createUser, findUserByEmailAndPassword } from "./user.service";

// Mock the Prisma client module
vi.mock("../../utils/prisma", () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock the bcrypt library
vi.mock("bcrypt", () => ({
  default: {
    genSalt: vi.fn(),
    hash: vi.fn(),
  },
}));

describe("User Service", () => {
  const userInput = {
    email: "test@example.com",
    name: "Test User",
    password: "password123",
  };
  const salt = "randomsalt";
  const hashedPassword = "hashedpassword";

  // Test suite for createUser
  describe("createUser", () => {
    test("should hash the password and create a new user", async () => {
      // 1. ARRANGE
      const expectedUser = {
        id: 1,
        email: userInput.email,
        name: userInput.name,
      };

      // Configure mocks
      (bcrypt.genSalt as vi.Mock).mockResolvedValue(salt);
      (bcrypt.hash as vi.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as vi.Mock).mockResolvedValue(expectedUser);

      // 2. ACT
      const result = await createUser(userInput);

      // 3. ASSERT
      // Verify that hashing functions were called
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userInput.password, salt);

      // Verify that prisma.user.create was called correctly
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userInput.email,
          name: userInput.name,
          password: hashedPassword,
          salt: salt,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      // Verify the result
      expect(result).toEqual(expectedUser);
    });

    /**
     * @new Test case for database failures
     * This test ensures that if Prisma throws an unexpected error during user creation,
     * the service correctly propagates that error up the call stack.
     */
    test("should throw an error if the database operation fails", async () => {
      // 1. ARRANGE
      const dbError = new Error("Database connection failed");
      (bcrypt.genSalt as vi.Mock).mockResolvedValue(salt);
      (bcrypt.hash as vi.Mock).mockResolvedValue(hashedPassword);
      // Configure the mock to reject the promise
      (prisma.user.create as vi.Mock).mockRejectedValue(dbError);

      // 2. ACT & 3. ASSERT
      // We expect the createUser function to reject with the same error
      await expect(createUser(userInput)).rejects.toThrow(dbError);
    });
  });

  // Test suite for findUserByEmailAndPassword
  describe("findUserByEmailAndPassword", () => {
    test("should return the user if credentials are valid", async () => {
      // 1. ARRANGE
      const storedUser = {
        ...userInput,
        id: 1,
        salt,
        password: hashedPassword,
      };

      (prisma.user.findUnique as vi.Mock).mockResolvedValue(storedUser);
      (bcrypt.hash as vi.Mock).mockResolvedValue(hashedPassword);

      // 2. ACT
      const result = await findUserByEmailAndPassword(userInput);

      // 3. ASSERT
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userInput.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        userInput.password,
        storedUser.salt
      );
      expect(result).toEqual(storedUser);
    });

    test("should return null if the user is not found", async () => {
      // 1. ARRANGE
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);

      // 2. ACT
      const result = await findUserByEmailAndPassword(userInput);

      // 3. ASSERT
      expect(result).toBeNull();
    });

    test("should return null if the password does not match", async () => {
      // 1. ARRANGE
      const storedUser = {
        ...userInput,
        id: 1,
        salt,
        password: hashedPassword,
      };

      (prisma.user.findUnique as vi.Mock).mockResolvedValue(storedUser);
      // Simulate a password mismatch
      (bcrypt.hash as vi.Mock).mockResolvedValue("wronghashedpassword");

      // 2. ACT
      const result = await findUserByEmailAndPassword(userInput);

      // 3. ASSERT
      expect(result).toBeNull();
    });

    /**
     * @new Test case for database failures during login
     * Ensures that if Prisma fails during user lookup, the error is propagated.
     */
    test("should throw an error if the database lookup fails", async () => {
      // 1. ARRANGE
      const dbError = new Error("Database lookup failed");
      (prisma.user.findUnique as vi.Mock).mockRejectedValue(dbError);

      // 2. ACT & 3. ASSERT
      await expect(findUserByEmailAndPassword(userInput)).rejects.toThrow(
        dbError
      );
    });

    /**
     * @new Test case for hashing failures during login
     * Ensures that if bcrypt fails during password comparison, the error is propagated.
     */
    test("should throw an error if password hashing fails", async () => {
      // 1. ARRANGE
      const storedUser = {
        ...userInput,
        id: 1,
        salt,
        password: hashedPassword,
      };
      const hashError = new Error("bcrypt failed");
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(storedUser);
      (bcrypt.hash as vi.Mock).mockRejectedValue(hashError);

      // 2. ACT & 3. ASSERT
      await expect(findUserByEmailAndPassword(userInput)).rejects.toThrow(
        hashError
      );
    });
  });
});
