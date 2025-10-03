import { useState, useEffect } from 'react';

export function useApi<T>(url: string, options: RequestInit = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchUrl = url.startsWith('/api/auth/session') ? url : `/api/forward?url=${encodeURIComponent(url)}`;
        const response = await fetch(fetchUrl, options);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Something went wrong');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, error, loading, setData };
}
