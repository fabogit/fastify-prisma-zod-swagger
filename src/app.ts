import Fastify from "fastify";

const server = Fastify({ logger: true });

server.get("/healthcheck", async () => {
  return { status: "OK" };
});

async function main() {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log(`✅ Server running`);
  } catch (error) {
    //
    console.error(`❌ `, error);
    process.exit(1);
  }
}

main();
