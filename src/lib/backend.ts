const DEFAULT_API_ORIGIN = 'https://stickit-xgbh.onrender.com';

export { demoStickers } from '../data/mockStickers';

export const API_ORIGIN = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_ORIGIN).replace(/\/+$/, '');

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

export type AuthProvider = 'github' | 'google';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageable?: unknown;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface UserSummary {
  id: string;
  email: string;
  roles: string[];
}

export interface StickerResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  cloudinaryUrl: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  shareToken: string;
  downloadUrl: string;
  owner: UserSummary;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserSummary;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface UploadPayload {
  name: string;
  description: string;
  category: string;
  tags: string;
  file: File;
}

export interface ServerHealthResponse {
  status: string;
  timestamp: string;
  application: {
    name: string;
    version: string;
  };
  server: {
    hostname: string;
    osName: string;
    osVersion: string;
    architecture: string;
    javaVersion: string;
    timezone: string;
    locale: string;
  };
  runtime: {
    availableProcessors: number;
    maxMemoryBytes: number;
    totalMemoryBytes: number;
    freeMemoryBytes: number;
    usedMemoryBytes: number;
    uptimeMillis: number;
  };
  configuration: {
    serverPort: string;
    frontendUrl: string;
    corsAllowedOrigin: string;
    dependencies: Record<string, boolean>;
  };
  notes: string[];
}

export interface LocalProfileState {
  likedStickerIds: string[];
  savedStickerIds: string[];
  returnTo?: string | null;
}

const SESSION_KEY = 'stickerit:session';
const LIKED_KEY = 'stickerit:liked';
const SAVED_KEY = 'stickerit:saved';
const RETURN_KEY = 'stickerit:returnTo';

const hasWindow = typeof window !== 'undefined';

const storage = {
  get<T>(key: string, fallback: T): T {
    if (!hasWindow) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (!hasWindow) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (!hasWindow) return;
    window.localStorage.removeItem(key);
  },
};

export const readSession = () => storage.get<AuthSession | null>(SESSION_KEY, null);
export const writeSession = (session: AuthSession | null) => {
  if (!session) {
    storage.remove(SESSION_KEY);
    return;
  }
  storage.set(SESSION_KEY, session);
};

export const readLikedStickerIds = () => storage.get<string[]>(LIKED_KEY, []);
export const readSavedStickerIds = () => storage.get<string[]>(SAVED_KEY, []);

export const toggleStoredId = (key: string, id: string) => {
  const current = storage.get<string[]>(key, []);
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  storage.set(key, next);
  return next;
};

export const setPendingReturnTo = (value: string | null) => {
  if (!value) {
    storage.remove(RETURN_KEY);
    return;
  }
  storage.set(RETURN_KEY, value);
};

export const readPendingReturnTo = () => {
  if (!hasWindow) return null;
  try {
    return window.localStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
};

export const clearPendingReturnTo = () => storage.remove(RETURN_KEY);

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const publicUrl = (path: string) => `${API_ORIGIN}${normalizePath(path)}`;

export const healthUrl = publicUrl('/api/health');
export const stickerDownloadUrl = (stickerId: string) => publicUrl(`/api/stickers/${stickerId}/download`);
export const shareUrl = (token: string) => (hasWindow ? `${window.location.origin}/s/${token}` : `/s/${token}`);

export const authUrl = (provider: AuthProvider) => publicUrl(`/oauth2/authorization/${provider}`);

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
};

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as ApiResponse<unknown>;
    return payload.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

const authHeaders = (token?: string | null) => {
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const session = readSession();
    const response = await fetch(publicUrl('/api/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: session?.refreshToken
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
      body: session?.refreshToken ? JSON.stringify({ refreshToken: session.refreshToken }) : undefined,
    });

    if (!response.ok) {
      return null;
    }

    const next = await parseJson<AuthSession>(response);
    writeSession(next);
    return next;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  config: { auth?: boolean; retry?: boolean } = {}
): Promise<T> {
  const session = readSession();
  const headers = new Headers(options.headers);

  if (config.auth !== false && session?.accessToken) {
    authHeaders(session.accessToken).forEach((value, key) => headers.set(key, value));
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(publicUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && config.auth !== false && !config.retry) {
    const refreshed = await refreshSession();
    if (refreshed?.accessToken) {
      return apiFetch<T>(path, options, { ...config, retry: true });
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return parseJson<T>(response);
}

export const getStickerFeed = (page = 0, size = 24) =>
  apiFetch<PageResponse<StickerResponse>>(`/api/stickers?page=${page}&size=${size}`);

export const searchStickers = (query: string) =>
  apiFetch<StickerResponse[]>(`/api/stickers/search?q=${encodeURIComponent(query)}`);

export const getStickerById = (id: string) =>
  apiFetch<StickerResponse>(`/api/stickers/${id}`);

export const resolveSharedSticker = (token: string) =>
  apiFetch<StickerResponse>(`/s/${token}`);

export const uploadSticker = (payload: UploadPayload) => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('category', payload.category);
  formData.append('tags', payload.tags);
  formData.append('file', payload.file);

  return apiFetch<StickerResponse>('/api/stickers/upload', {
    method: 'POST',
    body: formData,
  });
};

export const deleteSticker = (id: string) =>
  apiFetch<void>(`/api/stickers/${id}`, {
    method: 'DELETE',
  });

export const loginWithPassword = async (payload: LoginPayload) => {
  const response = await fetch(publicUrl('/api/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const session = await parseJson<AuthSession>(response);
  writeSession(session);
  return session;
};

export const registerWithPassword = async (payload: RegisterPayload) => {
  const response = await fetch(publicUrl('/api/auth/register'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const session = await parseJson<AuthSession>(response);
  writeSession(session);
  return session;
};

export const logoutSession = async () => {
  const session = readSession();
  try {
    await fetch(publicUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...(session?.refreshToken ? { 'Content-Type': 'application/json' } : {}),
      },
      body: session?.refreshToken ? JSON.stringify({ refreshToken: session.refreshToken }) : undefined,
    });
  } finally {
    writeSession(null);
    clearPendingReturnTo();
  }
};

export const startOAuthLogin = (provider: AuthProvider, returnTo: string) => {
  setPendingReturnTo(returnTo);
  window.location.assign(authUrl(provider));
};

export const formatBytes = (value: number) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const formatUptime = (value: number) => {
  const totalSeconds = Math.floor(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
};

export const toReadableDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const toReadableSize = (value: number) => `${formatBytes(value)}B`;

export const isAuthenticated = () => Boolean(readSession()?.accessToken);

export const rememberRoute = (route: string) => setPendingReturnTo(route);

export const consumeReturnTo = () => {
  const route = readPendingReturnTo();
  clearPendingReturnTo();
  return route;
};
