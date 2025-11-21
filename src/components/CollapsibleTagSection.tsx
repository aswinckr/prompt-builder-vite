import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TagFilterPills } from './TagFilterPills';

// Storage key for collapsed state
const COLLAPSED_STATE_KEY = 'tag-section-collapsed';

/**
 * Collapsible wrapper for the TagFilterPills component
 * Provides expand/collapse functionality with persistent state
 */
export function CollapsibleTagSection() {
  // Initialize collapsed state from localStorage, defaulting to collapsed
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_STATE_KEY);
      if (stored === null) {
        // First load - default to collapsed
        return true;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to load collapsed state from localStorage:', error);
      return true; // Default to collapsed on error
    }
  });

  // Persist collapsed state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STATE_KEY, JSON.stringify(isCollapsed));
    } catch (error) {
      console.warn('Failed to save collapsed state to localStorage:', error);
    }
  }, [isCollapsed]);

  // Handle toggle with keyboard support
  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <div className="border-b border-neutral-700">
      {/* Collapsible header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center gap-2 px-6 py-3 text-left hover:bg-neutral-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
        aria-expanded={!isCollapsed}
        aria-controls="tag-filter-section"
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} tag filters`}
        data-testid="tag-section-toggle"
      >
        {/* Chevron icon */}
        <span
          className="transition-transform duration-200"
          style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
          aria-hidden="true"
        >
          <ChevronRight size={16} className="text-neutral-400" />
        </span>

        {/* Section title */}
        <span className="text-sm font-medium text-neutral-300">
          Filter by Tags
        </span>
      </button>

      {/* Collapsible content with smooth transition */}
      <div
        id="tag-filter-section"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0' : 'max-h-96'
        }`}
        aria-hidden={isCollapsed}
      >
        <TagFilterPills />
      </div>
    </div>
  );
}