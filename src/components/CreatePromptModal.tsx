import React, { useState } from "react";
import { Modal } from "./Modal";
import { TipTapEditor } from "./TipTapEditor";
import { VariablePlaceholderHelper } from "./VariablePlaceholderHelper";
import { useLibraryActions } from "../contexts/LibraryContext";

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId?: string | null;
}

/**
 * Modal for creating new prompt templates
 */
export function CreatePromptModal({
  isOpen,
  onClose,
  selectedProjectId,
}: CreatePromptModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState<{ html: string; json: any; text: string }>({
    html: '',
    json: null,
    text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createSavedPrompt } = useLibraryActions();

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setContent({ html: '', json: null, text: '' });
      setError('');
    }
  }, [isOpen]);

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
      await createSavedPrompt({
        title: title.trim(),
        description: description.trim() || null,
        content: content.text, // Use plain text instead of HTML
        project_id: selectedProjectId || null, // Use the selected project ID
        tags: [], // Empty tags for now - could be added later
      });

      onClose();
      // Show success message could be handled by parent component
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create prompt');
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
      onClose={onClose}
      title="Add Prompt"
      size="lg"
      mobileBehavior="fullscreen"
      aria-labelledby="create-prompt-modal-title"
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
            <label htmlFor="prompt-title" className="block text-sm font-medium text-neutral-300 mb-2">
              Title *
            </label>
            <input
              id="prompt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for this prompt template"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              aria-required="true"
              aria-describedby="title-description"
            />
            <p id="title-description" className="mt-1 text-xs text-neutral-500">
              A brief title to help you identify this prompt template
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="prompt-description" className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              id="prompt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description about how to use this prompt (optional)"
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              aria-describedby="description-description"
            />
            <p id="description-description" className="mt-1 text-xs text-neutral-500">
              Additional context about when and how to use this prompt template
            </p>
          </div>

          {/* Content Editor */}
          <div>
            <label htmlFor="prompt-content" className="block text-sm font-medium text-neutral-300 mb-2">
              Content *
            </label>
            <div className="min-h-[300px]" id="prompt-content">
              <TipTapEditor
                content={content.html}
                onUpdate={setContent}
                placeholder="Write your prompt template here. Use {{variable_name}} for dynamic placeholders..."
                editable={true}
              />
            </div>
            <VariablePlaceholderHelper />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-neutral-700">
          <p className="text-xs text-neutral-500">
            Press ⌘+Enter to save
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !title.trim() || !content.text.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-neutral-600 disabled:to-neutral-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  Add Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}