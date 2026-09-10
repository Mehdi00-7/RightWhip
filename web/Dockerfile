# ---- deps: install node_modules once, cached separately from source changes ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: full node_modules + source, produces the standalone build ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* variables are compiled into the JS bundle at build time, not
# read at container startup — so this must come in as a build arg, not a
# `docker run -e`, or every deploy silently falls back to the default.
# API_URL also has to be a build arg here specifically because next.config.ts's
# rewrite destination is baked into the standalone build's routes manifest at
# build time too (server-side code elsewhere, like lib/api.ts, reads it fresh
# at runtime instead — see the runner stage below).
ARG NEXT_PUBLIC_API_URL
ARG API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV API_URL=${API_URL}

RUN npm run build

# ---- runner: only the standalone output, no full node_modules, no source ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Default for lib/api.ts's runtime read — override at `docker run -e API_URL=...`
# or via docker-compose's `environment:` for the real target (e.g. http://api:8000).
ENV API_URL=http://localhost:8000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
