import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface LoginPromptState {
  open: boolean;
  reason: string;
  returnTo: string;
}

interface LoginPromptContextValue {
  prompt: LoginPromptState;
  openLoginPrompt: (reason?: string, returnTo?: string) => void;
  closeLoginPrompt: () => void;
}

const DEFAULT_PROMPT: LoginPromptState = {
  open: false,
  reason: 'Log in to keep going',
  returnTo: '/',
};

const LoginPromptContext = createContext<LoginPromptContextValue | undefined>(undefined);

export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<LoginPromptState>(DEFAULT_PROMPT);

  const value = useMemo<LoginPromptContextValue>(() => ({
    prompt,
    openLoginPrompt: (reason = 'Log in to keep going', returnTo = '/') => {
      setPrompt({
        open: true,
        reason,
        returnTo,
      });
    },
    closeLoginPrompt: () => {
      setPrompt((current) => ({
        ...current,
        open: false,
      }));
    },
  }), [prompt]);

  return <LoginPromptContext.Provider value={value}>{children}</LoginPromptContext.Provider>;
}

export function useLoginPrompt() {
  const value = useContext(LoginPromptContext);
  if (!value) {
    throw new Error('useLoginPrompt must be used inside LoginPromptProvider');
  }
  return value;
}

