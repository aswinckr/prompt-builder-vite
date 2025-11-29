import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLibraryActions } from '../contexts/LibraryContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ContextDropdownProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * ContextDropdown component that provides options to add text blocks or navigate to knowledge
 */
export function ContextDropdown({ className = '', variant = 'default' }: ContextDropdownProps) {
  const navigate = useNavigate();
  const { createTemporaryBlock } = useLibraryActions();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTextBlock = () => {
    const newBlock = createTemporaryBlock({
      title: '',
      content: '',
      tags: [],
      project_id: null
    });
    setIsOpen(false);

    // Scroll the new block into view after a short delay to ensure DOM update
    setTimeout(() => {
      const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleAddKnowledge = () => {
    navigate('/knowledge');
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const baseButtonClasses = "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
  const variantClasses = variant === 'compact'
    ? "text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 border border-neutral-700"
    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-600";

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={`${baseButtonClasses} ${variantClasses} ${className}`}
          aria-label="Add context options"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <Plus className={`${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} inline ${variant === 'compact' ? 'mr-1' : 'mr-2'}`} />
          {variant === 'compact' ? 'Add More' : 'Add Context Block'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="bg-neutral-800 border-neutral-600 min-w-[200px] shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          onClick={handleAddTextBlock}
          className="text-neutral-200 hover:bg-neutral-700 focus:bg-neutral-700 focus:text-neutral-100 cursor-pointer rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Text Block
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleAddKnowledge}
          className="text-neutral-200 hover:bg-neutral-700 focus:bg-neutral-700 focus:text-neutral-100 cursor-pointer rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Knowledge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}