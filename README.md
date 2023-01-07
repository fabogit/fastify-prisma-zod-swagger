# fastify-prisma-zod-swagger

if there is no `package.json` file:

- `npm init -y`

- `npm i typescript`

- `npx tsc --init `

- `npm i @prisma/client fastify fastify-zod zod zod-to-json-schema fastify-jwt fastify-swagger `

- `npm i -D ts-node-dev typescript @types/node`

- `npm run dev`

## Initialise prisma

`npx prisma init --datasource-provider postgresql`

### Migrate the schema

`npx prisma migrate dev --name init`
