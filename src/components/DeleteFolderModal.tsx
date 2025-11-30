import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { Project } from '../services/projectService';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folder: Project | null;
  type: 'prompt' | 'dataset';
  isLoading?: boolean;
  contentCount?: number;
}

/**
 * DeleteFolderModal component - Specialized confirmation modal for folder deletion
 * Handles both user folders and system folders with appropriate messaging
 */
export function DeleteFolderModal({
  isOpen,
  onClose,
  onConfirm,
  folder,
  type,
  isLoading = false,
  contentCount = 0
}: DeleteFolderModalProps) {
  // Don't render if no folder is provided
  if (!folder) {
    return null;
  }

  // For system folders, show protection message
  if (folder.is_system) {
    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onClose} // Just close the modal for system folders
        title="Cannot Delete System Folder"
        message={`"${folder.name}" is a system folder and cannot be deleted. System folders are required for proper application functionality.`}
        confirmText="OK"
        cancelText=""
        type="warning"
        isLoading={false}
      />
    );
  }

  // For user folders, show delete confirmation
  const getDeleteMessage = () => {
    const folderTypeText = type === 'prompt' ? 'prompt' : 'dataset';

    if (contentCount > 0) {
      return `Are you sure you want to delete "${folder.name}"? This folder contains ${contentCount} ${folderTypeText}${contentCount !== 1 ? 's' : ''} that will be permanently deleted. This action cannot be undone.`;
    } else {
      return `Are you sure you want to delete "${folder.name}"? This folder is empty. This action cannot be undone.`;
    }
  };

  const getConfirmText = () => {
    return contentCount > 0 ? 'Delete Folder and Contents' : 'Delete Folder';
  };

  const getTitle = () => {
    const folderTypeText = type === 'prompt' ? 'Prompt' : 'Dataset';
    return `Delete ${folderTypeText} Folder`;
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={getTitle()}
      message={getDeleteMessage()}
      confirmText={getConfirmText()}
      cancelText="Cancel"
      type="delete"
      isLoading={isLoading}
    />
  );
}