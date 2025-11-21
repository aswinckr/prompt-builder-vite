import React, { useMemo, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * TagFilterPills component displays clickable tag filter pills under the search bar
 * Supports multiple tag selection, active states, and clear filters functionality
 */
export function TagFilterPills() {
  const [activeTagFilters, setActiveTagFilters] = React.useState<string[]>([]);

  // Mock available tags
  const availableTags = useMemo(() => [
    'documentation',
    'tutorial',
    'reference',
    'example',
    'advanced',
    'beginner',
    'css',
    'javascript',
    'react',
    'typescript'
  ], []);

  // Get count of active filters for clear button
  const activeFilterCount = useMemo(() =>
    activeTagFilters.length,
    [activeTagFilters]
  );

  // Handle tag click with keyboard support
  const handleTagClick = useCallback((tag: string) => {
    setActiveTagFilters(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Handle keyboard navigation for tag pills
  const handleTagKeyDown = useCallback((event: React.KeyboardEvent, tag: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTagClick(tag);
    }
  }, [handleTagClick]);

  // Handle clear filters keyboard support
  const handleClearKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveTagFilters([]);
    } else if (event.key === 'Escape') {
      setActiveTagFilters([]);
    }
  }, []);

  // Clear all filters
  const clearAllTagFilters = useCallback(() => {
    setActiveTagFilters([]);
  }, []);

  // Don't render if no tags available
  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div
      className="p-6 border-b border-neutral-700"
      role="region"
      aria-label="Tag filters"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Tag filter pills */}
        {availableTags.map((tag) => {
          const isActive = activeTagFilters.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              onKeyDown={(e) => handleTagKeyDown(e, tag)}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                  : 'bg-neutral-700 text-neutral-300 border border-transparent hover:bg-neutral-600 hover:text-neutral-200'
              }`}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={`Filter by ${tag} tag. ${isActive ? 'Currently active' : 'Currently inactive'}. Click to ${isActive ? 'deactivate' : 'activate'}.`}
              data-testid={`tag-filter-${tag}`}
            >
              #{tag}
            </button>
          );
        })}

        {/* Clear filters button - only show when filters are active */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllTagFilters}
            onKeyDown={handleClearKeyDown}
            className="inline-flex items-center gap-1 px-2 py-0.5 ml-2 text-xs bg-neutral-600 text-neutral-300 rounded-full hover:bg-neutral-500 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            role="button"
            tabIndex={0}
            aria-label={`Clear all ${activeFilterCount} active tag filters`}
            data-testid="clear-tag-filters"
          >
            <X size={12} aria-hidden="true" />
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Screen reader only instructions */}
      <div className="sr-only" id="tag-filter-instructions">
        Use Tab to navigate between tag filters. Press Enter or Space to toggle filters.
        Press Escape on the Clear button to clear all filters.
        {activeFilterCount > 0 && ` ${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} currently active.`}
      </div>
    </div>
  );
}