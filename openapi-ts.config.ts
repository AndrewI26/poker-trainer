import { defineConfig } from "@hey-api/openapi-ts";

const API_PREFIX = "/api";

const toOperationId = (method: string, path: string) =>
  `${method}${path
    .slice(API_PREFIX.length)
    .split(/[/{}-]+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("")}`;

export default defineConfig({
  input: process.env.OPENAPI_URL ?? "http://127.0.0.1:8000/api/openapi.json",
  output: {
    path: "packages/api-sdk/src/generated",
  },
  parser: {
    patch: {
      operations: (method, path, operation) => {
        operation.operationId = toOperationId(method, path);
      },
    },
  },
  plugins: [
    "@hey-api/client-fetch",
    "zod",
    {
      name: "@hey-api/sdk",
      validator: true,
      operations: { nesting: "operationId" },
    },
    {
      name: "@tanstack/react-query",
      queryOptions: true,
      queryKeys: true,
      mutationOptions: true,
    },
  ],
});
