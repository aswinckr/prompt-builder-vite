import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, TrendingUp, Clock, DollarSign, Cpu, BarChart3, Calendar } from 'lucide-react';
import { ConversationStats as IConversationStats } from '../types/Conversation';
import { useLibraryActions } from '../contexts/LibraryContext';

interface ConversationStatsProps {
  className?: string;
}

export function ConversationStats({ className = '' }: ConversationStatsProps) {
  const [stats, setStats] = useState<IConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getConversationStats } = useLibraryActions();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getConversationStats();

        if (result.data) {
          setStats(result.data);
        } else {
          setError(result.error || 'Failed to load statistics');
        }
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getConversationStats]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Conversation Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-neutral-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Conversation Statistics
        </h3>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">Failed to load statistics: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate derived metrics
  const avgTokensPerConversation = stats.total_conversations > 0
    ? Math.round(stats.total_tokens / stats.total_conversations)
    : 0;

  const avgCostPerConversation = stats.total_conversations > 0
    ? stats.total_cost / stats.total_conversations
    : 0;

  const avgMessagesPerConversation = stats.total_conversations > 0
    ? Math.round(stats.total_messages / stats.total_conversations)
    : 0;

  const favoritePercentage = stats.total_conversations > 0
    ? Math.round((stats.favorite_conversations / stats.total_conversations) * 100)
    : 0;

  const StatCard = ({ icon: Icon, label, value, color = 'blue', format }: {
    icon: any;
    label: string;
    value: number | string;
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    format?: (value: number) => string;
  }) => {
    const colorClasses = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
      red: 'text-red-400'
    };

    return (
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
          <span className="text-sm text-neutral-400">{label}</span>
        </div>
        <div className={`text-2xl font-bold text-white ${colorClasses[color]}`}>
          {format ? format(Number(value)) : value}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Conversation Statistics
        </h3>
        <div className="text-xs text-neutral-500">
          <Calendar className="inline w-3 h-3 mr-1" />
          All time
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Total Conversations"
          value={stats.total_conversations}
          color="blue"
        />

        <StatCard
          icon={Star}
          label="Favorite Conversations"
          value={stats.favorite_conversations}
          color="yellow"
        />

        <StatCard
          icon={TrendingUp}
          label="Total Tokens"
          value={stats.total_tokens}
          color="green"
          format={(value) => value.toLocaleString()}
        />

        <StatCard
          icon={DollarSign}
          label="Total Cost"
          value={stats.total_cost}
          color="purple"
          format={(value) => `$${value.toFixed(4)}`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Total Messages"
          value={stats.total_messages}
          color="blue"
          format={(value) => value.toLocaleString()}
        />

        <StatCard
          icon={TrendingUp}
          label="Avg Tokens/Conversation"
          value={avgTokensPerConversation}
          color="green"
          format={(value) => value.toLocaleString()}
        />

        <StatCard
          icon={MessageSquare}
          label="Avg Messages/Conversation"
          value={avgMessagesPerConversation}
          color="blue"
        />

        <StatCard
          icon={DollarSign}
          label="Avg Cost/Conversation"
          value={avgCostPerConversation}
          color="purple"
          format={(value) => `$${value.toFixed(4)}`}
        />
      </div>

      {/* Insights Section */}
      <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-neutral-300">
              {favoritePercentage}% of conversations are marked as favorites
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-neutral-300">
              Average of {avgTokensPerConversation.toLocaleString()} tokens per conversation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-neutral-300">
              {stats.total_messages.toLocaleString()} total messages exchanged
            </span>
          </div>
        </div>
      </div>

      {/* Empty State for No Data */}
      {stats.total_conversations === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No conversation data yet</h3>
          <p className="text-neutral-400 text-sm">
            Start having conversations with AI models to see your statistics here.
          </p>
        </div>
      )}
    </div>
  );
}