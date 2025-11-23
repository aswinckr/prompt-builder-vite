import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { TipTapEditor } from "./TipTapEditor";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { ContextBlock } from "../types/ContextBlock";

interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string | null;
}

/**
 * Modal for editing existing context blocks
 */
export function EditContextModal({
  isOpen,
  onClose,
  blockId,
}: EditContextModalProps) {
  const { contextBlocks } = useLibraryState();
  const { updateContextBlock } = useLibraryActions();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<{ html: string; json: any; text: string }>({
    html: '',
    json: null,
    text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ContextBlock | null>(null);

  // Load block data when modal opens
  useEffect(() => {
    if (isOpen && blockId) {
      const block = contextBlocks.find(b => b.id === blockId);
      if (block) {
        setTitle(block.title);
        setContent({
          html: block.content,
          json: null,
          text: block.content
        });
        setOriginalData(block);
        setHasChanges(false);
      }
    }
  }, [isOpen, blockId, contextBlocks]);

  // Track changes
  useEffect(() => {
    if (originalData) {
      const titleChanged = title.trim() !== originalData.title.trim();
      const contentChanged = content.text.trim() !== originalData.content.trim();
      setHasChanges(titleChanged || contentChanged);
    }
  }, [title, content, originalData]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.text.trim()) {
      setError('Please enter some content');
      return;
    }

    if (!blockId) return;

    setIsSubmitting(true);
    setError('');

    try {
      await updateContextBlock(blockId, {
        title: title.trim(),
        content: content.text,
        lastUpdated: new Date(),
      });

      onClose();
      // Success feedback could be handled by parent component
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update context block');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
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
      onClose={handleClose}
      title="Edit Knowledge"
      size="lg"
      mobileBehavior="fullscreen"
      aria-labelledby="edit-context-modal-title"
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
            <label htmlFor="edit-context-title" className="block text-sm font-medium text-neutral-300 mb-2">
              Title *
            </label>
            <input
              id="edit-context-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for this knowledge block"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
              aria-required="true"
              aria-describedby="edit-title-description"
            />
            <p id="edit-title-description" className="mt-1 text-xs text-neutral-500">
              A brief title to help you identify this knowledge block
            </p>
          </div>

          {/* Content Editor */}
          <div>
            <label htmlFor="edit-context-content" className="block text-sm font-medium text-neutral-300 mb-2">
              Content *
            </label>
            <div className="min-h-[300px]" id="edit-context-content">
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
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !title.trim() || !content.text.trim() || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-neutral-600 disabled:to-neutral-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  Update Knowledge
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}