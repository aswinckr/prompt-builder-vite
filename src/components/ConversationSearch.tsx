import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, Clock, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { ConversationSearchResult } from '../types/Conversation';
import { useLibraryActions } from '../contexts/LibraryContext';
import { createDebouncedCallback } from '../utils/debounceUtils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationSearchProps {
  onConversationSelect?: (conversationId: string) => void;
  className?: string;
}

export function ConversationSearch({ onConversationSelect, className = '' }: ConversationSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ConversationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const { searchConversations } = useLibraryActions();

  // Create debounced search callback
  const { debouncedCallback: performSearch, cleanup } = useMemo(
    () => createDebouncedCallback(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await searchConversations(searchQuery, { limit: 10 });
        if (result.data) {
          setSearchResults(result.data);
          setIsOpen(result.data.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [searchConversations]
  );

  // Handle input changes with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    performSearch(value);
  }, [performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev + 1;
          return next < searchResults.length ? next : prev;
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
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          handleResultClick(searchResults[highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setQuery('');
        break;
    }
  }, [isOpen, searchResults, highlightedIndex]);

  // Handle result clicks
  const handleResultClick = useCallback((result: ConversationSearchResult) => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onConversationSelect?.(result.id);
  }, [onConversationSelect]);

  // Handle click outside to close
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.conversation-search-container')) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, []);

  // Set up click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Get search relevance color based on rank
  const getRelevanceColor = (rank: number) => {
    if (rank <= 0.3) return 'text-green-400';
    if (rank <= 0.6) return 'text-yellow-400';
    return 'text-neutral-400';
  };

  // Get search term highlighting
  const getHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-500/20 text-yellow-300 px-0.5 rounded">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className={`conversation-search-container relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search conversations..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          aria-label="Search conversations"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          role="combobox"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-600 border-t-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.length === 0 && !isLoading && query ? (
            <div className="p-4 text-center text-neutral-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Try different search terms</p>
            </div>
          ) : (
            <ul className="py-2" role="listbox">
              {searchResults.map((result, index) => (
                <li
                  key={result.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    highlightedIndex === index
                      ? 'bg-neutral-700/50 border-l-2 border-blue-500'
                      : 'hover:bg-neutral-700/30'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title with highlighting */}
                      <h4 className="font-medium text-white text-sm mb-1 truncate">
                        {getHighlightedText(result.title, query)}
                      </h4>

                      {/* Description with highlighting */}
                      {result.description && (
                        <p className="text-xs text-neutral-300 line-clamp-2 mb-2">
                          {getHighlightedText(result.description, query)}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{result.model_name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(result.updated_at), { addSuffix: true })}</span>
                        </div>

                        {result.is_favorite && (
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </div>

                    {/* Relevance Indicator */}
                    <div className="flex-shrink-0">
                      <TrendingUp className={`w-4 h-4 ${getRelevanceColor(result.rank)}`} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Search Footer */}
          {searchResults.length > 0 && (
            <div className="border-t border-neutral-700 px-4 py-2 text-xs text-neutral-500">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}