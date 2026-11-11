"use client";

import * as React from "react";

export type SessionDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  walletBalance: number;
};

type Ctx = {
  session: SessionDTO | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setSession: (s: SessionDTO | null) => void;
};

const SessionContext = React.createContext<Ctx>({
  session: null,
  loading: true,
  refresh: async () => {},
  setSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<SessionDTO | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setSession(null);
        return;
      }
      const data = await res.json();
      setSession(data?.data?.user ?? data?.user ?? null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const value = React.useMemo(
    () => ({ session, loading, refresh: load, setSession }),
    [session, loading, load],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return React.useContext(SessionContext);
}
