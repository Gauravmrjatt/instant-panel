# ===== Build Stage =====
FROM node:20-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

# 🔥 ENV (build-time)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 🔥 CACHE BUST
ARG CACHE_BUST

# 🔥 CLEAN BUILD
RUN rm -rf .next
RUN pnpm build


# ===== Production Stage =====
FROM node:20-alpine

RUN corepack enable
WORKDIR /app

# ✅ copy dependencies from builder (IMPORTANT)
COPY --from=builder /app/node_modules ./node_modules

# ✅ copy required files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./ 

EXPOSE 3000

CMD ["pnpm", "start"]