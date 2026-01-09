## 2024-05-23 - Build Script Bug
**Learning:** The `build` script was configured with `--noEmit`, preventing the generation of the `dist` directory required for production execution.
**Action:** Always verify that the build script actually produces the expected artifacts (e.g., `dist/`) before assuming the environment is ready for production.

## 2024-05-23 - Prisma Logging in Production
**Learning:** Prisma's default logging configuration (`log: ["query"]`) writes every SQL query to stdout. In a high-throughput production environment, this I/O overhead is significant.
**Action:** Always conditionalize verbose logging (especially database queries) to be active only in development environments.
