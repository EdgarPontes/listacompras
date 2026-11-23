import { useCallback, useEffect, useRef, useState } from 'react';

export function useApi<T>(url: string, options: RequestInit = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Mantém as options atuais sem recriar o efeito a cada render.
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const lastUrlRef = useRef<string | null>(null);

  const refetch = useCallback(() => {
    setReloadKey(key => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Mostra o estado de carregamento ao trocar de URL, mas não em refetch.
    if (lastUrlRef.current !== url) {
      lastUrlRef.current = url;
      setLoading(true);
    }

    const fetchData = async () => {
      try {
        const fetchUrl = url.startsWith('/api/auth/session')
          ? url
          : `/api/forward?url=${encodeURIComponent(url)}`;

        const response = await fetch(fetchUrl, optionsRef.current);
        const payload =
          response.status === 204 ? null : await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || 'Something went wrong');
        }

        if (!cancelled) {
          setData(payload as T);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, reloadKey]);

  return { data, error, loading, setData, refetch };
}
