import React, { useState } from "react";
import { Modal } from "./Modal";
import { TipTapEditor } from "./TipTapEditor";
import { useLibraryActions, useLibraryState } from "../contexts/LibraryContext";

interface CreateContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId?: string | null;
}

/**
 * Modal for creating new context blocks
 */
export function CreateContextModal({
  isOpen,
  onClose,
  selectedProjectId,
}: CreateContextModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<{ html: string; json: any; text: string }>({
    html: '',
    json: null,
    text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createContextBlock } = useLibraryActions();

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent({ html: '', json: null, text: '' });
      setError('');
    }
  }, [isOpen]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return title.trim() !== '' || content.text.trim() !== '';
  };

  // Handle close attempt with unsaved changes check
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm('Are you sure you want to discard your changes? Any data you entered will be lost.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.text.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createContextBlock({
        title: title.trim(),
        content: content.text, // Use plain text instead of HTML
        tags: [], // Empty tags for now - could be added later
        project_id: selectedProjectId || null, // Use the selected project ID
      });

      onClose();
      // Show success message could be handled by parent component
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create context block');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title="Add Knowledge"
      size="lg"
      mobileBehavior="fullscreen"
      aria-labelledby="create-context-modal-title"
    >
      <div className="p-6" onKeyDown={handleKeyDown}>
        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label htmlFor="context-title" className="block text-sm font-medium text-neutral-300 mb-2">
              Title *
            </label>
            <input
              id="context-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for this knowledge block"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
              aria-required="true"
              aria-describedby="title-description"
            />
            <p id="title-description" className="mt-1 text-xs text-neutral-500">
              A brief title to help you identify this knowledge block
            </p>
          </div>

          {/* Content Editor */}
          <div>
            <label htmlFor="context-content" className="block text-sm font-medium text-neutral-300 mb-2">
              Content *
            </label>
            <div className="min-h-[300px]" id="context-content">
              <TipTapEditor
                content={content.html}
                onUpdate={setContent}
                placeholder="Add your knowledge content here..."
                editable={true}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Rich text editor supports formatting, lists, code blocks, and more
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-neutral-700">
          <p className="text-xs text-neutral-500">
            Press ⌘+Enter to save
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseAttempt}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !title.trim() || !content.text.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-neutral-600 disabled:to-neutral-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  Add Knowledge
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}