import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  name?: string | null;
  email: string;
  image?: string | null;
}

interface Session {
  user: User;
}

interface AuthContextType {
  accessToken: string | null;
  session: Session | null;
  isPending: boolean;
  setAccessToken: (token: string | null) => void;
  setSession: (session: Session | null) => void;
  setIsPending: (pending: boolean) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let tokenGetter: (() => string | null) | null = null;

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export function getToken(): string | null {
  return tokenGetter ? tokenGetter() : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    setTokenGetter(() => accessToken);
  }, [accessToken]);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setSession(null);
  }, [setAccessToken]);

  const value: AuthContextType = {
    accessToken,
    session,
    isPending,
    setAccessToken,
    setSession,
    setIsPending,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

