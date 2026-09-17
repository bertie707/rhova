"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface Visitor {
  email: string;
  notes: string;
}

interface VisitorContextValue {
  visitor: Visitor | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextValue | null>(null);

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        setVisitor(await res.json());
      } else {
        setVisitor(null);
      }
    } catch {
      setVisitor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Legitimate fetch-on-mount — refresh() sets state once the request
    // resolves, not synchronously within this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort — clear local state regardless.
    }
    setVisitor(null);
  }, []);

  return (
    <VisitorContext.Provider value={{ visitor, loading, refresh, logout }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error("useVisitor must be used within a VisitorProvider");
  return ctx;
}
