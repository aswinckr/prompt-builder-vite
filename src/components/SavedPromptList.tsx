import React, { useState, useMemo } from 'react';
import { Search, Calendar, Hash, Play, Edit, Trash2, FileText } from 'lucide-react';
import { SavedPrompt } from '../types/SavedPrompt';
import { EditPromptModal } from './EditPromptModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { useLibraryActions } from '../contexts/LibraryContext';
import { handleCrudResult, logError } from '../utils/errorHandling';

interface SavedPromptListProps {
  selectedProject: string;
  prompts?: SavedPrompt[];
  onPromptUpdate?: (prompt: SavedPrompt) => void;
  onPromptDelete?: (promptId: string) => void;
  onPromptLoad?: (promptId: string) => void;
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<SavedPrompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const { deleteSavedPrompt, updateSavedPrompt } = useLibraryActions();

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = [...(prompts || [])];

    // Filter by selected project
    filtered = filtered.filter(prompt => prompt.project_id === selectedProject);

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
        prompt.created_at >= filterDate
      );
    }

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [prompts, selectedProject, searchQuery, selectedDate, sortBy]);

  const handleLoadPrompt = (promptId: string) => {
    onPromptLoad?.(promptId);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt);
  };

  const handleSavePrompt = async (updatedPrompt: Partial<SavedPrompt>) => {
    if (!editingPrompt) return;

    setIsSaving(true);
    try {
      const promptToSave: SavedPrompt = {
        ...editingPrompt,
        ...updatedPrompt,
        updated_at: new Date(),
      };

      // Use LibraryContext action for consistency
      const result = await updateSavedPrompt(editingPrompt.id, promptToSave);

      const crudResult = handleCrudResult(result, 'Prompt updated', promptToSave.title);

      if (crudResult.success) {
        // Call the parent's update handler for backward compatibility
        onPromptUpdate?.(promptToSave);
        showToast(crudResult.message, 'success');
        setEditingPrompt(null);
      } else {
        showToast(crudResult.message, 'error');
        logError('Prompt Update', result.error, { promptId: editingPrompt.id, title: promptToSave.title });
      }
    } catch (error) {
      logError('Prompt Update Exception', error, { promptId: editingPrompt.id });
      showToast('Failed to update prompt. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (prompt: SavedPrompt) => {
    setPromptToDelete(prompt);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    try {
      // Use LibraryContext action for consistency
      const result = await deleteSavedPrompt(promptToDelete.id);

      const crudResult = handleCrudResult(result, 'Prompt deleted', promptToDelete.title, {
        expectsData: false,
        customMessage: 'Prompt {itemTitle} deleted'
      });

      if (crudResult.success) {
        // Call the parent's delete handler for backward compatibility
        onPromptDelete?.(promptToDelete.id);
        showToast(crudResult.message, 'success');
      } else {
        showToast(crudResult.message, crudResult.shouldRetry ? 'warning' : 'error');
        logError('Prompt Delete', result.error, { promptId: promptToDelete.id, title: promptToDelete.title });
      }
    } catch (error) {
      logError('Prompt Delete Exception', error, { promptId: promptToDelete.id, title: promptToDelete.title });
      showToast('Failed to delete prompt. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setPromptToDelete(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditingPrompt(null);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setPromptToDelete(null);
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
                        onClick={() => handleDeleteClick(prompt)}
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
                      Updated {prompt.updated_at.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Created {prompt.created_at.toLocaleDateString()}</span>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Prompt"
        message={`Are you sure you want to delete '${promptToDelete?.title || 'this prompt'}'? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />
    </>
  );
}