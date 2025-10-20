import { buildServer } from "./app";

const server = await buildServer();

async function start() {
  try {
    await server.listen({
      port: server.config.PORT,
      host: "0.0.0.0",
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
