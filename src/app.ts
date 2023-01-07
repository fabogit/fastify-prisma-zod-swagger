import Fastify from "fastify";

import userRoutes from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";

const server = Fastify({ logger: true });

server.get("/healthcheck", async () => {
	return { status: "OK" };
});

async function main() {

	// schemas
	for (const schema of userSchemas) {
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
