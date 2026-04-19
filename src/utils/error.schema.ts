/**
 * @file This file contains reusable Zod schemas that are shared across different
 * modules of the application. Centralizing common schemas helps to maintain
 * consistency and follows the DRY (Don't Repeat Yourself) principle.
 */

import { z } from "zod";

/**
 * Defines the structure of a single validation issue.
 */
export const validationIssueSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

/**
 * A reusable Zod schema for standardizing error responses (e.g., 4xx, 5xx).
 * This ensures that all error messages sent to the client have a consistent structure.
 */
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
  issues: z.array(validationIssueSchema).optional(),
});
