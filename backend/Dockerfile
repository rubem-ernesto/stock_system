FROM node:22-slim
LABEL maintainer="rubemernesto2@gmail.com"
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /api
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://stockflow:build-only@localhost:5432/stock_flow?schema=public" pnpm prisma generate
COPY . .
RUN pnpm build
CMD ["node", "dist/src/main"]
EXPOSE 3000