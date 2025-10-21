/**
 * Main application entry point.
 * This file is responsible for building the Fastify server by calling `buildServer`
 * from `app.ts` and then starting it.
 */

import { buildServer } from "./app";

/**
 * Starts the application server.
 * It builds the `server` instance and then listens on the `port` and `host`
 * specified in the environment configuration.
 * If an `error` occurs during startup, it is logged and the process exits.
 */
async function start() {
  const server = await buildServer();

  try {
    await server.listen({
      port: server.config.PORT,
      host: "0.0.0.0",
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();
