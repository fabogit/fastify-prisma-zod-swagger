# fastify-prisma-zod-swagger

Refactored to use the updated packages

## Install packages

`npm i`

## Start the db using docker

`docker-compose up`

## If the db if new and has no schema generate it

`npx prisma generate`

## Start dev server

`npm run dev`

## Turn your database schema into a Prisma schema

`npx prisma db pull`

## Migrate the schema

`npx prisma migrate dev --name MIGRATION_NAME`

Postman collection and env files in `/postman` folder.
