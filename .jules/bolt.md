## 2024-05-23 - Build Script Bug
**Learning:** The `build` script was configured with `--noEmit`, preventing the generation of the `dist` directory required for production execution.
**Action:** Always verify that the build script actually produces the expected artifacts (e.g., `dist/`) before assuming the environment is ready for production.

## 2024-05-23 - Prisma Logging in Production
**Learning:** Prisma's default logging configuration (`log: ["query"]`) writes every SQL query to stdout. In a high-throughput production environment, this I/O overhead is significant.
**Action:** Always conditionalize verbose logging (especially database queries) to be active only in development environments.

## 2025-05-24 - Missing Foreign Key Indexes
**Learning:** Prisma (and Postgres) does not automatically index foreign keys. This can lead to significant performance bottlenecks on delete operations (cascading checks) and filtering (joins).
**Action:** Explicitly add `@@index([fkId])` to models in `prisma/schema.prisma` for every relation field to ensure optimal database performance.
