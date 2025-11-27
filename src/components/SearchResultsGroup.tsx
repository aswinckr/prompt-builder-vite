import React, { memo } from 'react';
import { SearchResultGroup as SearchResultGroupType, SearchResult } from '../types/globalSearch';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultsGroupProps {
  group: SearchResultGroupType;
  query: string;
  highlightedIndex?: number;
  startIndex?: number;
  onResultClick?: (result: SearchResult) => void;
}

// Use React.memo to prevent unnecessary re-renders
export const SearchResultsGroup = memo<SearchResultsGroupProps>(({
  group,
  query,
  highlightedIndex = -1,
  startIndex = 0,
  onResultClick
}) => {
  // Memoize the empty state to prevent unnecessary re-renders
  const emptyState = React.useMemo(() => {
    if (group.results.length === 0) {
      return (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-neutral-500">
            No {group.title.toLowerCase().replace(/s$/, '')}s found
          </p>
        </div>
      );
    }
    return null;
  }, [group.results.length, group.title]);

  if (group.results.length === 0) {
    return (
      <div className="border-b border-neutral-700 last:border-b-0">
        <div className="px-4 py-2 bg-neutral-750 border-b border-neutral-700">
          <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            {group.title}
          </h3>
        </div>
        {emptyState}
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-700 last:border-b-0">
      {/* Category Header */}
      <div className="px-4 py-2 bg-neutral-750 border-b border-neutral-700">
        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          {group.title}
          {group.totalCount > group.results.length && (
            <span className="text-neutral-500">
              {' '}(showing {group.results.length} of {group.totalCount})
            </span>
          )}
        </h3>
      </div>

      {/* Results in this category */}
      {group.results.map((result: SearchResult, index: number) => {
        const globalIndex = startIndex + index;
        const isHighlighted = globalIndex === highlightedIndex;

        return (
          <SearchResultItem
            key={`${group.category}-${result.id}`}
            result={result}
            query={query}
            isHighlighted={isHighlighted}
            onClick={() => onResultClick?.(result)}
          />
        );
      })}
    </div>
  );
});

SearchResultsGroup.displayName = 'SearchResultsGroup';