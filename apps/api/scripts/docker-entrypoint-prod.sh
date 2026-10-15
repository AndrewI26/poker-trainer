#!/bin/sh
set -e

alembic upgrade head

exec uvicorn app.main:app --host 0.0.0.0 --port "${API_PORT:-8000}" --workers "${API_WORKERS:-2}" --proxy-headers --forwarded-allow-ips "*"
