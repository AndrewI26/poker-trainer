FROM python:3.12-slim-bookworm AS openapi

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/

WORKDIR /api
COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY apps/api/app ./app
RUN ENV=production \
    API_PORT=8000 \
    DATABASE_URL=postgresql+psycopg://codegen@localhost/codegen \
    ACCESS_TOKEN_SECRET_KEY=codegen \
    uv run --no-sync python -c "import json; from app.main import app; print(json.dumps(app.openapi()))" > /openapi.json


FROM node:22-slim AS build

COPY --from=oven/bun:1.3 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /repo
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/api-sdk/package.json packages/api-sdk/
COPY packages/poker-engine/package.json packages/poker-engine/
RUN bun install --frozen-lockfile --ignore-scripts

COPY openapi-ts.config.ts tsconfig.base.json ./
COPY packages packages
COPY apps/mobile apps/mobile
COPY --from=openapi /openapi.json /openapi.json
RUN OPENAPI_URL=/openapi.json bun run codegen

ENV CI=1 EXPO_NO_TELEMETRY=1
WORKDIR /repo/apps/mobile
RUN npx expo export --platform web --output-dir dist


FROM node:22-alpine

WORKDIR /app
RUN npm install -g serve@14.2.4
COPY --from=build /repo/apps/mobile/dist ./dist

USER node
EXPOSE 3000
CMD ["serve", "--single", "--no-clipboard", "--listen", "tcp://0.0.0.0:3000", "dist"]
