import { client } from "@poker-trainer/api-sdk";
import { getAccessToken, refreshSession } from "@/auth/session";

client.setConfig({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
});

const UNAUTHENTICATED_PATHS = ["/auth/token", "/auth/refresh", "/auth/logout"];

function isUnauthenticatedPath(url: string) {
  return UNAUTHENTICATED_PATHS.some((path) => url.includes(path));
}

client.interceptors.request.use((request) => {
  const token = getAccessToken();
  if (token && !isUnauthenticatedPath(request.url)) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

client.interceptors.response.use(async (response, request, options) => {
  if (response.status !== 401 || isUnauthenticatedPath(request.url)) {
    return response;
  }

  const token = await refreshSession();
  if (!token) return response;

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(
    new Request(request.url, {
      method: request.method,
      headers,
      body: options.body as BodyInit | undefined,
    }),
  );
});
