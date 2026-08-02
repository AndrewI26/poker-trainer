import {
  client,
  getAuthMe,
  type PostUsersError,
  postAuthToken,
  postUsers,
  type UserCreate,
  type UserPublic,
} from "@poker-trainer/api-sdk";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "./tokenStorage";

interface AuthContextValue {
  user: UserPublic | null;
  token: string | null;
  isRestoring: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function describeSignupError(error: PostUsersError) {
  const message = error.detail?.[0]?.msg;
  if (!message) return "Could not create that account";
  return message.replace(/^Value error, /, "");
}

function applyAuthHeader(token: string | null) {
  client.setConfig({
    headers: { Authorization: token ? `Bearer ${token}` : null },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const logout = useCallback(async () => {
    applyAuthHeader(null);
    setToken(null);
    setUser(null);
    await clearStoredToken();
  }, []);

  const authenticate = useCallback(async (accessToken: string) => {
    applyAuthHeader(accessToken);

    const { data: me } = await getAuthMe();
    if (!me) throw new Error("Could not load the current user");

    await setStoredToken(accessToken);
    setToken(accessToken);
    setUser(me);
  }, []);

  useEffect(() => {
    async function restore() {
      try {
        const stored = await getStoredToken();
        if (stored) await authenticate(stored);
      } catch {
        await clearStoredToken();
        applyAuthHeader(null);
      } finally {
        setIsRestoring(false);
      }
    }

    restore();
  }, [authenticate]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { data, error } = await postAuthToken({
        body: { username, password },
      });

      if (error || !data) throw new Error("Incorrect username or password");

      await authenticate(data.access_token);
    },
    [authenticate],
  );

  const signup = useCallback(
    async (input: UserCreate) => {
      const { error } = await postUsers({ body: input });

      if (error) throw new Error(describeSignupError(error));

      await login(input.username, input.password);
    },
    [login],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isRestoring, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
