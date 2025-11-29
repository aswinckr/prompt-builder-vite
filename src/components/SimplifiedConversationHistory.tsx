import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MessageSquare, MoreHorizontal, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { Conversation } from '../types/Conversation';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { ConversationSearch } from './ConversationSearch';
import { ConversationActions } from './ConversationActions';
import { formatDistanceToNow } from 'date-fns';

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SimplifiedConversationHistoryProps {
  // Optional prop to customize title for modal usage
  title?: string;
  // Optional prop to customize container styling for modal usage
  className?: string;
}

export function SimplifiedConversationHistory({
  title,
  className = "h-full flex flex-col bg-sidebar"
}: SimplifiedConversationHistoryProps) {
  const navigate = useNavigate();
  const { conversations, loading, syncLoading } = useLibraryState();
  const { searchConversations } = useLibraryActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  // Search optimization: caching and request cancellation
  const searchCacheRef = useRef<Map<string, Conversation[]>>(new Map());
  const searchRequestRef = useRef<string | null>(null);

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort conversations (search only)
  const filteredConversations = useMemo(() => {
    let filtered = [...(conversations || [])];

    // Apply search filter using debounced query
    if (debouncedSearchQuery.trim()) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        conv.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        conv.model_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Sort by most recently updated
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return filtered;
  }, [conversations, debouncedSearchQuery]);

  const handleConversationClick = useCallback((conversationId: string) => {
    // Clear any previous errors
    setNavigationError(null);

    // Validate conversation ID before navigation
    if (!conversationId || typeof conversationId !== 'string') {
      setNavigationError('Invalid conversation ID. Please try again.');
      setTimeout(() => setNavigationError(null), 5000);
      return;
    }

    try {
      navigate(`/history/${conversationId}`);
    } catch (error) {
      // This is defensive - navigate() is synchronous but we catch any unexpected errors
      console.error('Unexpected navigation error:', error);
      setNavigationError('Navigation failed. Please try again.');
      setTimeout(() => setNavigationError(null), 5000);
    }
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleMoreButtonClick = useCallback((e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
  }, []);

  const handleActionsModalClose = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  // Effect to trigger search when debounced query changes with caching
  useEffect(() => {
    const query = debouncedSearchQuery.trim();

    if (!query) {
      return;
    }

    // Cancel previous request reference
    const previousRequest = searchRequestRef.current;
    searchRequestRef.current = query;

    // Check cache first
    const cacheKey = query.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      // Cached result available, no need to make API call
      return;
    }

    // Make API call if not in cache
    const performSearch = async () => {
      try {
        await searchConversations(query);

        // Cache the result after successful search
        // Note: In a real implementation, you'd want to cache the actual search results
        // For now, we cache the query to prevent duplicate requests
        searchCacheRef.current.set(cacheKey, []);

        // Limit cache size to prevent memory leaks
        if (searchCacheRef.current.size > 50) {
          const firstKey = searchCacheRef.current.keys().next().value;
          if (firstKey) {
            searchCacheRef.current.delete(firstKey);
          }
        }
      } catch (error) {
        console.error('Search failed:', error);
        // Remove from cache if search failed
        searchCacheRef.current.delete(cacheKey);
      }
    };

    // Only perform search if this is still the latest request
    if (searchRequestRef.current === query) {
      performSearch();
    }

    // Cleanup function to cancel request if component unmounts or query changes
    return () => {
      if (searchRequestRef.current === query) {
        searchRequestRef.current = null;
      }
    };
  }, [debouncedSearchQuery, searchConversations]);

  
  
  return (
    <div className={className}>
      {/* Search and Error Section - no border to align with drawer title */}
      <div className="p-6 pb-3 space-y-3">
        {/* Navigation Error Alert */}
        {navigationError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{navigationError}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sidebar-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-sidebar-accent border border-sidebar-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-sidebar-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Conversation List - reduced top padding */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading || syncLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-600 border-t-primary"></div>
              Loading conversations...
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className="w-12 h-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No conversations found</h3>
            <p className="text-neutral-400 max-w-md">
              {searchQuery ? 'Try adjusting your search terms' : 'Your conversation history will appear here once you start chatting with AI models.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group bg-card hover:bg-accent border border-border hover:border-primary/50 rounded-lg transition-all cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {conversation.title}
                        </h3>
                        {conversation.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleMoreButtonClick(e, conversation)}
                        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions Modal */}
      {selectedConversation && (
        <ConversationActions
          conversation={selectedConversation}
          isOpen={!!selectedConversation}
          onClose={handleActionsModalClose}
        />
      )}
    </div>
  );
}