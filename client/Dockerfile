# ===== Base Builder =====
FROM node:18-alpine AS builder

RUN corepack enable

WORKDIR /app

# Copy only deps first (cache optimization)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install

# Copy app
COPY . .

# Build Next.js
RUN pnpm build


# ===== Production Image =====
FROM node:18-alpine

RUN corepack enable

WORKDIR /app

# Only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]