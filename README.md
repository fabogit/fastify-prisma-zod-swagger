# fastify-prisma-zod-swagger

Refactored to use the updated packages

Install packages

`npm i`

Start the db using docker

`docker-compose up`

Start dev server

`npm run dev`

## Initialise prisma

`npx prisma init --datasource-provider postgresql`

## Turn your database schema into a Prisma schema

`npx prisma db pull`

## Generate prisma client

`npx prisma generate`

## Migrate the schema

`npx prisma migrate dev --name MIGRATION_NAME`
