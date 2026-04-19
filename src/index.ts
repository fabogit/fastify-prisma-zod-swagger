import { buildServer } from "./app.ts";
import closeWithGrace from "close-with-grace";

/**
 * Starts the application server.
 * It builds the `server` instance and then listens on the `port` and `host`
 * specified in the environment configuration.
 * If an `error` occurs during startup, it is logged and the process exits.
 */
async function start() {
  const server = await buildServer();

  // Register graceful shutdown
  closeWithGrace({ delay: 5000 }, async ({ signal, err }) => {
    if (err) {
      server.log.error(err, "Error during close-with-grace");
    }
    server.log.info({ signal }, "Graceful shutdown initiated");
    
    try {
      server.log.info("Closing Fastify server...");
      await server.close();
      server.log.info("Fastify server closed successfully");
    } catch (closeErr) {
      server.log.error(closeErr, "Error while closing Fastify server");
    }
  });

  try {
    await server.ready();
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
