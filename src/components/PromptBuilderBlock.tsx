import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier } from "dnd-core";
import type { XYCoord } from "react-dnd";
import { X, GripVertical, Hash, ChevronDown, ChevronRight } from "lucide-react";
import { ContextBlock as ContextBlockType } from "../types/ContextBlock";
import { useLibraryActions } from "../contexts/LibraryContext";

interface PromptBuilderBlockProps {
  block: ContextBlockType;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
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

export function PromptBuilderBlock({
  block,
  index,
  moveBlock,
}: PromptBuilderBlockProps) {
  const { removeBlockFromBuilder } = useLibraryActions();
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => {
      return { id: block.id.toString(), index };
    },
    collect: (monitor: any) => ({
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
    removeBlockFromBuilder(block.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
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
    >
      <div
        className={`relative rounded-2xl border border-neutral-700/50 bg-neutral-800/70 backdrop-blur-sm transition-all duration-300 hover:border-neutral-600/50 hover:bg-neutral-800/90 hover:shadow-lg hover:shadow-black/20 ${
          isDragging
            ? "rotate-1 scale-105 cursor-grabbing shadow-xl"
            : "cursor-grab"
        } ${
          isExpanded ? "shadow-lg shadow-black/10 ring-2 ring-blue-500/30" : ""
        }`}
        data-block-id={block.id}
      >
        {/* Gradient overlay for depth */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />

        {/* Drag Handle */}
        <div className="absolute left-4 top-4 cursor-grab rounded-lg p-1.5 text-neutral-500 transition-colors duration-200 hover:bg-neutral-700/50 hover:text-neutral-400 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" data-testid="grip-vertical" />
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
          className="absolute bottom-4 left-4 rounded-xl p-2 text-neutral-500 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Hash className="h-4 w-4 text-blue-400" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title and Badge */}
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1">
                <span className="text-xs font-medium text-blue-300">
                  Context Block
                </span>
              </div>
              <h3 className="truncate text-sm font-semibold text-neutral-100">
                {block.title}
              </h3>
            </div>

            {/* Content Preview - Always visible but truncated when collapsed */}
            <div className="mb-4 text-sm leading-relaxed text-neutral-300">
              {isExpanded ? (
                <div className="scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800/50 max-h-96 overflow-y-auto pr-2">
                  <div className="whitespace-pre-wrap">{block.content}</div>
                </div>
              ) : (
                <div className="line-clamp-2">{block.content}</div>
              )}
            </div>

            {/* Tags - Always visible */}
            {block.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {block.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-600/50 bg-neutral-700/50 px-2.5 py-1 text-xs text-neutral-300 backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
