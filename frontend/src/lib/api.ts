import { cookies } from 'next/headers';
import { BACKEND_URL } from './backend';

/**
 * Utilitário server-side para chamar o backend com o token do cookie.
 * Lança erro quando a resposta não é bem-sucedida.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'API request failed';
    try {
      const data = await response.json();
      message = data?.error ?? message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
