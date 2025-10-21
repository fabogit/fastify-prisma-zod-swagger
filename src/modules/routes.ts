/**
 * @file This file serves as the central hub for registering all application routes.
 * It imports modular route plugins and registers them with the main Fastify instance.
 */

import { AppServer } from "../server";
import userRoutes from "./user/user.route";
import productRoutes from "./product/product.route";

/**
 * A Fastify plugin that aggregates all the application's modular routes.
 * This keeps the main `app.ts` file clean from route registration logic.
 * @param server The Fastify server instance.
 */
const routes = async (server: AppServer) => {
  // Register all the modular routes with their respective prefixes
  server.register(userRoutes, { prefix: "/user" });
  server.register(productRoutes, { prefix: "/product" });
};

export default routes;
