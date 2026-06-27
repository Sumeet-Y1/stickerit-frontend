import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearOAuthSessionFromLocation,
  consumeReturnTo,
  isJwtExpiringSoon,
  loginWithPassword,
  logoutSession,
  readSession,
  readOAuthSessionFromLocation,
  registerWithPassword,
  refreshSession,
  rememberRoute,
  updateUsername as updateUsernameRequest,
  writeSession,
  startOAuthLogin,
  type AuthProvider,
  type AuthSession,
  type LoginPayload,
  type RegisterPayload,
  type UpdateUsernamePayload,
} from '../lib/backend';

interface AuthContextValue {
  session: AuthSession | null;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  updateUsername: (payload: UpdateUsernamePayload) => Promise<AuthSession | null>;
  logout: () => Promise<void>;
  signInWithOAuth: (provider: AuthProvider, returnTo: string) => void;
  restoreReturnTo: () => string | null;
  rememberReturnTo: (route: string) => void;
  refresh: () => Promise<AuthSession | null>;
  authenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeSessionUsername = (session: AuthSession | null): AuthSession | null => {
  if (!session) return null;
  if (session.user.username) return session;
  const fallback = session.user.email.split('@')[0]?.trim() || 'guest';
  const next = {
    ...session,
    user: {
      ...session.user,
      username: fallback,
    },
  };
  writeSession(next);
  return next;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const oauthSession = readOAuthSessionFromLocation();
      if (oauthSession) {
        clearOAuthSessionFromLocation();
        const normalized = normalizeSessionUsername(oauthSession);
        if (mounted) {
          setSession(normalized);
          setReady(true);
        }
        return;
      }

      const current = readSession();
      if (current) {
        const normalizedCurrent = normalizeSessionUsername(current);
        if (!isJwtExpiringSoon(current.accessToken, 90)) {
          if (mounted) {
            setSession(normalizedCurrent);
            setReady(true);
          }
          return;
        }

        const refreshed = await refreshSession();
        if (mounted) {
          setSession(normalizeSessionUsername(refreshed ?? normalizedCurrent));
          setReady(true);
        }
        return;
      }

      const refreshed = await refreshSession();
      if (mounted) {
        setSession(normalizeSessionUsername(refreshed));
        setReady(true);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const syncSession = (next: AuthSession | null) => {
    setSession(next);
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready,
    authenticated: Boolean(session?.accessToken),
    login: async (payload: LoginPayload) => {
      const next = await loginWithPassword(payload);
      syncSession(next);
      return next;
    },
    register: async (payload: RegisterPayload) => {
      const next = await registerWithPassword(payload);
      syncSession(next);
      return next;
    },
    updateUsername: async (payload: UpdateUsernamePayload) => {
      await updateUsernameRequest(payload);
      const next = normalizeSessionUsername(readSession());
      syncSession(next);
      return next;
    },
    logout: async () => {
      await logoutSession();
      syncSession(null);
    },
    signInWithOAuth: (provider: AuthProvider, returnTo: string) => {
      rememberRoute(returnTo);
      startOAuthLogin(provider, returnTo);
    },
    restoreReturnTo: () => consumeReturnTo(),
    rememberReturnTo: (route: string) => rememberRoute(route),
    refresh: async () => {
      const next = await refreshSession();
      syncSession(next);
      return next;
    },
  }), [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
