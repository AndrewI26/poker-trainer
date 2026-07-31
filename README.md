# Poker Trainer

## Prerequisites

- **[Bun](https://bun.sh)** — installs dependencies and runs repo scripts (`bun install`, `bun run dev`, …).
- **Docker** and **Docker Compose** (PostgreSQL in development).
- **Xcode** / **Android Studio** as needed for iOS/Android simulators (mobile).

## Repository layout

| Path | Purpose |
| ------ | --------- |
| [`package.json`](package.json) | Bun/npm workspaces (`apps/*`, `packages/*`) and root scripts |
| [`bun.lock`](bun.lock) | Bun lockfile (preferred) |
| [`tsconfig.base.json`](tsconfig.base.json) | Shared TypeScript defaults for packages and apps |
| [`.env.example`](.env.example) | Root env template (copy to `.env`) |
| [`docker-compose.yml`](docker-compose.yml) | **PostgreSQL** (`db`) and optional **API** (`api`) |
| [`scripts/codegen.ts`](scripts/codegen.ts) | Fetches `/openapi.json` → `packages/api-client` |
| [`apps/api`](apps/api) | FastAPI, SQLAlchemy models, Alembic, Dockerfiles |
| [`apps/web`](apps/web) | Client-only SPA: Vite, React, TanStack Query |
| [`apps/mobile`](apps/mobile) | Expo (React Native); shared `@poker-trainer/query` |
| [`packages/api-client`](packages/api-client) | Generated **`openapi-typescript`** types + **`openapi-fetch`** (`createApiClient`) |
| [`packages/query`](packages/query) | Shared query keys and hooks on top of the API client |

Internal packages use `file:` links so installs work without a registry.

## First-time setup

1. **Install JS dependencies:** `bun install`
2. **Run the API and DB** `bun run docker:dev`
3. **Spin up the mobile app** `bun run dev:ios` or `bun run dev:android`

**New migrations:**

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

### OpenAPI → TypeScript client

```bash
bun run codegen
```

Writes `packages/api-client/src/openapi.json` and `packages/api-client/src/schema.ts`.

## Code quality (Biome)

This project uses [Biome](https://biomejs.dev) for both formatting and linting — no separate ESLint or Prettier needed.

**Editor setup (recommended):** install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (or the JetBrains plugin) and enable format-on-save. Biome will be picked up automatically from `node_modules/.bin/biome` via the root [`biome.json`](biome.json).
