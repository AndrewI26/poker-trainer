/**
 * Lets `bun test` at the repo root run the FastAPI suite (pytest).
 * Prefer: `bun run test` → `cd apps/api && uv run pytest` (no Bun test harness).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { test, expect } from "bun:test";

const root = dirname(fileURLToPath(import.meta.url));
const apiDir = join(root, "apps", "api");

test("FastAPI: pytest (apps/api)", () => {
  const proc = spawnSync("uv", ["run", "pytest", "-v"], {
    cwd: apiDir,
    encoding: "utf-8",
    env: process.env,
  });
  if (proc.stdout) console.log(proc.stdout);
  if (proc.stderr) console.error(proc.stderr);
  expect(proc.status).toBe(0);
});
