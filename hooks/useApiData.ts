import { useEffect, useState } from 'react';
import type { ApiSpec } from '../types';

const API_URL = 'https://api.restful-api.dev/objects';

interface UseApiDataResult {
  data: ApiSpec[];
  loading: boolean;
  error: string | null;
}

export function useApiData(): UseApiDataResult {
  const [data, setData]       = useState<ApiSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiSpec[]>;
      })
      .then((json) => {
        if (!cancelled) {
          // Keep only entries that have a data object with properties
          const withData = json.filter(
            (item) => item.data && Object.keys(item.data).length > 0,
          );
          setData(withData.slice(0, 5));
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message ?? 'Failed to load specifications');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
