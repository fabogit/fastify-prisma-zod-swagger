import Fastify, { FastifyRequest, FastifyReply } from "fastify";

// import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";

import userRoutes from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";

export const server = Fastify({ logger: true });

// CORS
// server.register(cors, {
// 	origin: ["localhost:9001"],
// });

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}

// JWT
server.register(fjwt, {
  secret: "supersecret",
});
server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.send(error);
    }
  }
);

// healthcheck
server.get("/healthcheck", async () => {
  return { status: "OK" };
});

async function main() {
  // schemas
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  // routes
  server.register(userRoutes, { prefix: "api/users" });

  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log(`✅ Server running`);
  } catch (error) {
    console.error(`❌ Server stopped,`, error);
    process.exit(1);
  }
}

main();
