import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/openapi.json",
  output: {
    path: "packages/api-sdk/src/generated",
  },
  plugins: [
    "@hey-api/client-fetch",
    "zod",
    {
      name: "@hey-api/sdk",
      validator: true,
      operations: { nesting: "id" },
    },
    {
      name: "@tanstack/react-query",
      queryOptions: true,
      queryKeys: true,
      mutationOptions: true,
    },
  ],
});
