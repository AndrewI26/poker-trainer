# CLAUDE.md

## Stack

- **Monorepo**: Bun workspaces (`apps/*`, `packages/*`)
- **API**: FastAPI + SQLAlchemy + Alembic + PostgreSQL (Docker), managed by `uv`
- **Web**: Vite + React + React Router v7 + TanStack Query
- **Mobile**: Expo (React Native) + Expo Router
- **SDK**: `packages/api-sdk` — fully generated from OpenAPI spec via hey-api (`bun run codegen`). Never hand-edit files in `src/generated/`.
- **Linting/Formatting**: Biome (TS/JS), Ruff (Python)

## Commands

```bash
# Start
bun run db:up           # start Postgres in Docker (required first)
bun run dev             # API + web concurrently
bun run dev:api         # FastAPI only (runs migrations first)
bun run dev:web         # Vite dev server
bun run dev:mobile      # Expo

# Code quality
bun run check           # Biome + Ruff (lint + format, auto-fix) — run this before committing
bun run check:ts        # Biome only
bun run check:api       # Ruff only
bun run lint            # lint only (no writes)
bun run format          # format only (writes files)

# Database
bun run db:migrate      # run alembic upgrade head
bun run db:psql         # psql shell in container

# Codegen (API must be running)
bun run codegen         # fetch openapi.json → regenerate packages/api-sdk/src/generated/

# Tests
bun run test:api        # pytest (uses SQLite in-memory, no Docker needed)
cd apps/api && uv run pytest tests/test_drills.py  # single test file
```

## Architecture

### Data flow

SQLAlchemy models → Alembic migrations → FastAPI routes → OpenAPI spec → `bun run codegen` → `packages/api-sdk/src/generated/` → web and mobile apps via `@poker-trainer/api-sdk`

### API (`apps/api`)

- `app/config.py` — pydantic-settings, loads `../../.env` then `.env`. `DATABASE_URL` and `API_PORT` are required (no defaults).
- `app/models/` — SQLAlchemy declarative models
- `app/schemas/` — Pydantic request/response schemas
- `app/routers/` — FastAPI routers, mounted at `/api`
- Migrations live in `alembic/versions/`. Generate with `uv run alembic revision --autogenerate -m "description"`, always review before applying.

### SDK (`packages/api-sdk`)

- All code under `src/generated/` is auto-generated — never edit it.
- `src/index.ts` re-exports the generated code.
- Generated output includes: typed SDK functions (`sdk.gen.ts`), Zod schemas with runtime validation (`zod.gen.ts`), TanStack Query options/mutations (`@tanstack/react-query.gen.ts`), and TS types (`types.gen.ts`).
- SDK validates responses against Zod schemas at runtime automatically.

### Mobile (`apps/mobile`)

- File-based routing via Expo Router (`app/` directory)
- Theme system: `theme/ThemeContext.tsx` exports `useTheme()` and `Theme` type. All UI components accept a `t: Theme` prop — import `Theme` from `ThemeContext`, not derived locally.
- UI components live in `components/ui/`, feature components in `components/features/`

### Web (`apps/web`)

- React Router v7 — routes defined in `src/routes.tsx`, shared `Layout` in `src/components/Layout.tsx`
- Pages live in `src/pages/`
- Shares `@poker-trainer/api-sdk` with mobile

## Environment

Copy `.env.example` to `.env`. Variables use `dotenv-expand` interpolation — only `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, and `API_PORT` need to be set; all other vars derive from them.

## After every code change

Always run the appropriate check after making changes — do not skip this step:

- **TS/JS changes** (web, mobile, packages): `bun run check:ts`
- **Python changes** (API): `bun run check:api`
- **Both changed**: `bun run check`

Fix all errors and warnings before finishing.

## Database migrations

```bash
cd apps/api
uv run alembic revision --autogenerate -m "short description"
# review the generated file in alembic/versions/
uv run alembic upgrade head
```
