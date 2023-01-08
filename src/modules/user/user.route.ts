import { FastifyInstance } from "fastify";
import {
  registerUserHandler,
  loginHandler,
  getUsersHandler,
} from "./user.controller";
import { $ref } from "./user.schema";

async function userRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
    },
    getUsersHandler
  );

  server.post(
    "/",
    {
      schema: {
        body: $ref("createUserSchema"),
        response: {
          201: $ref("createUserReplySchema"),
        },
      },
    },
    registerUserHandler
  );

  server.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginReplySchema"),
        },
      },
    },
    loginHandler
  );
}

export default userRoutes;
