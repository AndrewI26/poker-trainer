import {
  getAuthMe,
  type PostUsersError,
  postAuthToken,
  postUsers,
  type TokenPair,
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
  endSession,
  loadSession,
  onSessionEnded,
  revokeSession,
  saveSession,
} from "./session";

interface AuthContextValue {
  user: UserPublic | null;
  isAuthenticated: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(
    () =>
      onSessionEnded(() => {
        setUser(null);
        setIsAuthenticated(false);
      }),
    [],
  );

  const applySession = useCallback(async (pair: TokenPair) => {
    await saveSession(pair);

    const { data: me } = await getAuthMe();
    if (!me) {
      await endSession(false);
      throw new Error("Could not load the current user");
    }

    setUser(me);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    async function restore() {
      try {
        const hasRefreshToken = await loadSession();
        if (!hasRefreshToken) return;

        const { data: me } = await getAuthMe();
        if (me) {
          setUser(me);
          setIsAuthenticated(true);
        } else {
          await endSession(false);
        }
      } catch {
        await endSession(false);
      } finally {
        setIsRestoring(false);
      }
    }

    restore();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const { data, error } = await postAuthToken({
        body: { username, password },
      });

      if (error || !data) throw new Error("Incorrect username or password");

      await applySession(data);
    },
    [applySession],
  );

  const signup = useCallback(
    async (input: UserCreate) => {
      const { error } = await postUsers({ body: input });

      if (error) throw new Error(describeSignupError(error));

      await login(input.username, input.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await revokeSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isRestoring, login, signup, logout }}
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
