import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { TipTapEditor } from './TipTapEditor';
import { useToast } from '../contexts/ToastContext';
import { SavedPrompt } from '../types/SavedPrompt';
import { convertToHtml, detectContentFormat, validateContentCompatibility } from '../utils/contentFormatUtils';

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
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentValidation, setContentValidation] = useState<{
    isValid: boolean;
    issues: string[];
  }>({ isValid: true, issues: [] });

  // Initialize form when prompt changes
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || '');

      // Handle both old plain text prompts and new HTML prompts
      const rawContent = prompt.content || '';

      try {
        // Validate content compatibility with expected HTML format
        const validation = validateContentCompatibility(rawContent, 'html');

        let processedContent = '';
        if (validation.isCompatible) {
          // Content is already valid HTML, use as-is
          processedContent = rawContent;
        } else {
          // Content needs conversion, use robust conversion utility
          const conversion = convertToHtml(rawContent);
          processedContent = conversion.html;

          // Log conversion for debugging purposes
          if (conversion.format !== 'html') {
            console.info(`EditPromptModal: Converted ${conversion.format} to HTML for prompt "${prompt.title}"`);
          }
        }

        // Additional validation to ensure we have valid content
        const formatDetection = detectContentFormat(processedContent);
        setContentValidation({
          isValid: formatDetection.confidence > 0.5,
          issues: formatDetection.issues
        });

        setContent(processedContent);
        setOriginalContent(processedContent); // Store the processed content for change detection
        setHasChanges(false);

      } catch (error) {
        console.error('EditPromptModal: Error processing content:', error);
        // Fallback to simple HTML wrapping if conversion fails
        const fallbackContent = `<p>${rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
        setContent(fallbackContent);
        setOriginalContent(fallbackContent);
        setContentValidation({
          isValid: false,
          issues: ['Content processing failed, using fallback formatting']
        });
        setHasChanges(false);
      }
    }
  }, [prompt]);

  // Track changes for confirmation dialog
  useEffect(() => {
    if (prompt) {
      const titleChanged = title !== prompt.title;
      const descriptionChanged = description !== (prompt.description || '');
      const contentChanged = content !== originalContent;
      setHasChanges(titleChanged || descriptionChanged || contentChanged);
    }
  }, [title, description, content, originalContent, prompt]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please enter a title for the prompt', 'error');
      return;
    }

    // Validate content format before saving
    const validation = validateContentCompatibility(content, 'html');
    if (!validation.isCompatible && validation.issues.length > 0) {
      showToast(`Content validation issues: ${validation.issues.join(', ')}`, 'warning');
    }

    if (prompt) {
      setIsSubmitting(true);
      try {
        const promptData: Partial<SavedPrompt> = {
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim(), // Save HTML content as-is from TipTapEditor
          project_id: prompt.project_id || null,
          folder: prompt.folder || null,
          tags: prompt.tags || [],
        };

  
        await onSave(promptData);
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

    // Real-time validation of updated content
    const validation = validateContentCompatibility(newContent.html, 'html');
    setContentValidation({
      isValid: validation.isCompatible,
      issues: validation.issues
    });
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

          {/* Description Field */}
          <div>
            <label htmlFor="prompt-description" className="block text-sm font-medium text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              id="prompt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description about how to use this prompt..."
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              disabled={isSubmitting || isLoading}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Additional context about when and how to use this prompt
            </p>
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

            {/* Content Validation Feedback */}
            {!contentValidation.isValid && contentValidation.issues.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  Content validation: {contentValidation.issues.join(', ')}
                </p>
              </div>
            )}
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