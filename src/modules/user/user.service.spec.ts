/**
 * @file Unit tests for the User service.
 * This file tests the business logic of user creation and authentication in isolation
 * by mocking both the Prisma client and the bcrypt library.
 */

import { describe, test, expect, vi } from "vitest";
import bcrypt from "bcrypt";
import { createUser, findUserByEmailAndPassword } from "./user.service.ts";
import { PrismaClient } from "../../generated/client/client.js";

// Define a type-safe mock interface for Prisma to avoid 'any'
interface MockPrisma {
  user: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
}

// Create a mock Prisma instance
const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
} as unknown as MockPrisma & PrismaClient;

// Mock the bcrypt library
vi.mock("bcrypt", () => ({
  default: {
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
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
      // This is the object that the service function is expected to return (due to `select`).
      const expectedSelectedUser = {
        id: 1,
        email: userInput.email,
        name: userInput.name,
      };

      // Configure mocks
      vi.mocked(bcrypt.genSalt).mockImplementation(() => Promise.resolve(salt));
      vi.mocked(bcrypt.hash).mockImplementation(() =>
        Promise.resolve(hashedPassword)
      );

      vi.mocked(mockPrisma.user.create).mockResolvedValue(expectedSelectedUser);


      // 2. ACT
      const result = await createUser(mockPrisma, userInput);

      // 3. ASSERT
      // Verify that prisma.user.create was called with the correct arguments, including `select`
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
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

      // Verify that the final result of our service function is the selected user object
      expect(result).toEqual({ id: expectedSelectedUser.id, email: expectedSelectedUser.email, name: expectedSelectedUser.name });
    });

    /**
     * Test case for database failures
     */
    test("should throw an error if the database operation fails", async () => {
      // 1. ARRANGE
      const dbError = new Error("Database connection failed");
      vi.mocked(bcrypt.genSalt).mockImplementation(() => Promise.resolve(salt));
      vi.mocked(bcrypt.hash).mockImplementation(() =>
        Promise.resolve(hashedPassword)
      );
      vi.mocked(mockPrisma.user.create).mockRejectedValue(dbError);

      // 2. ACT & 3. ASSERT
      await expect(createUser(mockPrisma, userInput)).rejects.toThrow(dbError);
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

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare as (data: string | Buffer, encrypted: string) => Promise<boolean>).mockResolvedValue(true);

      // 2. ACT
      const result = await findUserByEmailAndPassword(mockPrisma, userInput);

      // 3. ASSERT
      expect(result).toEqual(storedUser);
    });

    test("should return null if the user is not found", async () => {
      // 1. ARRANGE
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      // 2. ACT
      const result = await findUserByEmailAndPassword(mockPrisma, userInput);

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

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare as (data: string | Buffer, encrypted: string) => Promise<boolean>).mockResolvedValue(false);

      // 2. ACT
      const result = await findUserByEmailAndPassword(mockPrisma, userInput);

      // 3. ASSERT
      expect(result).toBeNull();
    });

    /**
     * Test case for database failures during login
     */
    test("should throw an error if the database lookup fails", async () => {
      // 1. ARRANGE
      const dbError = new Error("Database lookup failed");
      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(dbError);

      // 2. ACT & 3. ASSERT
      await expect(
        findUserByEmailAndPassword(mockPrisma, userInput)
      ).rejects.toThrow(dbError);
    });

    /**
     * Test case for hashing failures during login
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
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare as (data: string | Buffer, encrypted: string) => Promise<boolean>).mockRejectedValue(hashError);

      // 2. ACT & 3. ASSERT
      await expect(
        findUserByEmailAndPassword(mockPrisma, userInput)
      ).rejects.toThrow(hashError);
    });
  });
});
