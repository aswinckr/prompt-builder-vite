import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, MessageSquare, Cpu, Clock, TrendingUp, MoreHorizontal, ChevronRight, Star, AlertCircle } from 'lucide-react';
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
  className = "h-full flex flex-col bg-neutral-900"
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

  const getConversationPreview = (conversation: Conversation) => {
    // Show first 100 characters of description or original prompt
    const content = conversation.description || conversation.original_prompt_content || '';
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  const getTokenUsageColor = (tokens: number) => {
    if (tokens > 10000) return 'text-red-400';
    if (tokens > 5000) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className={className}>
      {/* Simplified Header with Search Only */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          {/* Title and Conversation Count - only show title if provided */}
          {title && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  {title}
                </h1>
                <p className="text-neutral-400 mt-1">
                  {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Error Alert */}
          {navigationError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 max-w-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{navigationError}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading || syncLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-600 border-t-blue-500"></div>
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
                className="group bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 hover:border-neutral-600 rounded-lg transition-all cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                          {conversation.title}
                        </h3>
                        {conversation.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          conversation.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-neutral-700/50 text-neutral-400'
                        }`}>
                          {conversation.status}
                        </span>
                      </div>

                      {/* Description/Preview */}
                      <p className="text-sm text-neutral-300 line-clamp-2">
                        {getConversationPreview(conversation)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleMoreButtonClick(e, conversation)}
                        className="p-1.5 hover:bg-neutral-600 rounded-md text-neutral-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-4">
                      {/* Model Info */}
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span>{conversation.model_name}</span>
                      </div>

                      {/* Token Usage */}
                      <div className={`flex items-center gap-1 ${getTokenUsageColor(conversation.token_usage)}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{conversation.token_usage.toLocaleString()} tokens</span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.round(conversation.execution_duration_ms / 1000)}s</span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Cost Indicator (if significant) */}
                  {conversation.estimated_cost > 0.001 && (
                    <div className="mt-2 text-xs text-neutral-500">
                      Estimated cost: ${(conversation.estimated_cost).toFixed(4)}
                    </div>
                  )}
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