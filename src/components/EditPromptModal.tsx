import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { TipTapEditor } from './TipTapEditor';
import { useToast } from '../contexts/ToastContext';
import { SavedPrompt } from '../types/SavedPrompt';
import { convertToHtml, detectContentFormat, validateContentCompatibility } from '../utils/contentFormatUtils';
import { debounce } from '../utils/performanceUtils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Create debounced validation function to improve performance
  const debouncedValidation = useCallback(
    debounce((html: string) => {
      const validation = validateContentCompatibility(html, 'html');
      setContentValidation({
        isValid: validation.isCompatible,
        issues: validation.issues
      });
    }, 300), // 300ms delay
    []
  );

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

    // Use debounced validation to improve performance
    debouncedValidation(newContent.html);
  };

  const confirmDialog = (
    <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Are you sure you want to close without saving?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDiscardChanges}>
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
          <div className="space-y-2">
            <Label htmlFor="prompt-title" className="text-sm font-medium text-neutral-300">
              Title
            </Label>
            <input
              id="prompt-title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter prompt title..."
              disabled={isSubmitting || isLoading}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!title.trim() && (
              <p className="text-sm text-red-400">Title is required</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="prompt-description" className="text-sm font-medium text-neutral-300">
              Description
            </Label>
            <textarea
              id="prompt-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Optional description about how to use this prompt..."
              rows={3}
              disabled={isSubmitting || isLoading}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500">
              Additional context about when and how to use this prompt
            </p>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-300">
              Content
            </Label>
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || isLoading || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {confirmDialog}
    </>
  );
}