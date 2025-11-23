import React, { useState, useMemo } from 'react';
import { Search, Calendar, Hash, Play, Edit, Trash2, FileText } from 'lucide-react';
import { SavedPrompt } from '../types/SavedPrompt';
import { EditPromptModal } from './EditPromptModal';

interface SavedPromptListProps {
  selectedProject: string;
  prompts?: SavedPrompt[];
  onPromptUpdate?: (prompt: SavedPrompt) => void;
  onPromptDelete?: (promptId: number) => void;
  onPromptLoad?: (promptId: number) => void;
}

export function SavedPromptList({
  selectedProject,
  prompts,
  onPromptUpdate,
  onPromptDelete,
  onPromptLoad
}: SavedPromptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = [...(prompts || [])];

    console.log('SavedPromptList - selectedProject:', selectedProject);
    console.log('SavedPromptList - all prompts:', filtered.length);

    // Filter by selected project
    const filteredByProject = filtered.filter(prompt => prompt.projectId === selectedProject);
    console.log('SavedPromptList - filtered prompts count:', filteredByProject.length);
    console.log('SavedPromptList - filtered prompts:', filteredByProject.map(p => ({ id: p.id, title: p.title, projectId: p.projectId })));

    filtered = filteredByProject;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title?.toLowerCase().includes(query) ||
        prompt.description?.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by date
    if (selectedDate !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (selectedDate) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(prompt =>
        prompt.createdAt >= filterDate
      );
    }

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [prompts, selectedProject, searchQuery, selectedDate, sortBy]);

  const handleLoadPrompt = (promptId: number) => {
    console.log('Loading prompt:', promptId);
    onPromptLoad?.(promptId);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    console.log('Editing prompt:', prompt.id);
    setEditingPrompt(prompt);
  };

  const handleSavePrompt = async (updatedPrompt: Partial<SavedPrompt>) => {
    if (!editingPrompt) return;

    setIsSaving(true);
    try {
      const promptToSave: SavedPrompt = {
        ...editingPrompt,
        ...updatedPrompt,
        updatedAt: new Date(),
      };

      // Call the parent's update handler
      onPromptUpdate?.(promptToSave);

      setEditingPrompt(null);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      // Handle error state - could show toast/alert
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePrompt = async (promptId: number) => {
    console.log('Deleting prompt:', promptId);
    onPromptDelete?.(promptId);
  };

  const handleCloseEditModal = () => {
    setEditingPrompt(null);
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Filters and Controls */}
        <div className="border-b border-neutral-700 p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="date-filter" className="text-sm text-neutral-400">
                Date:
              </label>
              <select
                id="date-filter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm text-neutral-400">
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
                className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="updated">Last updated</option>
                <option value="created">Created</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Results count */}
            <div className="text-sm text-neutral-400">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
            </div>
          </div>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPrompts.length === 0 ? (
            <div className="text-center text-neutral-400 mt-8">
              <div className="text-lg mb-2">No saved prompts found</div>
              <div className="text-sm">Try adjusting your search or filters</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:bg-neutral-750 transition-colors"
                >
                  {/* Prompt Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText size={18} className="text-neutral-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{prompt.title}</h3>
                        {prompt.description && (
                          <p className="text-sm text-neutral-300 mb-2">{prompt.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleLoadPrompt(prompt.id)}
                        className="p-2 rounded hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Load prompt"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="p-2 rounded hover:bg-neutral-600 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Edit prompt"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-2 rounded hover:bg-red-600/20 text-neutral-400 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Delete prompt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-700 text-neutral-300"
                      >
                        <Hash size={10} className="text-neutral-400" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Updated {prompt.updatedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Created {prompt.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EditPromptModal */}
      <EditPromptModal
        isOpen={!!editingPrompt}
        onClose={handleCloseEditModal}
        onSave={handleSavePrompt}
        prompt={editingPrompt}
        isLoading={isSaving}
      />
    </>
  );
}