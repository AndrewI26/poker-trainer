import createClient from "openapi-fetch";

import type { paths } from "./schema";

export type { paths } from "./schema";

export type ApiClient = ReturnType<typeof createApiClient>;

/** Typed openapi-fetch client. Pass API base URL (e.g. import.meta.env.VITE_API_URL). */
export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
