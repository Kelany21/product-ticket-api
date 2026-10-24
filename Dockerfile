# --- Build stage -------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.ts ./
COPY src ./src
RUN npm run build

# --- Runtime stage -------------------------------------------------------------
# Only compiled JS + production dependencies ship here: no TypeScript source,
# no ts-node/typescript, nothing dev-only.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/src/server.js"]
