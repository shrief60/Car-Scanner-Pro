/**
 * Base API client for https://qar-4uh5.onrender.com
 *
 * Token state is held in module scope so every service shares it.
 * AuthContext calls setToken() after login/logout.
 */

export const BASE_URL = 'https://qar-4uh5.onrender.com';

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  opts: {
    body?: Record<string, unknown> | FormData;
    auth?: boolean; // default true
  } = {},
): Promise<T> {
  const { body, auth = true } = opts;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (auth && _token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  // Only set Content-Type for JSON bodies; let fetch set it for FormData
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok) {
    const err = json as Record<string, unknown>;
    const msg =
      (err?.message as string) ||
      (err?.error as string) ||
      `Request failed (${res.status})`;
    const error = new Error(msg) as Error & {
      status?: number;
      code?: string;
      details?: unknown;
    };
    error.status = res.status;
    error.code = typeof err?.error === 'string' ? err.error : undefined;
    error.details = err;
    throw error;
  }

  return json as T;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, auth = true): Promise<T> {
    return request<T>('GET', path, { auth });
  },
  post<T>(path: string, body?: Record<string, unknown>, auth = true): Promise<T> {
    return request<T>('POST', path, { body, auth });
  },
  postForm<T>(path: string, body: FormData, auth = true): Promise<T> {
    return request<T>('POST', path, { body, auth });
  },
  del<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};
