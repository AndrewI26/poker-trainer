# Poker Trainer

## Prerequisites

- **[Bun](https://bun.sh)** — installs dependencies and runs repo scripts (`bun install`, `bun run dev`, …).
- **Docker** and **Docker Compose** (PostgreSQL in development).
- **uv** ([install](https://docs.astral.sh/uv/getting-started/installation/)) for the Python API (`apps/api`).
- **Xcode** / **Android Studio** as needed for iOS/Android simulators (mobile).

**npm:** You can still use `npm install` and `npm run …`; the repo uses standard `package.json` workspaces. Prefer committing **`bun.lock`** only (remove `package-lock.json` if you use Bun exclusively).

## Repository layout

| Path | Purpose |
|------|---------|
| [`package.json`](package.json) | Bun/npm workspaces (`apps/*`, `packages/*`) and root scripts |
| [`bun.lock`](bun.lock) | Bun lockfile (preferred) |
| [`tsconfig.base.json`](tsconfig.base.json) | Shared TypeScript defaults for packages and apps |
| [`.env.example`](.env.example) | Root env template (copy to `.env`) |
| [`docker-compose.yml`](docker-compose.yml) | **PostgreSQL** (`db`) and optional **API** (`api`) |
| [`scripts/codegen.ts`](scripts/codegen.ts) | Fetches `/openapi.json` → `packages/api-client` |
| [`apps/api`](apps/api) | FastAPI, SQLAlchemy models, Alembic, Dockerfiles |
| [`apps/web`](apps/web) | Client-only SPA: Vite, React, TanStack Router, TanStack Query |
| [`apps/mobile`](apps/mobile) | Expo (React Native); shared `@poker-trainer/query` |
| [`packages/api-client`](packages/api-client) | Generated **`openapi-typescript`** types + **`openapi-fetch`** (`createApiClient`) |
| [`packages/query`](packages/query) | Shared query keys and hooks on top of the API client |

Internal packages use `file:` links so installs work without a registry.

## First-time setup

1. **Install JS dependencies:** `bun install`
2. **Python API env:** `cp apps/api/.env.example apps/api/.env` (defaults match Docker Postgres on `localhost:5432`).
3. **Web / mobile env (optional):** `cp apps/web/.env.example apps/web/.env` and `cp apps/mobile/.env.example apps/mobile/.env.local` if you need custom API URLs.
4. **Start Postgres:** `bun run db:up`
5. **Run the stack:** `bun run dev` (API + web). The API runs **`alembic upgrade head`** before uvicorn so tables exist.

## Environment

```bash
cp .env.example .env
```

- **`DATABASE_URL`** — API **on the host** with Postgres in Docker: **`localhost`**. API **inside Compose**: hostname **`db`**.
- **`VITE_API_URL`** — Web SPA base URL (e.g. `http://127.0.0.1:8000`).
- **`EXPO_PUBLIC_API_URL`** — Expo (LAN IP or `10.0.2.2` on Android emulator for host `localhost`).

## Commands from the repo root (Bun)

| Task | Command |
|------|---------|
| Install | `bun install` |
| API + web | `bun run dev` |
| API only | `bun run dev:api` |
| Web only | `bun run dev:web` |
| Mobile (Expo) | `bun run dev:mobile` |
| Apply DB migrations | `bun run db:migrate` |
| Postgres shell | `bun run db:shell` |
| `psql` in container | `bun run db:psql` |
| Postgres logs | `bun run db:logs` |
| Start Postgres | `bun run db:up` |
| OpenAPI → TS client | `bun run codegen` |
| Lint (web + mobile) | `bun run lint` |

`codegen` runs `bun scripts/codegen.ts` and invokes the local `openapi-typescript` CLI (no `npx`).

### Database (PostgreSQL in Docker)

```bash
bun run db:up
```

Requires the `db` service for `db:shell`, `db:psql`, `db:logs`.

### API (FastAPI)

```bash
bun run dev:api
```

**New migrations:** see [`docs/database-schema.md`](docs/database-schema.md). Short version — from `apps/api`:

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

### OpenAPI → TypeScript client

```bash
bun run codegen
```

Writes `packages/api-client/src/openapi.json` and `packages/api-client/src/schema.ts`.

## Docker Compose

- **`docker compose up -d db`** — Postgres **16**, volume `postgres_data`.
- **`docker compose up --build api`** — [`apps/api/Dockerfile.dev`](apps/api/Dockerfile.dev): migrations + **uvicorn --reload**.

**Production:** build [`apps/api/Dockerfile`](apps/api/Dockerfile); set `DATABASE_URL` to production Postgres.

## Product direction

The sample **drills** CRUD (`/api/drills`) shows: SQLAlchemy → Alembic → FastAPI → OpenAPI → `api-client` → shared React Query → web/mobile. Extend models and routes as you add real poker training features.
