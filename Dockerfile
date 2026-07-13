# syntax=docker/dockerfile:1

# ── Base: Playwright image ships Chromium + all system deps ──────────────────
FROM mcr.microsoft.com/playwright:v1.58.2-jammy AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# ── Deps: install node_modules only when package files change ─────────────────
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --cache /tmp/npm-cache

# ── Dev: hot-reload server (default target used by docker-compose) ────────────
FROM base AS development

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# ── Builder: production Next.js build ────────────────────────────────────────
FROM base AS builder

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Production runner ─────────────────────────────────────────────────────────
FROM base AS production

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package.json ./
COPY next.config.ts ./
COPY tsconfig.json ./

# Content dirs — mount via volumes in production or bake in at build time
COPY ebooks ./ebooks

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
