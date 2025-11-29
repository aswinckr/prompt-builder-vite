import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, Loader2, FolderOpen } from "lucide-react";
import { Modal } from "./Modal";
import { IconPicker } from "./IconPicker";
import { TIMEOUTS } from "../utils/constants";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: { name: string; icon: string }) => Promise<void>;
  folderType: "prompts" | "datasets";
  loading?: boolean;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
  folderType,
  loading = false,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setSelectedIcon("📁");
      setError(null);
      // Focus on name input when modal opens
      setTimeout(
        () => nameInputRef.current?.focus(),
        TIMEOUTS.MODAL_FOCUS_DELAY
      );
    }
  }, [isOpen]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return folderName.trim() !== "";
  };

  // Handle close attempt with unsaved changes check
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
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

    try {
      setError(null);
      const result = await onCreateFolder({
        name: folderName.trim(),
        icon: selectedIcon,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    if (error) setError(null);
  };

  const getModalTitle = () => {
    return `Create New ${
      folderType === "prompts" ? "Prompt" : "Dataset"
    } Folder`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={getModalTitle()}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
            placeholder={`My ${
              folderType === "prompts" ? "Prompt" : "Dataset"
            } Folder`}
            maxLength={50}
            disabled={loading}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-required="true"
            aria-describedby={error ? "folderNameError" : undefined}
          />
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-muted-foreground">
              Give your folder a descriptive name
            </span>
            <span className="text-xs text-muted-foreground">
              {folderName.length}/50
            </span>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <IconPicker
            selectedIcon={selectedIcon}
            onIconSelect={setSelectedIcon}
          />
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
            disabled={loading || !folderName.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-glow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
