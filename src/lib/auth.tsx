import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser, login as doLogin, logout as doLogout, signup as doSignup, onChange, type User } from "./store";

interface Ctx {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const u = await currentUser();
      setUser(u);
      if (u?.currency) {
        // Sync database currency to local storage for consistent formatting
        const { setCurrency } = await import("./store");
        setCurrency(u.currency);
      }
      setLoading(false);
    };
    run();
    const off = onChange(run);
    return off;
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        async signup(n, e, p) { await doSignup({ name: n, email: e, password: p }); },
        async login(e, p) { await doLogin(e, p); },
        async logout() { await doLogout(); },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
