# Stage 1: Base Pruner using Turbo
FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo@^2.11.8
COPY . .
RUN turbo prune @everpride/api --docker

# Stage 2: Dependencies and Builder
FROM node:20-slim AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy pruned workspace package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with strict SSL bypass for corporate proxies if active
RUN pnpm config set strict-ssl false
RUN pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client (setting NODE_TLS_REJECT_UNAUTHORIZED for binary download if needed)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN pnpm --filter @everpride/database db:generate

# Build dependencies and NestJS app
RUN pnpm --filter @everpride/shared build
RUN pnpm --filter @everpride/auth build
RUN pnpm --filter @everpride/api build

# Stage 3: Production Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nestjs

# Copy root workspace configs and lockfile
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages
COPY --from=builder /app/packages/typescript-config ./packages/typescript-config
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/auth ./packages/auth

# Copy built API app
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

USER nestjs

EXPOSE 4001

CMD ["node", "apps/api/dist/main.js"]
