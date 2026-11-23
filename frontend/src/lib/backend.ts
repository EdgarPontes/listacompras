/**
 * URL base do backend, usada apenas em código de servidor (route handlers).
 * Aceita BACKEND_URL ou NEXT_PUBLIC_BACKEND_URL para manter compatibilidade.
 */
export const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:3001'
).replace(/\/+$/, '');
