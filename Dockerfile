FROM node:24-slim AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy files
COPY . .

# Build frontend
RUN pnpm run build:app

# Build backend
RUN pnpm run build:server

FROM node:24-slim

# Copy dist from builder
COPY --from=builder /app/dist /app/dist

# Set working directory
WORKDIR /app

# Set node prod environment
ENV NODE_ENV=production

# Start server
CMD [ "node", "/app/dist/server/main.cjs" ]