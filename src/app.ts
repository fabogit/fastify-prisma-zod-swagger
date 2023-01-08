import Fastify, { FastifyRequest, FastifyReply } from "fastify";

// import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";

import { version } from "../package.json";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import swagger from "@fastify/swagger";
import swaggerui from "@fastify/swagger-ui";

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

declare module "@fastify/jwt" {
  interface FastifyJwt {
    user: {
      id: number;
      name: string;
      email: string;
    };
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

  await server.register(swagger, {
    openapi: {
      info: {
        title: "Fastify API",
        description:
          "PostgreSQL, Prisma, Fastify and Swagger REST API",
        version: version,
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      servers: [{ url: "http://localhost:3001" }],
      components: {
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            name: "apiKey",
            in: "header",
          },
        },
      },
      security: [{ apiKey: [] }],
    },
  });

  await server.register(swaggerui, {
    routePrefix: "/docs",
    initOAuth: {},
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // routes
  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });

  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log(`✅ Server running`);
  } catch (error) {
    console.error(`❌ Server stopped,`, error);
    process.exit(1);
  }
}

main();
