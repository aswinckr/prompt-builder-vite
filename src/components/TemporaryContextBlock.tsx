import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier } from "dnd-core";
import type { XYCoord } from "react-dnd";
import type { DragSourceMonitor } from "react-dnd";
import { X, GripVertical, Type, ChevronDown, ChevronRight } from "lucide-react";
import { ContextBlock as ContextBlockType } from "../types/ContextBlock";
import { useLibraryActions } from "../contexts/LibraryContext";
import { TipTapEditor, TipTapEditorRef } from "./TipTapEditor";
import { TIMEOUTS } from "../utils/constants";

interface TemporaryContextBlockProps {
  block: ContextBlockType;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  autoFocus?: boolean;
}

// Define the drag item type
const ItemTypes = {
  BLOCK: "block",
} as const;

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function TemporaryContextBlock({
  block,
  index,
  moveBlock,
  autoFocus = false,
}: TemporaryContextBlockProps) {
  const { updateTemporaryBlock, removeTemporaryBlock } = useLibraryActions();
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<TipTapEditorRef | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [content, setContent] = useState(block.content || '');

  // Auto-focus functionality with cleanup - fixed race condition
  useEffect(() => {
    if (!autoFocus) return;

    let timeoutId: NodeJS.Timeout;

    // Wait for component to be fully mounted and editor to be ready
    timeoutId = setTimeout(() => {
      if (editorRef.current?.focus) {
        editorRef.current.focus();
      }
    }, TIMEOUTS.MODAL_FOCUS_DELAY);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autoFocus]);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => {
      return { id: block.id.toString(), index };
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.BLOCK,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveBlock(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  const handleRemove = () => {
    removeTemporaryBlock(block.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleContentUpdate = (update: { html: string; json: any; text: string }) => {
    const newContent = update.html;
    setContent(newContent);
    updateTemporaryBlock(block.id, { content: newContent });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleExpand(e as any);
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="mb-4"
      data-testid="temporary-context-block"
      data-block-id={block.id}
    >
      <div
        className={`relative rounded-2xl border border-neutral-600/50 bg-neutral-750/70 backdrop-blur-sm transition-all duration-300 hover:border-neutral-500/50 hover:bg-neutral-750/85 hover:shadow-lg hover:shadow-black/20 ${
          isDragging
            ? "rotate-1 scale-105 cursor-grabbing shadow-xl"
            : "cursor-grab"
        } ${
          isExpanded ? "shadow-lg shadow-black/10 ring-2 ring-neutral-500/30" : ""
        }`}
      >
        {/* Gradient overlay for depth */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-500/3 via-transparent to-neutral-400/3" />

        {/* Drag Handle */}
        <div className="absolute left-4 top-4 cursor-grab rounded-lg p-1.5 text-neutral-500 transition-colors duration-200 hover:bg-neutral-700/50 hover:text-neutral-400 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="absolute right-3 top-3 rounded-xl p-2 text-neutral-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          aria-label={`Remove ${block.title} from prompt`}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggleExpand}
          onKeyDown={handleKeyDown}
          className="absolute bottom-4 left-4 rounded-xl p-2 text-neutral-500 transition-all duration-200 hover:bg-neutral-600/20 hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500/50"
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${block.title}`}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-300" />
          )}
        </button>

        {/* Context Block Content */}
        <div className="flex items-start gap-4 pl-14 pr-12 pt-6">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-500/30 bg-gradient-to-br from-neutral-500/20 to-neutral-400/20">
            <Type className="h-4 w-4 text-neutral-400" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title and Badge */}
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg border border-neutral-500/30 bg-gradient-to-r from-neutral-500/20 to-neutral-400/20 px-3 py-1">
                <span className="text-xs font-medium text-neutral-300">
                  Text Block
                </span>
              </div>
              <h3 className="truncate text-sm font-semibold text-neutral-100">
                {block.title}
              </h3>
            </div>

            {/* Content Editor */}
            <div className="mb-4">
              {isExpanded ? (
                <TipTapEditor
                  ref={editorRef}
                  content={content}
                  onUpdate={handleContentUpdate}
                  placeholder="Start typing your context here..."
                  editable={true}
                />
              ) : (
                <div className="text-sm leading-relaxed text-neutral-300 line-clamp-2 min-h-[48px]">
                  {content || <span className="text-neutral-500 italic">Start typing your context here...</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}