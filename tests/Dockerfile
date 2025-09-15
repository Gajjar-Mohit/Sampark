# Alternative Dockerfile for projects without bun.lockb
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

# Install dependencies
FROM base AS deps
COPY package.json ./
RUN bun install

# Production image
FROM base AS runner
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .


