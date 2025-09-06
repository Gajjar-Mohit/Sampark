# Alternative Dockerfile for projects without bun.lockb
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

# Install dependencies
FROM base AS deps
COPY package.json ./
RUN bun install

# Generate Prisma client
FROM deps AS builder
COPY . .
RUN bunx prisma generate

# Production image
FROM base AS runner
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Generate Prisma client in production
RUN bunx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
