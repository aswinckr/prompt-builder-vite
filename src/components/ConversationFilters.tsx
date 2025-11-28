import React, { useState } from 'react';
import { X, Calendar, Cpu, Star, Folder } from 'lucide-react';
import { ConversationFilters as IConversationFilters } from '../types/Conversation';

interface ConversationFiltersProps {
  filters?: IConversationFilters;
  onFiltersChange?: (filters: IConversationFilters) => void;
}

export function ConversationFilters({ filters = {}, onFiltersChange }: ConversationFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IConversationFilters>(filters);

  const handleFilterChange = (key: keyof IConversationFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: IConversationFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value =>
    value !== undefined && value !== null && value !== '' && value !== false
  );

  // Common model options
  const modelOptions = [
    { value: '', label: 'All Models' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro' },
  ];

  // Date range options
  const dateRangeOptions = [
    { value: '', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'quarter', label: 'This quarter' },
    { value: 'year', label: 'This year' },
  ];

  const handleDateRangeChange = (range: string) => {
    let dateFrom: Date | undefined;
    const now = new Date();

    switch (range) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarter':
        dateFrom = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
        break;
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1);
        break;
    }

    handleFilterChange('date_from', dateFrom);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            <Cpu className="inline w-3 h-3 mr-1" />
            Model
          </label>
          <select
            value={localFilters.model_name || ''}
            onChange={(e) => handleFilterChange('model_name', e.target.value || undefined)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            {modelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            <Calendar className="inline w-3 h-3 mr-1" />
            Date Range
          </label>
          <select
            value={(() => {
              const dateFrom = localFilters.date_from;
              if (!dateFrom) return '';

              const now = new Date();
              const diffDays = Math.floor((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays <= 1) return 'today';
              if (diffDays <= 7) return 'week';
              if (diffDays <= 30) return 'month';
              if (diffDays <= 90) return 'quarter';
              if (diffDays <= 365) return 'year';
              return '';
            })()}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value as any || undefined)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Favorites Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            <Star className="inline w-3 h-3 mr-1" />
            Favorites
          </label>
          <select
            value={localFilters.is_favorite === undefined ? '' : localFilters.is_favorite.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('is_favorite', value === '' ? undefined : value === 'true');
            }}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="">All conversations</option>
            <option value="true">Favorites only</option>
            <option value="false">Non-favorites</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range (if needed) */}
      {localFilters.date_from && (
        <div className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-lg">
          <span className="text-sm text-neutral-400">Custom date range active</span>
          <button
            onClick={() => handleFilterChange('date_from', undefined)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {localFilters.model_name && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md flex items-center gap-1">
              Model: {localFilters.model_name}
              <button
                onClick={() => handleFilterChange('model_name', undefined)}
                className="hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {localFilters.status && (
            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md flex items-center gap-1">
              Status: {localFilters.status}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {localFilters.is_favorite !== undefined && (
            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-md flex items-center gap-1">
              {localFilters.is_favorite ? 'Favorites' : 'Non-favorites'}
              <button
                onClick={() => handleFilterChange('is_favorite', undefined)}
                className="hover:text-yellow-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}