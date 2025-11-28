import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Filter, Star, MessageSquare, Cpu, Clock, TrendingUp, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Conversation } from '../types/Conversation';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { ConversationSearch } from './ConversationSearch';
import { ConversationFilters } from './ConversationFilters';
import { ConversationActions } from './ConversationActions';
import { ConversationStats } from './ConversationStats';
import { formatDistanceToNow } from 'date-fns';

export function ConversationHistory() {
  const navigate = useNavigate();
  const { conversations, loading, syncLoading } = useLibraryState();
  const { searchConversations } = useLibraryActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...(conversations || [])];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.model_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by most recently updated
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return filtered;
  }, [conversations, searchQuery]);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/history/${conversationId}`);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchConversations(query);
    }
  };

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
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header with Search and Controls */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Conversation History
              </h1>
              <p className="text-neutral-400 mt-1">
                {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Stats
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

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

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-neutral-800 p-6">
            <ConversationFilters />
          </div>
        )}

        {/* Stats Panel */}
        {showStats && (
          <div className="border-t border-neutral-800 p-6">
            <ConversationStats />
          </div>
        )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConversation(conversation);
                        }}
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
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}