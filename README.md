# Fastify Prisma Zod API

This is a RESTful API boilerplate built with Fastify, Prisma, Zod, and TypeScript. It features a modern, modular, and fully type-safe architecture, complete with a comprehensive automated test suite.

This project has been refactored to follow a **Route-Controller-Service** pattern, ensuring a clean separation of concerns and making it highly scalable and maintainable.

## Features

* **Modern Framework:** Built on [Fastify](https://fastify.dev/) for high performance and low overhead.

* **Type-Safe ORM:** Uses [Prisma v7](https://www.prisma.io/) with **PostgreSQL Driver Adapters** (`@prisma/adapter-pg`) for optimized database connectivity and better performance.

* **End-to-End Type Safety:** Leverages [Zod](https://zod.dev/) for schema validation and automatic type inference, eliminating the need for manual type definitions.

* **Advanced Security:** Integrated [Helmet](https://github.com/fastify/fastify-helmet) for secure headers and [Rate Limit](https://github.com/fastify/fastify-rate-limit) to prevent brute-force attacks.

* **Operational Excellence:** Implemented **Graceful Shutdown** using `close-with-grace` and `forceCloseConnections`, ensuring no requests are lost and database connections are closed cleanly during restarts or deployments.

* **API Documentation:** Automatically generates OpenAPI (Swagger) documentation using **Zod 4** native JSON Schema generation for perfect model accuracy.

* **Continuous Integration:** Pre-configured GitHub Actions workflow for automated testing on every push and pull request.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following software installed on your machine:

* [Node.js](https://nodejs.org/) (v24.x or later recommended)

* [Docker](https://www.docker.com/) and Docker Compose

### Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/fabogit/fastify-prisma-zod-swagger.git
   ```

2. **Create the environment file:**
   Create a file named `.env` in the root of the project and paste the following content. Adjust the values if necessary.

   ```env
   # Database Connection String
   DATABASE_URL="postgresql://postgres:changeme@localhost:5432/test-database?schema=public"

   # JWT Configuration
   JWT_SECRET="your-super-secret-key-for-development"

   # Server Port
   PORT=3000

   # CORS Configuration
   CORS_ORIGIN="http://localhost:3000"
   ```

3. **Install dependencies:**

   ```bash
   pnpm install
   ```

4. **Start the database container:**
   This command will start a PostgreSQL database in a Docker container.

   ```bash
   docker-compose up -d
   ```

5. **Apply database schema:**
   This command reads your `prisma/schema.prisma` file and applies it to the database, creating all the necessary tables.

   ```bash
   pnpm prisma db push
   ```

   You only need to run this command the first time or after you make changes to the `schema.prisma` file.

## Running the Application

### Development Mode

To start the server in development mode with hot-reloading, run:

```bash
pnpm run dev
```

The server will start and listen on the port defined in your `.env` file (e.g., `http://localhost:3000`).

## Running Tests

This project has a comprehensive test suite using Vitest.

* **Run all tests once:**
  This is ideal for CI environments or a final check.

  ```bash
  pnpm test
  ```

* **Run tests in watch mode:**
  This will automatically re-run the tests every time you save a file.

  ```bash
  pnpm run test:watch
  ```

## Building for Production

This project uses `pnpm` and `tsx` for development, but for production, you should compile the TypeScript code to JavaScript. The `build` script is configured to clean the `dist` folder and compile using `tsc`.

```bash
pnpm run build
```

The compiled code will be available in the `dist` folder.

## Docker Deployment

The repository includes a highly optimized multi-stage `dockerfile` that handles native modules (like `bcrypt`) and Prisma client generation securely.

To build and run the entire application using Docker:

1. **Build the image:**

   ```bash
   docker build -t fastify-prisma-zod-app .
   ```

2. **Run the container:**
   Ensure your database is running and accessible.

   ```bash
   docker run -p 3000:3000 --env-file .env fastify-prisma-zod-app
   ```

Alternatively, you can incorporate the app into a `docker-compose.yml` for a full stack deployment.

## API Documentation

Once the server is running, you can access the automatically generated API documentation (Swagger UI) at:
[http://localhost:3000/docs](http://localhost:3000/docs)

### Database Management

The project uses a centralized `PrismaClient` instance located in `src/db.ts`. This ensures a single connection pool is shared across the entire application, which is critical for performance and avoiding "too many connections" errors.

The Prisma Client is generated into `src/generated/client` to provide better control over the build process and ensure consistency across environments.

### Graceful Shutdown

To ensure production stability, the application uses `close-with-grace`. When a termination signal (`SIGTERM`, `SIGINT`) is received, the server:
1. Triggers the graceful shutdown sequence.
2. Closes the Fastify server (immediately terminating idle keep-alive connections).
3. Closes the database connection pool cleanly.
4. Exits the process once all resources are freed.