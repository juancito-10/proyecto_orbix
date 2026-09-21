# ORBIX - Backend Dockerfile
# Build multi-stage para producción

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Solo se usa para generar el cliente Prisma durante el build.
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

RUN npx prisma generate

RUN npm run build


FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# OpenSSL requerido por Prisma en Alpine
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

# Cliente Prisma generado durante el build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma y aplicación compilada
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

# Aplica las migraciones y arranca la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]