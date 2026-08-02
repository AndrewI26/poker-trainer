import {
  postAuthLogout,
  postAuthRefresh,
  type TokenPair,
} from "@poker-trainer/api-sdk";
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from "./tokenStorage";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

const endListeners = new Set<() => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function onSessionEnded(listener: () => void): () => void {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
}

export async function saveSession(pair: TokenPair): Promise<void> {
  accessToken = pair.access_token;
  refreshToken = pair.refresh_token;
  await setStoredTokens(pair.access_token, pair.refresh_token);
}

export async function loadSession(): Promise<boolean> {
  const stored = await getStoredTokens();
  accessToken = stored.accessToken;
  refreshToken = stored.refreshToken;
  return stored.refreshToken !== null;
}

export async function endSession(notify = true): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await clearStoredTokens();
  if (notify) {
    for (const listener of endListeners) listener();
  }
}

async function performRefresh(): Promise<string | null> {
  if (!refreshToken) return null;

  const { data, error } = await postAuthRefresh({
    body: { refresh_token: refreshToken },
  });

  if (error || !data) {
    await endSession();
    return null;
  }

  await saveSession(data);
  return data.access_token;
}

export function refreshSession(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

export async function revokeSession(): Promise<void> {
  const presented = refreshToken;
  await endSession(false);

  if (presented) {
    await postAuthLogout({ body: { refresh_token: presented } }).catch(
      () => undefined,
    );
  }
}
