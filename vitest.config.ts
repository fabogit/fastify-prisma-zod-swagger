/**
 * @file Vitest configuration file.
 * This file configures the test runner for our project.
 * @see https://vitest.dev/config/
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /**
     * We disable global APIs to make our tests explicit and self-contained.
     * All test utilities (`describe`, `test`, `expect`, `vi`) must be imported from 'vitest'.
     */
    globals: false,
    /**
     * Specifies the environment for the tests. 'node' is suitable for backend applications.
     */
    environment: "node",
    /**
     * Automatically clears mock history and implementations before each test.
     * This ensures that tests are isolated from each other.
     */
    clearMocks: true,
    /**
     * A list of files to run before each test file.
     * We use this to load environment variables from the .env file,
     * which is crucial for integration tests that need the DATABASE_URL.
     */
    setupFiles: ["dotenv/config"],
  },
});
