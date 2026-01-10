/**
 * @file This file contains the business logic for the User module.
 * It interacts with the database and handles tasks like password hashing.
 */

import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { createUserSchema, loginSchema } from "./user.schema";
import { z } from "zod";

// Infer types from Zod schemas to avoid duplication
type CreateUserInput = z.infer<typeof createUserSchema.body>;
type LoginInput = z.infer<typeof loginSchema.body>;

// Predefined dummy salt for simulating password hashing when a user is not found.
// This helps prevent timing attacks (User Enumeration).
// The format corresponds to a valid bcrypt salt.
const DUMMY_SALT = "$2b$10$abcdefghijklmnopqrstuv";

/**
 * Creates a new user in the database after hashing their password.
 * @param input - The user's registration data (email, name, password).
 * @returns The newly created user object, with sensitive data omitted.
 */
async function createUser(input: CreateUserInput) {
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      salt: salt,
    },
    // Instruct Prisma to return ONLY these safe fields.
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

/**
 * Attempts to find a user by their email and verify their password.
 * @param input - The user's login credentials (email, password).
 * @returns The full user object if authentication is successful, otherwise null.
 */
async function findUserByEmailAndPassword(input: LoginInput) {
  // Find the user by their email address
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // If user is not found, we still perform a hash operation to simulate the delay.
  // This prevents attackers from determining if an email exists based on response time.
  if (!user) {
    await bcrypt.hash(input.password, DUMMY_SALT);
    return null;
  }

  // Re-hash the incoming password with the user's stored salt to compare
  const hashedPassword = await bcrypt.hash(input.password, user.salt);
  const isMatch = hashedPassword === user.password;

  // If passwords do not match, authentication fails
  if (!isMatch) {
    return null;
  }

  // If authentication is successful, return the user object
  return user;
}

// Export functions to be used by the controller
export { createUser, findUserByEmailAndPassword };
