# Server Audit High Priority Fixes Plan

This implementation plan focuses on addressing all the **High Priority** issues identified in the `server_audit_report.md`.

## ⚠️ User Review Required

> [!CAUTION]
> The Prisma v7 Client generation will change how Prisma is imported throughout the project (from `@prisma/client` to the generated client folder). This might require a manual `pnpm install` or `pnpm postinstall` after the generator runs to install any required peers, even though `pnpm` should handle it.

## Proposed Changes

### Prisma Configuration and Generation

#### [MODIFY] [schema.prisma](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/prisma/schema.prisma)
- Update `generator client` to `provider = "prisma-client"` (from `prisma-client-js`).
- Add explicit output to `output = "../src/generated/client"`.

#### [DELETE] [utils/prisma.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/utils/prisma.ts)
- Eliminate the dual file instance.

#### [NEW] [src/db.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/db.ts)
- Create a single, exportable Prisma instance connection file (like `utils/prisma.ts` was, but moving to `db.ts` or keeping the file and fixing it). Actually, it's better to update `plugins/prisma.ts` to export the Prisma client or use a single instance file to prevent dual pools, as currently `plugins/prisma.ts` instantiates its own `pg` pool and `utils/prisma.ts` instantiates another.

#### [MODIFY] [plugins/prisma.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/plugins/prisma.ts)
- Refactor the plugin to use the centralized Prisma instance from `src/db.ts` to ensure the server and tests use the exact same DB connection pool.

#### [MODIFY] Source files using Prisma Client
- Replace `import { PrismaClient } from "@prisma/client"` with `import { PrismaClient } from "../generated/client/index.js"` across the project (`app.ts`, `error.handler.ts`, etc.).

---

### Fastify Security Improvements

#### [MODIFY] [package.json](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/package.json)
- Add dependencies: `@fastify/rate-limit`, `@fastify/helmet`, `close-with-grace`.

#### [MODIFY] [app.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/app.ts)
- Register `@fastify/helmet` plugin.
- Register `@fastify/rate-limit` plugin.
- Replace `process.exit(1)` when environment variables fail validation with `throw new Error()`.
- Fix CORS options to be strictly array/options instead of potentially too permissive.

#### [MODIFY] [index.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/index.ts)
- Implement `closeWithGrace` to run graceful shutdown functions like `app.close()`.

---

### Business Logic and Type Safety

#### [MODIFY] [user.service.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/modules/user/user.service.ts)
- Update `login` method to use `bcrypt.compare` instead of `bcrypt.hash` + `===` to prevent timing attacks.

#### [MODIFY] [product.controller.ts](file:///home/fabo/Documents/GitHub/fastify-prisma-zod-swagger/src/modules/product/product.controller.ts)
- Fix the `request: any` typing for `createProductHandler` using proper Zod inference syntax like `FastifyRequest<{ Body: CreateProductInput }>`.

## Open Questions

> [!WARNING]
> Do you want to run the package manager commands (`pnpm install`) as part of this execution or execute the steps and let you run `install/test` afterward?

## Verification Plan

### Automated Tests
- Run `pnpm run install` and `pnpm run postinstall` to generate new client.
- Run `pnpm run lint` and verify type-checks pass.
- Run `pnpm run test` to make sure integration tests succeed and pools are managed properly.

### Manual Verification
- Start the server using `pnpm run dev`.
- Ensure there are no startup crashes and verify the new rate limit headers in API responses.
