/**
 * @file This file defines the HTTP routes for the User module.
 * It maps endpoints to their corresponding controller handlers.
 */

import { AppServer } from "../../server.ts";
import { createUserSchema, loginSchema, getUserMeSchema } from "./user.schema.ts";
import { registerUserHandler, loginHandler } from "./user.controller.ts";

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

  /**
   * Defines the `GET /me` route for getting current user profile.
   * - `onRequest`: Uses the `server.authenticate` decorator.
   * - `handler`: Returns the authenticated user from the request.
   */
  server.get(
    "/me",
    {
      onRequest: [server.authenticate],
      schema: getUserMeSchema,
    },
    async (request) => {
      return { user: request.user };
    }
  );
};

export default userRoutes;
