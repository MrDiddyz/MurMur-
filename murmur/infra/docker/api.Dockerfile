FROM node:20 AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder

ARG SERVICE_NAME
ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN test -n "${SERVICE_NAME}"
RUN pnpm --filter ${SERVICE_NAME} build

FROM node:20 AS runner

WORKDIR /app
RUN corepack enable

COPY --from=base /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps ./apps
COPY --from=base /app/packages ./packages
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}
ENV NODE_ENV=production
ENV HOST=0.0.0.0

CMD ["sh", "-lc", "pnpm --filter ${SERVICE_NAME} start"]
