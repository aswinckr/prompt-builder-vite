import React, { useState, useMemo } from 'react';
import { Play, Edit, Trash2 } from 'lucide-react';
import { SavedPrompt } from '../types/SavedPrompt';
import { EditPromptModal } from './EditPromptModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { useLibraryActions } from '../contexts/LibraryContext';
import { handleCrudResult, logError } from '../utils/errorHandling';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  }, [prompts, selectedProject, selectedDate, sortBy]);

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

      const crudResult = handleCrudResult(result, 'Prompt updated');

      if (crudResult.success) {
        // Note: LibraryContext already handles data refresh via refreshAllData()
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
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="date-filter" className="text-sm text-neutral-400">
                Date:
              </label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm text-neutral-400">
                Sort by:
              </label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'updated' | 'created' | 'title')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="h-full transition-all hover:border-purple-500/30 hover:bg-purple-500/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <h3 className="font-medium line-clamp-2 leading-tight text-white flex-1">
                      {prompt.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadPrompt(prompt.id);
                        }}
                        className="h-6 w-6 p-0 text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10"
                        aria-label={`Load ${prompt.title}`}
                      >
                        <Play size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPrompt(prompt);
                        }}
                        className="h-6 w-6 p-0 text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10"
                        aria-label={`Edit ${prompt.title}`}
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(prompt);
                        }}
                        className="h-6 w-6 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                        aria-label={`Delete ${prompt.title}`}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    {/* Description - takes up remaining space */}
                    <div className="flex-1">
                      {prompt.description ? (
                        <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                          {prompt.description}
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed italic">
                          No description available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
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