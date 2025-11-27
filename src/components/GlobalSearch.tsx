import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalSearchService } from '../services/globalSearchService';
import { createDebouncedCallback } from '../utils/debounceUtils';
import { GlobalSearchResponse, SearchResult, SearchCategory } from '../types/globalSearch';
import { SearchResultsList } from './SearchResultsList';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({
  className = '',
  placeholder = 'Search everywhere'
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Create debounced search callback with proper cleanup
  const { debouncedCallback: performSearch, cleanup } = useMemo(
    () => createDebouncedCallback(async (searchQuery: string) => {
      // Early return for empty queries
      if (!searchQuery.trim()) {
        setSearchResults(null);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await GlobalSearchService.searchEverywhere(searchQuery);
        setSearchResults(results);
        setIsOpen(results.totalResults > 0);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
        setIsOpen(false);
        setHighlightedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input changes with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    performSearch(value);
  }, [performSearch]);

  // Get all results for navigation - memoized for performance
  const flatResults = useMemo(() => {
    return searchResults?.results.flatMap(group => group.results) || [];
  }, [searchResults]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    const totalResults = flatResults.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev + 1;
          return next < totalResults ? next : prev;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev - 1;
          return next >= -1 ? next : -1;
        });
        break;

      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && flatResults[highlightedIndex]) {
          handleResultClick(flatResults[highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, flatResults, highlightedIndex, setQuery]);

  // Handle result clicks - memoized for performance
  const handleResultClick = useCallback((result: SearchResult) => {
    const route = result.type === SearchCategory.PROMPT ? '/prompt' : '/knowledge';
    const searchParams = new URLSearchParams({
      q: query,
      id: result.id
    });

    navigate(`${route}?${searchParams.toString()}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [navigate, query]);

  // Handle click outside to close dropdown - memoized for performance
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, []);

  // Handle focus to show dropdown if there are results
  const handleFocus = useCallback(() => {
    if (searchResults && searchResults.totalResults > 0) {
      setIsOpen(true);
    }
  }, [searchResults]);

  // Set up click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Cleanup debounced callback on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Close dropdown when component unmounts
  useEffect(() => {
    return () => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
          size={18}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
          aria-label="Search everywhere"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
          <SearchResultsList
            searchResults={searchResults}
            isLoading={isLoading}
            highlightedIndex={highlightedIndex}
            onResultClick={handleResultClick}
          />
        </div>
      )}
    </div>
  );
}