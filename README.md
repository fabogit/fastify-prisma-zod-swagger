# Fastify Prisma Zod API

This is a RESTful API boilerplate built with Fastify, Prisma, Zod, and TypeScript. It features a modern, modular, and fully type-safe architecture, complete with a comprehensive automated test suite.

This project has been refactored to follow a **Route-Controller-Service** pattern, ensuring a clean separation of concerns and making it highly scalable and maintainable.

## Features

* **Modern Framework:** Built on [Fastify](https://fastify.dev/) for high performance and low overhead.

* **Type-Safe ORM:** Uses [Prisma](https://www.prisma.io/) for database management, migrations, and type-safe queries.

* **End-to-End Type Safety:** Leverages [Zod](https://zod.dev/) for schema validation and automatic type inference, eliminating the need for manual type definitions.

* **Clean Architecture:** Organized into a **Route-Controller-Service** pattern for excellent separation of concerns.

* **Automated Testing:** Includes a comprehensive test suite using [Vitest](https://vitest.dev/), with both **unit** and **integration** tests.

* **API Documentation:** Automatically generates OpenAPI (Swagger) documentation.

* **Continuous Integration:** Comes with a pre-configured GitHub Actions workflow for automated testing on every push and pull request.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following software installed on your machine:

* [Node.js](https://nodejs.org/) (v22.x or later recommended)

* [Docker](https://www.docker.com/) and Docker Compose

### Local Setup

1. **Clone the repository:**

   ```
   git clone https://github.com/fabogit/fastify-prisma-zod-swagger.git

   ```

2. **Create the environment file:**
   Create a file named `.env` in the root of the project and paste the following content. Adjust the values if necessary.

   ```
   # Database Connection String
   DATABASE_URL="postgresql://postgres:changeme@localhost:5432/test-database?schema=public"

   # JWT Configuration
   JWT_SECRET="your-super-secret-key-for-development"

   # Server Port
   PORT=3000

   ```

3. **Install dependencies:**

   ```
   npm install

   ```

4. **Start the database container:**
   This command will start a PostgreSQL database in a Docker container.

   ```
   docker-compose up -d

   ```

5. **Apply database schema:**
   This command reads your `prisma/schema.prisma` file and applies it to the database, creating all the necessary tables.

   ```
   npx prisma db push

   ```

   You only need to run this command the first time or after you make changes to the `schema.prisma` file.

## Running the Application

### Development Mode

To start the server in development mode with hot-reloading, run:

```
npm run dev

```

The server will start and listen on the port defined in your `.env` file (e.g., `http://localhost:3000`).

## Running Tests

This project has a comprehensive test suite using Vitest.

* **Run all tests once:**
  This is ideal for CI environments or a final check.

  ```
  npm test

  ```

* **Run tests in watch mode:**
  This will automatically re-run the tests every time you save a file.

  ```
  npm run test:watch

  ```

## Building for Production

This project uses `tsx` for development, but for production, you should compile the TypeScript code to JavaScript. The `build` script is configured to check for TypeScript errors without emitting files.

```
npm run build

```

For a real production deployment, you would typically modify this script to compile the code into a `dist` folder.

## API Documentation

Once the server is running, you can access the automatically generated API documentation (Swagger UI) at:
[http://localhost:3000/docs](https://www.google.com/search?q=http://localhost:3000/docs)