import React, { memo, useMemo } from 'react';
import { GlobalSearchResponse, SearchResult } from '../types/globalSearch';
import { SearchResultsGroup } from './SearchResultsGroup';

interface SearchResultsListProps {
  searchResults: GlobalSearchResponse | null;
  isLoading?: boolean;
  highlightedIndex?: number;
  onResultClick?: (result: SearchResult) => void;
}

// Use React.memo to prevent unnecessary re-renders
export const SearchResultsList = memo<SearchResultsListProps>(({
  searchResults,
  isLoading = false,
  highlightedIndex = -1,
  onResultClick
}) => {
  // Memoize loading state to prevent unnecessary re-renders
  const loadingState = useMemo(() => (
    <div className="px-4 py-6 text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-500 border-t-transparent"></div>
        <p className="text-sm text-neutral-400">Searching...</p>
      </div>
    </div>
  ), []);

  // Memoize no results state to prevent unnecessary re-renders
  const noResultsState = useMemo(() => {
    const query = searchResults?.query || '';
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-neutral-400">
          {query.trim() ? `No results found for "${query}"` : 'Enter a search query to find results'}
        </p>
      </div>
    );
  }, [searchResults?.query]);

  // Memoize error state to prevent unnecessary re-renders
  const errorState = useMemo(() => (
    <div className="px-4 py-6 text-center">
      <p className="text-sm text-red-400">
        Error searching: {searchResults?.error || 'Unknown error occurred'}
      </p>
    </div>
  ), [searchResults?.error]);

  // Memoize groups with indices for keyboard navigation
  const groupsWithIndices = useMemo(() => {
    if (!searchResults?.results) return [];

    let currentIndex = 0;
    return searchResults.results.map(group => {
      const startIndex = currentIndex;
      currentIndex += group.results.length;
      return { group, startIndex };
    });
  }, [searchResults?.results]);

  // Loading state
  if (isLoading) {
    return loadingState;
  }

  // No results
  if (!searchResults || searchResults.totalResults === 0) {
    return noResultsState;
  }

  // Error state
  if (searchResults.hasError) {
    return errorState;
  }

  return (
    <div className="max-h-96 overflow-y-auto custom-scrollbar">
      {groupsWithIndices.map(({ group, startIndex }) => (
        <SearchResultsGroup
          key={group.category}
          group={group}
          query={searchResults.query}
          highlightedIndex={highlightedIndex}
          startIndex={startIndex}
          onResultClick={onResultClick}
        />
      ))}
    </div>
  );
});

SearchResultsList.displayName = 'SearchResultsList';