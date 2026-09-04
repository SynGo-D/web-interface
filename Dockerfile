# Optional container image for web-interface. Nothing in the rest of the
# platform (main-backend, analysis-engine, integration-service,
# webhook-listener) depends on this image existing or being run — this
# repo builds and runs entirely independently, exactly like every other
# service in the platform.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked in at build time — NEXT_PUBLIC_* vars are inlined into the client
# bundle by Next.js, so this must be set here, not just at `docker run`.
ARG NEXT_PUBLIC_MAIN_BACKEND_URL=http://localhost:5000
ENV NEXT_PUBLIC_MAIN_BACKEND_URL=$NEXT_PUBLIC_MAIN_BACKEND_URL
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
