import React, { useMemo, useCallback, useRef, useState } from 'react';
import { ContextBlock } from './ContextBlock';
import { SelectionActionBar } from './SelectionActionBar';
import { EditContextModal } from './EditContextModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { useToast } from '../contexts/ToastContext';
import { handleCrudResult, logError } from '../utils/errorHandling';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';

interface ContextBlocksGridProps {
  selectedProject: string;
}

export function ContextBlocksGrid({ selectedProject }: ContextBlocksGridProps) {
  const { contextSelection, contextBlocks } = useLibraryState();
  const { toggleBlockSelection, clearBlockSelection, setSelectedBlocks, removeBlockFromBuilder, deleteContextBlock } = useLibraryActions();
  const [searchQuery] = React.useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<ContextBlockType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  // Filter blocks based on project and search query
  const filteredBlocks = useMemo(() => {
    let blocks = contextBlocks.filter(block => {
      // Show all blocks if no project is selected, or filter by project_id
      const matchesProject = !selectedProject || block.project_id === selectedProject;
      return matchesProject;
    });

    // Filter by search query
    if (searchQuery !== '') {
      blocks = blocks.filter(block =>
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return blocks;
  }, [contextBlocks, selectedProject, searchQuery]);

  // Select all visible blocks
  const selectAllVisible = useCallback(() => {
    setSelectedBlocks(filteredBlocks.map(block => block.id));
  }, [filteredBlocks, setSelectedBlocks]);

  // Handle block editing
  const handleEditBlock = useCallback((block: ContextBlockType) => {
    setEditingBlockId(block.id);
  }, []);

  // Handle block deletion
  const handleDeleteClick = useCallback((block: ContextBlockType) => {
    setBlockToDelete(block);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;

    setIsDeleting(true);
    try {
      // Delete from database
      const result = await deleteContextBlock(blockToDelete.id);

      const crudResult = handleCrudResult(result, 'Context block deleted', blockToDelete.title);

      if (crudResult.success) {
        // Remove from any active selections in prompt builder
        if (contextSelection.selectedBlockIds.includes(blockToDelete.id)) {
          // Remove from prompt builder if it was selected
          removeBlockFromBuilder(blockToDelete.id);
        }

        showToast(crudResult.message, 'success');
      } else {
        showToast(crudResult.message, crudResult.shouldRetry ? 'warning' : 'error');
        logError('Context Block Delete', result.error, {
          blockId: blockToDelete.id,
          title: blockToDelete.title,
          project_id: blockToDelete.project_id,
        });
      }
    } catch (error) {
      logError('Context Block Delete Exception', error, {
        blockId: blockToDelete.id,
        title: blockToDelete.title,
        project_id: blockToDelete.project_id,
      });
      showToast('Failed to delete context block. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setBlockToDelete(null);
    }
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setBlockToDelete(null);
  };

  // Grid keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>, blockId: string) => {
    if (!gridRef.current) return;

    const blocks = Array.from(gridRef.current.querySelectorAll('[data-block-id]'));
    const currentIndex = blocks.findIndex(el => el.getAttribute('data-block-id') === blockId);

    let nextIndex = currentIndex;
    const gridCols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, blocks.length - 1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;

      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + gridCols, blocks.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - gridCols, 0);
        break;
    }

    if (nextIndex !== currentIndex && blocks[nextIndex]) {
      (blocks[nextIndex] as HTMLElement).focus();
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Context Blocks Grid */}
      <div
        ref={gridRef}
        className="flex-1 p-4 md:p-6 overflow-y-auto"
        role="grid"
        aria-label="Context blocks grid"
      >
        {filteredBlocks.length === 0 ? (
          <div className="text-center text-neutral-400 mt-8 px-4">
            <div className="text-lg mb-2">No context blocks found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredBlocks.map((block) => (
              <ContextBlock
                key={block.id}
                block={block}
                isSelected={contextSelection.selectedBlockIds.includes(block.id)}
                onSelect={() => toggleBlockSelection(block.id)}
                onEdit={handleEditBlock}
                onDelete={handleDeleteClick}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selection Action Bar */}
      {contextSelection.selectedBlockIds.length > 0 && (
        <SelectionActionBar
          selectedCount={contextSelection.selectedBlockIds.length}
          selectedBlocks={contextSelection.selectedBlockIds}
          onClear={clearBlockSelection}
          onSelectAll={selectAllVisible}
          totalVisible={filteredBlocks.length}
        />
      )}

      {/* Edit Modal */}
      <EditContextModal
        isOpen={editingBlockId !== null}
        onClose={() => setEditingBlockId(null)}
        blockId={editingBlockId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Context Block"
        message={`Are you sure you want to delete '${blockToDelete?.title || 'this context block'}'? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />
    </div>
  );
}