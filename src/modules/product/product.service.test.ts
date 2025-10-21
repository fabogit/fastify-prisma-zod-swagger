/**
 * @file Unit tests for the Product service.
 * This file tests the business logic of product creation and retrieval in isolation
 * by mocking the Prisma client.
 */

import { describe, test, expect, vi } from "vitest";
import prisma from "../../utils/prisma";
import { createProduct, getProducts } from "./product.service";

// Mock the Prisma client module
vi.mock("../../utils/prisma", () => ({
  default: {
    product: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Test suite for Product Service
describe("Product Service", () => {
  // Test case for the createProduct function
  test("createProduct should create a new product with the correct data", async () => {
    // 1. ARRANGE
    const input = { name: "Test Product", price: 99.99 };
    const ownerId = 1;
    const expectedProduct = {
      id: 1,
      ...input,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      content: null,
    };

    // Configure the mock to return our expected product when `create` is called
    (prisma.product.create as vi.Mock).mockResolvedValue(expectedProduct);

    // 2. ACT
    const result = await createProduct(input, ownerId);

    // 3. ASSERT
    // Check if prisma.product.create was called with the correct arguments
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        price: input.price,
        ownerId: ownerId,
      },
    });

    // Check if the function returned the expected product
    expect(result).toEqual(expectedProduct);
  });

  /**
   * @new Test case for database failures during product creation
   * This test ensures that if Prisma throws an unexpected error,
   * the service correctly propagates that error.
   */
  test("createProduct should throw an error if the database operation fails", async () => {
    // 1. ARRANGE
    const input = { name: "Test Product", price: 99.99 };
    const ownerId = 1;
    const dbError = new Error("Database connection failed");

    // Configure the mock to reject the promise
    (prisma.product.create as vi.Mock).mockRejectedValue(dbError);

    // 2. ACT & 3. ASSERT
    // We expect the createProduct function to reject with the same error
    await expect(createProduct(input, ownerId)).rejects.toThrow(dbError);
  });

  // Test case for the getProducts function
  test("getProducts should return an array of products", async () => {
    // 1. ARRANGE
    const mockProducts = [
      {
        id: 1,
        name: "Product 1",
        price: 10,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: null,
      },
      {
        id: 2,
        name: "Product 2",
        price: 20,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: null,
      },
    ];

    // Configure the mock to return our array when `findMany` is called
    (prisma.product.findMany as vi.Mock).mockResolvedValue(mockProducts);

    // 2. ACT
    const result = await getProducts();

    // 3. ASSERT
    // Check if the function returned the array of products
    expect(result).toEqual(mockProducts);
    // Check that findMany was called
    expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
  });

  /**
   * @new Test case for database failures during product retrieval
   * This test ensures that if Prisma throws an unexpected error,
   * the service correctly propagates that error.
   */
  test("getProducts should throw an error if the database operation fails", async () => {
    // 1. ARRANGE
    const dbError = new Error("Database lookup failed");
    // Configure the mock to reject the promise
    (prisma.product.findMany as vi.Mock).mockRejectedValue(dbError);

    // 2. ACT & 3. ASSERT
    // We expect the getProducts function to reject with the same error
    await expect(getProducts()).rejects.toThrow(dbError);
  });
});
