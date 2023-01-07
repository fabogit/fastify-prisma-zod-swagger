# fastify-prisma-zod-swagger

if there is no `package.json` file:

- `npm init -y`

- `npm i typescript`

- `npx tsc --init `

- `npm i prisma @prisma/client fastify fastify-zod zod zod-to-json-schema fastify-jwt fastify-swagger `

- `npm i -D ts-node-dev typescript @types/node`

- `npm run dev`

###  Initialise prisma

`npx prisma init --datasource-provider postgresql`

### Turn your database schema into a Prisma schema

`npx prisma db pull`

### Generate prisma client

`npx prisma generate`

### Migrate the schema

`npx prisma migrate dev --name init`
