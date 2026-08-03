# Poker Trainer

## Prerequisites

- **[Bun](https://bun.sh)** — installs dependencies and runs repo scripts (`bun install`, `bun run dev`, …).
- **Docker** and **Docker Compose** (PostgreSQL in development).
- **Xcode** / **Android Studio** as needed for iOS/Android simulators (mobile).

## First-time setup

1. **Install JS dependencies:** `bun install`
2. **Run the API and DB** `bun run docker:dev`
3. **Spin up the mobile app** `bun run dev:ios` or `bun run dev:android`

**New migrations:**

```bash
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

## Local endpoints

Once `bun run docker:dev` is running:

| Service | URL | Purpose |
| ------- | --- | ------- |
| API docs (Swagger UI) | <http://localhost:8000/docs> | Interactive, auto-generated FastAPI docs — try requests directly in the browser |
| CloudBeaver | <http://localhost:8978> | Web-based Postgres browser/admin for the `db` container |

Ports come from `API_PORT` and `CB_SERVER_URL` in your `.env` — adjust the URLs above if you've changed those.

### OpenAPI → TypeScript client

```bash
bun run codegen
```

Generates a typesafe interface for the mobile app to send requests to the server.

## Code quality (Biome)

This project uses [Biome](https://biomejs.dev) for both formatting and linting — no separate ESLint or Prettier needed.

**Editor setup (recommended):** install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (or the JetBrains plugin) and enable format-on-save. Biome will be picked up automatically from `node_modules/.bin/biome` via the root [`biome.json`](biome.json).
