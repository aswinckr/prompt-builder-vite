import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Project } from '../services/projectService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface FolderActionMenuProps {
  folder: Project;
  type: 'prompt' | 'dataset';
  onRename: (folder: Project, type: 'prompt' | 'dataset') => void;
  onDelete: (folder: Project, type: 'prompt' | 'dataset') => void;
}

/**
 * FolderActionMenu component - Three-dot context menu for folder actions
 * Only shows for user-created folders (not system folders)
 * Enhanced with comprehensive accessibility features
 */
export function FolderActionMenu({
  folder,
  type,
  onRename,
  onDelete,
}: FolderActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Update announcement when it changes
  useEffect(() => {
    if (liveRegionRef.current && announcement) {
      liveRegionRef.current.textContent = announcement;
      // Clear the announcement after it's been read
      const timeout = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [announcement]);

  // Don't render anything for system folders
  if (folder.is_system) {
    return null;
  }

  const handleRename = () => {
    onRename(folder, type);
    setIsOpen(false);
    // Return focus to the trigger button after action
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleDelete = () => {
    onDelete(folder, type);
    setIsOpen(false);
    // Return focus to the trigger button after action
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Announce to screen readers when menu opens/closes
    const newAnnouncement = open
      ? `Folder actions menu opened for ${folder.name}. Use up and down arrow keys to navigate.`
      : 'Folder actions menu closed.';

    setAnnouncement(newAnnouncement);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enhanced keyboard support
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Invisible live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id={`folder-menu-announce-${folder.id}`}
      />

      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            ref={triggerRef}
            className="flex h-6 w-6 items-center justify-center rounded-sm border border-transparent text-muted-foreground opacity-0 transition-all hover:border-border hover:bg-muted hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label={`Folder actions for ${folder.name}. Press Enter or Space to open menu.`}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-controls={`folder-menu-${folder.id}`}
            onKeyDown={handleKeyDown}
            data-folder-action-trigger={folder.id}
            type="button"
          >
            <MoreHorizontal className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">Actions for {folder.name}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          id={`folder-menu-${folder.id}`}
          align="end"
          side="bottom"
          className="min-w-[140px]"
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Enhanced accessibility props
          role="menu"
          aria-labelledby={`folder-menu-trigger-${folder.id}`}
          aria-orientation="vertical"
        >
          {/* Rename Menu Item */}
          <DropdownMenuItem
            onClick={handleRename}
            className="cursor-pointer"
            role="menuitem"
            aria-label={`Rename folder ${folder.name}`}
            // Add keyboard navigation hints
            data-action="rename"
          >
            <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Rename</span>
            <span className="sr-only">Rename folder {folder.name}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete Menu Item */}
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-destructive focus:text-destructive"
            role="menuitem"
            aria-label={`Delete folder ${folder.name}. This action cannot be undone.`}
            data-action="delete"
          >
            <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Delete</span>
            <span className="sr-only">Delete folder {folder.name}. This action cannot be undone.</span>
          </DropdownMenuItem>

          {/* Keyboard navigation help */}
          <div className="sr-only" role="status">
            Press Escape to close menu. Use up and down arrow keys to navigate items.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Additional invisible element for enhanced screen reader support */}
      <div
        aria-hidden="true"
        className="sr-only"
        data-folder-name={folder.name}
        data-folder-type={type}
        data-folder-id={folder.id}
      />
    </>
  );
}