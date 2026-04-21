/**
 * Fetch OpenAPI from the API and regenerate packages/api-client types + openapi-fetch client.
 * Run: bun run codegen
 */
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const apiClientDir = join(root, "packages", "api-client", "src");
const openapiUrl = process.env.OPENAPI_URL ?? "http://127.0.0.1:8000/openapi.json";
const specPath = join(root, "packages", "api-client", "src", "openapi.json");
const openapiTsCli = join(root, "node_modules", "openapi-typescript", "bin", "cli.js");

async function main() {
  let spec: unknown;
  try {
    const res = await fetch(openapiUrl);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    spec = await res.json();
  } catch {
    const { readFile } = await import("node:fs/promises");
    console.warn(`Could not fetch ${openapiUrl}; using committed ${specPath}`);
    spec = JSON.parse(await readFile(specPath, "utf-8"));
  }
  await mkdir(apiClientDir, { recursive: true });
  await writeFile(specPath, JSON.stringify(spec, null, 2), "utf-8");

  const typesOut = join(apiClientDir, "schema.ts");
  execFileSync(process.execPath, [openapiTsCli, specPath, "-o", typesOut], {
    cwd: root,
    stdio: "inherit",
  });

  console.log("Wrote packages/api-client/src/openapi.json and schema.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
