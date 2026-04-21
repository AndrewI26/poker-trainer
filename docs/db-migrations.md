# Database schema workflow

## Change flow

1. Edit or add **declarative models** (`Mapped[...]`, relationships, `__table_args__`, etc.).
2. With Postgres running and your DB at the **last applied migration**, generate a revision:

   ```bash
   cd apps/api
   uv run alembic revision --autogenerate -m "short description"
   ```

3. **Review** the new file in `apps/api/alembic/versions/`. Autogenerate can miss renames, complex checks, or data backfills—edit the migration by hand when needed.
4. Apply migrations:

   ```bash
   npm run db:migrate
   # or: cd apps/api && uv run alembic upgrade head
   ```

   Starting the API via `npm run dev:api` or the Docker API entrypoint also runs `alembic upgrade head`.

## Inspecting DDL from models (optional)

To print approximate **PostgreSQL DDL** from the current metadata (useful for reviews, not a substitute for migrations):

```bash
cd apps/api && uv run python scripts/print_model_ddl.py
```
