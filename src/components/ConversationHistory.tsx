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
    <div className="h-full flex flex-col bg-card text-foreground">
      {/* Header with Search and Controls */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="p-6 space-y-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary" />
                Conversation History
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Stats
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-muted border border-input rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-border p-6">
            <ConversationFilters />
          </div>
        )}

        {/* Stats Panel */}
        {showStats && (
          <div className="border-t border-border p-6">
            <ConversationStats />
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading || syncLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted border-t-primary"></div>
              Loading conversations...
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MessageSquare className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No conversations found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery ? 'Try adjusting your search terms' : 'Your conversation history will appear here once you start chatting with AI models.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group bg-card hover:bg-card/80 border border-border hover:border-border/80 rounded-lg transition-all cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {conversation.title}
                        </h3>
                        {conversation.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          conversation.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {conversation.status}
                        </span>
                      </div>

                      {/* Description/Preview */}
                      <p className="text-sm text-card-foreground line-clamp-2">
                        {getConversationPreview(conversation)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConversation(conversation);
                        }}
                        className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                    <div className="mt-2 text-xs text-muted-foreground">
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