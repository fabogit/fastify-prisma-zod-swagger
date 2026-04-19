import fp from "fastify-plugin";
import { AppServer } from "../server.ts";
import { prisma, closeDb } from "../db.ts";

/**
 * A Fastify plugin that decorates the server instance with a PrismaClient.
 * It uses the centralized Prisma instance from src/db.ts.
 */
export default fp(
  async function prismaPlugin(server: AppServer) {
    // Ensure the connection is established
    await prisma.$connect();

    // Decorate the server instance with the prisma client
    server.decorate("prisma", prisma);

    // Close the connection when the server stops
    server.addHook("onClose", async () => {
      await closeDb();
    });
  },
  {
    name: "prisma",
  }
);
