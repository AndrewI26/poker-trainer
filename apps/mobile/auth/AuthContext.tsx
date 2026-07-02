import {
  client,
  getAuthMe,
  postAuthToken,
  type UserPublic,
} from "@poker-trainer/api-sdk";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface AuthContextValue {
  user: UserPublic | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await postAuthToken({
      body: { username: email, password },
    });

    if (error || !data) throw new Error("Login failed");

    const { access_token } = data;

    client.setConfig({
      headers: { Authorization: `Bearer ${access_token}` },
    });

    setToken(access_token);
    const { data: me } = await getAuthMe();
    setUser(me ?? null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    client.setConfig({ headers: {} });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
