import bcrypt from "bcrypt";
import { createUserSchema, loginSchema } from "./user.schema.ts";
import { z } from "zod";
import { PrismaClient } from "../../generated/client/client.js";

// Infer types from Zod schemas to avoid duplication
type CreateUserInput = z.infer<typeof createUserSchema.body>;
type LoginInput = z.infer<typeof loginSchema.body>;

// Pre-generated salt for dummy hashing to mitigate timing attacks.
// It has the same cost factor (10) as real hashes.
const DUMMY_SALT = "$2b$10$KwTCWmo0a0hZ6oLBF1hM5e";

/**
 * Creates a new user in the database after hashing their password.
 * @param prisma The Prisma client instance.
 * @param input The user's registration data (email, name, password).
 * @returns The newly created user object, with sensitive data omitted.
 */
async function createUser(prisma: PrismaClient, input: CreateUserInput) {
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
 * @param prisma The Prisma client instance.
 * @param input The user's login credentials (email, password).
 * @returns The full user object if authentication is successful, otherwise null.
 */
async function findUserByEmailAndPassword(
  prisma: PrismaClient,
  input: LoginInput
) {
  // Find the user by their email address
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // If user is not found, authentication fails
  if (!user) {
    // Perform a dummy hash calculation to mitigate timing attacks (User Enumeration).
    // This ensures that the response time is similar whether the user exists or not.
    await bcrypt.hash(input.password, DUMMY_SALT);
    return null;
  }

  // Verify the password using bcrypt.compare which is timing-attack safe
  const isMatch = await bcrypt.compare(input.password, user.password);

  if (!isMatch) {
    return null;
  }

  // If authentication is successful, return the user object
  return user;
}

export { createUser, findUserByEmailAndPassword };
