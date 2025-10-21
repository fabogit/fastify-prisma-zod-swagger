/**
 * @file This file defines the HTTP routes for the User module.
 * It maps endpoints to their corresponding controller handlers.
 */

import { AppServer } from "../../server";
import { createUserSchema, loginSchema } from "./user.schema";
import { registerUserHandler, loginHandler } from "./user.controller";

/**
 * A Fastify plugin that encapsulates all user-related routes.
 * It registers the schemas and handlers for user registration and login.
 * @param server The Fastify server instance.
 */
const userRoutes = async (server: AppServer) => {
  /**
   * Defines the `POST /` route for user registration.
   * - `schema`: Attaches the validation and response schemas.
   * - `handler`: Delegates all logic to the `registerUserHandler`.
   */
  server.post(
    "/",
    {
      schema: createUserSchema,
    },
    registerUserHandler
  );

  /**
   * Defines the `POST /login` route for user authentication.
   * - `schema`: Attaches the validation and response schemas.
   * - `handler`: Delegates all logic to the `loginHandler`.
   */
  server.post(
    "/login",
    {
      schema: loginSchema,
    },
    loginHandler
  );
};

export default userRoutes;
