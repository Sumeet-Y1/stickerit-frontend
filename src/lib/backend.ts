const DEFAULT_API_ORIGIN = 'https://stickit-1.onrender.com';

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

export interface PublicUserSummary {
  id: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

export const displayNameFromEmail = (email?: string | null) => {
  if (!email) return 'guest';
  const name = email.split('@')[0]?.trim();
  return name || 'guest';
};

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
  owner: PublicUserSummary;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface UpdateUsernamePayload {
  username: string;
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

const normalizePublicUser = (user: Partial<PublicUserSummary> & { email?: string | null } | null | undefined): PublicUserSummary => ({
  id: user?.id || '',
  username: user?.username || displayNameFromEmail(user?.email),
});

const normalizeSticker = (sticker: StickerResponse): StickerResponse => ({
  ...sticker,
  owner: normalizePublicUser(sticker.owner as Partial<PublicUserSummary> & { email?: string | null }),
});

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

const RECENT_UPLOADS_KEY = 'stickerit:recentUploads';
const STICKER_CREATED_EVENT = 'stickerit:sticker-created';

export const readRecentUploads = () => storage.get<StickerResponse[]>(RECENT_UPLOADS_KEY, []).map(normalizeSticker);

export const rememberRecentUpload = (sticker: StickerResponse) => {
  const normalized = normalizeSticker(sticker);
  const next = [normalized, ...readRecentUploads().filter((item) => item.id !== normalized.id)].slice(0, 24);
  storage.set(RECENT_UPLOADS_KEY, next);

  if (hasWindow) {
    window.dispatchEvent(new CustomEvent<StickerResponse>(STICKER_CREATED_EVENT, { detail: normalized }));
  }

  return next;
};

export const mergeRecentUploads = (stickers: StickerResponse[]) => {
  const recent = readRecentUploads();
  if (recent.length === 0) {
    return stickers.map(normalizeSticker);
  }

  const merged = [...recent, ...stickers.map(normalizeSticker)];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

export const subscribeStickerCreated = (listener: (sticker: StickerResponse) => void) => {
  if (!hasWindow) {
    return () => undefined;
  }

  const handler = (event: Event) => {
    listener((event as CustomEvent<StickerResponse>).detail);
  };

  window.addEventListener(STICKER_CREATED_EVENT, handler);
  return () => window.removeEventListener(STICKER_CREATED_EVENT, handler);
};

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

export const readOAuthSessionFromLocation = (): AuthSession | null => {
  if (!hasWindow) return null;

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = hash ? new URLSearchParams(hash) : null;
  const params = [
    'accessToken',
    'refreshToken',
    'tokenType',
    'expiresInSeconds',
    'userId',
    'userEmail',
    'userUsername',
    'userRoles',
  ]
    .reduce((acc, key) => {
      const value = searchParams.get(key) ?? hashParams?.get(key);
      if (value != null) {
        acc.set(key, value);
      }
      return acc;
    }, new URLSearchParams());
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const tokenType = params.get('tokenType');
  const expiresInSeconds = params.get('expiresInSeconds');
  const userId = params.get('userId');
  const userEmail = params.get('userEmail');
  const userUsername = params.get('userUsername') || displayNameFromEmail(userEmail);
  const userRoles = params.get('userRoles');

  if (!accessToken || !refreshToken || !tokenType || !expiresInSeconds || !userId || !userEmail || !userRoles) {
    return null;
  }

  const roles = userRoles
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

  return {
    accessToken,
    refreshToken,
    tokenType,
    expiresInSeconds: Number(expiresInSeconds),
    user: {
      id: userId,
      email: userEmail,
      username: userUsername,
      roles,
    },
  };
};

const base64UrlToJson = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return JSON.parse(atob(padded));
};

export const getJwtExpirationMs = (token?: string | null) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = base64UrlToJson(parts[1]) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isJwtExpiringSoon = (token?: string | null, skewSeconds = 60) => {
  const expMs = getJwtExpirationMs(token);
  if (!expMs) return false;
  return expMs - Date.now() <= skewSeconds * 1000;
};

export const clearOAuthSessionFromLocation = () => {
  if (!hasWindow || (!window.location.hash && !window.location.search)) return;

  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  window.history.replaceState({}, document.title, url.toString());
};

export const downloadStickerFile = async (sticker: Pick<StickerResponse, 'id' | 'name' | 'originalFilename'>) => {
  if (!hasWindow) return;

  const filename = sticker.originalFilename || `${sticker.name || 'sticker'}.png`;
  const url = stickerDownloadUrl(sticker.id);

  try {
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
    return;
  } catch {
    // If the browser blocks blob download for any reason, still hit the backend endpoint.
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

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
    writeSession(null);
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return parseJson<T>(response);
}

export const getStickerFeed = (page = 0, size = 24) =>
  apiFetch<PageResponse<StickerResponse>>(`/api/stickers?page=${page}&size=${size}`, {}, { auth: false });

export const searchStickers = (query: string) =>
  apiFetch<StickerResponse[]>(`/api/stickers/search?q=${encodeURIComponent(query)}`, {}, { auth: false });

export const getStickerById = (id: string) =>
  apiFetch<StickerResponse>(`/api/stickers/${id}`, {}, { auth: false });

export const resolveSharedSticker = (token: string) =>
  apiFetch<StickerResponse>(`/s/${token}`, {}, { auth: false });

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

export const updateUsername = async (payload: UpdateUsernamePayload) => {
  const sessionUser = await apiFetch<AuthUser>('/api/auth/me/username', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const currentSession = readSession();
  if (currentSession) {
    writeSession({
      ...currentSession,
      user: sessionUser,
    });
  }

  return sessionUser;
};

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
