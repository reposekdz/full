import { API_BASE_URL } from '@/app/config/apiBase';

/**
 * Lightweight API helper that attaches auth token and handles JSON by default.
 * Set useJson=false to handle non-JSON responses (e.g., file downloads).
 */
export async function apiFetch(path: string, options: RequestInit = {}, useJson: boolean = true) {
  const token = localStorage.getItem('token') || '';
  const headers = new Headers(options.headers || {});

  // Only set JSON content-type when not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = useJson ? await res.json() : res;

  if (!res.ok) {
    throw new Error((data as any)?.message || res.statusText);
  }
  return data;
}
