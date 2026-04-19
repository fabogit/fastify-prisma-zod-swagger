# --- Build Stage ---
FROM node:24-alpine AS builder

# Install system build dependencies
RUN apk add --no-cache build-base python3

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client (needed for build and runtime)
RUN pnpm prisma generate

# Compile TypeScript to JavaScript
RUN pnpm run build

# Remove development dependencies to keep the image lean
RUN pnpm prune --prod


# --- Production Stage ---
FROM node:24-alpine

# Use non-root user for security
USER node
WORKDIR /app

# Copy only what is needed for production
# We copy node_modules already pruned from the builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/generated ./generated
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Expose the port the application will run on
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "dist/index.js"]
