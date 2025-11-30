import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "./Modal";
import { Project } from "../services/projectService";
import { TIMEOUTS } from "../utils/constants";

interface RenameFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (data: { name: string; folderId: string; type: "prompt" | "dataset" }) => Promise<void>;
  folder: Project;
  type: "prompt" | "dataset";
  loading?: boolean;
}

export function RenameFolderModal({
  isOpen,
  onClose,
  onRename,
  folder,
  type,
  loading = false,
}: RenameFolderModalProps) {
  const [folderName, setFolderName] = useState(folder.name);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens or folder changes
  useEffect(() => {
    if (isOpen) {
      setFolderName(folder.name);
      setError(null);
      // Focus on name input when modal opens
      setTimeout(
        () => nameInputRef.current?.focus(),
        TIMEOUTS.MODAL_FOCUS_DELAY
      );
    }
  }, [isOpen, folder.name]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return folderName.trim() !== folder.name;
  };

  // Handle close attempt with unsaved changes check
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges() && !loading) {
      if (
        window.confirm(
          "Are you sure you want to discard your changes? Any data you entered will be lost."
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    if (folderName.trim().length > 50) {
      setError("Folder name must be 50 characters or less");
      return;
    }

    // Check if name hasn't changed
    if (folderName.trim() === folder.name) {
      onClose();
      return;
    }

    try {
      setError(null);
      await onRename({
        name: folderName.trim(),
        folderId: folder.id,
        type,
      });
      // Modal will be closed by parent after successful rename
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename folder");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    if (error) setError(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (loading) return;

    if (event.key === 'Enter' && event.target === nameInputRef.current) {
      event.preventDefault();
      const form = event.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCloseAttempt();
    }
  };

  const getModalTitle = () => {
    return `Rename ${type === "prompt" ? "Prompt" : "Dataset"} Folder`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={getModalTitle()}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      aria-labelledby="rename-folder-modal-title"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6" onKeyDown={handleKeyDown}>
        {/* Folder Name */}
        <div>
          <label
            htmlFor="folderName"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            Folder Name
          </label>
          <input
            ref={nameInputRef}
            id="folderName"
            type="text"
            value={folderName}
            onChange={handleNameChange}
            placeholder="Folder name"
            maxLength={50}
            disabled={loading}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-required="true"
            aria-describedby={error ? "folderNameError" : undefined}
          />
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-muted-foreground">
              Update the folder name
            </span>
            <span className="text-xs text-muted-foreground">
              {folderName.length}/50
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            id="folderNameError"
            className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-900/20 p-3"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={loading}
            className="flex-1 rounded-lg bg-muted px-4 py-3 text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !folderName.trim() || folderName.trim() === folder.name}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-glow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renaming...
              </>
            ) : (
              "Rename Folder"
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">Enter</kbd> to rename,
          <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 ml-1">Esc</kbd> to cancel
        </div>
      </form>
    </Modal>
  );
}