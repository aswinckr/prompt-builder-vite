import { useSearchParams, useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

interface UseSearchParametersReturn {
  searchQuery: string | null;
  searchItemId: string | null;
  clearSearchParameters: () => void;
  hasSearchParameters: boolean;
}

/**
 * Hook for handling search parameters passed from global search
 */
export function useSearchParameters(): UseSearchParametersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const searchQuery = searchParams.get('q');
  const searchItemId = searchParams.get('id');
  const hasSearchParameters = !!(searchQuery && searchItemId);

  const clearSearchParameters = useCallback(() => {
    // Create new URL without search parameters
    const newUrl = location.pathname;
    window.history.replaceState({}, '', newUrl);
    setSearchParams({});
  }, [location.pathname, setSearchParams]);

  return {
    searchQuery,
    searchItemId,
    clearSearchParameters,
    hasSearchParameters
  };
}