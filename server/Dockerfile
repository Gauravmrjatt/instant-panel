# ===== Base =====
FROM node:18-alpine

# Enable pnpm
RUN corepack enable

WORKDIR /app

# Copy only lock + package first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install deps (cached layer)
RUN pnpm install --prod

# Copy rest of code
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "server.js"]