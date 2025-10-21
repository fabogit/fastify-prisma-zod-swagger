/**
 * @file Vitest configuration file.
 * This file configures the test runner for our project.
 * @see https://vitest.dev/config/
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /**
     * Enables global APIs (describe, test, expect, etc.)
     * so we don't have to import them in every test file.
     */
    globals: true,
    /**
     * Specifies the environment for the tests. 'node' is suitable for backend applications.
     */
    environment: "node",
    /**
     * Automatically clears mock history and implementations before each test.
     * This ensures that tests are isolated from each other.
     */
    clearMocks: true,
  },
});
