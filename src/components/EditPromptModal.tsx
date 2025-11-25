import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { TipTapEditor } from './TipTapEditor';
import { useToast } from '../contexts/ToastContext';
import { SavedPrompt } from '../types/SavedPrompt';

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Partial<SavedPrompt>) => void;
  prompt: SavedPrompt | null;
  isLoading?: boolean;
}

interface EditorContent {
  html: string;
  json: any;
  text: string;
}

/**
 * EditPromptModal component for editing saved prompts with rich text editor
 */
export function EditPromptModal({
  isOpen,
  onClose,
  onSave,
  prompt,
  isLoading = false
}: EditPromptModalProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when prompt changes
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content || prompt.description || '');
      setHasChanges(false);
    }
  }, [prompt]);

  // Track changes for confirmation dialog
  useEffect(() => {
    if (prompt) {
      const titleChanged = title !== prompt.title;
      const contentChanged = content !== (prompt.content || prompt.description || '');
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, content, prompt]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title for the prompt', 'error');
      return;
    }

    if (prompt) {
      setIsSubmitting(true);
      try {
        const promptData: Partial<SavedPrompt> = {
          ...prompt,
          title: title.trim(),
          content: content.trim(),
          description: content.trim(), // Keep description for backward compatibility
          updated_at: new Date(),
        };

        await onSave(promptData);
        showToast(`Prompt '${title.trim()}' updated successfully`, 'success');
        onClose();
      } catch (error) {
        console.error('Failed to save prompt:', error);
        showToast('Failed to update prompt. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (hasChanges && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleDiscardChanges = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const handleContentUpdate = (newContent: EditorContent) => {
    setContent(newContent.html);
  };

  const confirmDialog = showConfirmDialog && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md mx-4 border border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Discard changes?</h3>
        <p className="text-neutral-300 mb-6">You have unsaved changes. Are you sure you want to close without saving?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDiscardChanges}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Edit Prompt"
        size="lg"
        mobileBehavior="fullscreen"
        closeOnOverlayClick={!hasChanges}
        closeOnEscape={!hasChanges}
      >
        <div className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="prompt-title" className="block text-sm font-medium text-neutral-300 mb-2">
              Title
            </label>
            <input
              id="prompt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={isSubmitting || isLoading}
            />
            {!title.trim() && (
              <p className="mt-1 text-sm text-red-400">Title is required</p>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Content
            </label>
            <TipTapEditor
              content={content}
              onUpdate={handleContentUpdate}
              editable={!isSubmitting && !isLoading}
              placeholder="Write your prompt content here..."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-700">
            <button
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || isLoading || !title.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {confirmDialog}
    </>
  );
}