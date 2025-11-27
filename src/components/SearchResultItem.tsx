import React, { memo } from 'react';
import { FileText, Database, Tag, Folder } from 'lucide-react';
import { SearchResult, SearchCategory } from '../types/globalSearch';
import { highlightText, truncateText } from '../utils/highlightText';

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

// Use React.memo to prevent unnecessary re-renders
export const SearchResultItem = memo<SearchResultItemProps>(({
  result,
  query,
  isHighlighted = false,
  onClick
}) => {
  const getCategoryIcon = () => {
    return result.type === SearchCategory.PROMPT ? (
      <FileText size={14} className="text-neutral-400" />
    ) : (
      <Database size={14} className="text-neutral-400" />
    );
  };

  const getProjectInfo = () => {
    if (!result.project) return null;

    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-neutral-400">{result.project.icon}</span>
        <span className="text-xs text-neutral-400">{result.project.name}</span>
      </div>
    );
  };

  const getTags = () => {
    if (result.tags.length === 0) return null;

    const displayTags = result.tags.slice(0, 3);
    const remainingTags = result.tags.length > 3 ? result.tags.length - 3 : 0;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        <Tag size={12} className="text-neutral-500" />
        {displayTags.map((tag, index) => (
          <span
            key={tag} // Use tag as key since tags should be unique within an item
            className="text-xs px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        {remainingTags > 0 && (
          <span className="text-xs text-neutral-500">
            +{remainingTags}
          </span>
        )}
      </div>
    );
  };

  const getMetadata = () => {
    const metadataItems = [];

    if (result.metadata?.folder && result.type === SearchCategory.PROMPT) {
      metadataItems.push(
        <div key="folder" className="flex items-center gap-1">
          <Folder size={12} className="text-neutral-500" />
          <span className="text-xs text-neutral-400">{result.metadata.folder}</span>
        </div>
      );
    }

    if (result.metadata?.isTemporary && result.type === SearchCategory.CONTEXT_BLOCK) {
      metadataItems.push(
        <span key="temporary" className="text-xs text-neutral-500 italic">
          Temporary
        </span>
      );
    }

    return metadataItems.length > 0 ? (
      <div className="flex items-center gap-3 mt-1">
        {metadataItems}
      </div>
    ) : null;
  };

  return (
    <div
      className={`
        px-4 py-3 cursor-pointer transition-all duration-150 border-b border-neutral-700/50 last:border-b-0
        ${isHighlighted ? 'bg-neutral-700' : 'hover:bg-neutral-750'}
      `}
      onClick={onClick}
      role="option"
      aria-selected={isHighlighted}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getCategoryIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-medium text-neutral-100 truncate leading-tight">
            {highlightText(result.title, query)}
          </h4>

          {/* Description */}
          {result.description && (
            <p className="text-xs text-neutral-400 truncate mt-1 leading-tight">
              {highlightText(truncateText(result.description, 80), query)}
            </p>
          )}

          {/* Content Preview */}
          <p className="text-xs text-neutral-500 mt-1 leading-snug">
            {highlightText(truncateText(result.content, 100), query)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Project */}
              {getProjectInfo()}

              {/* Tags */}
              {getTags()}
            </div>

            {/* Additional Metadata */}
            {getMetadata()}
          </div>
        </div>
      </div>
    </div>
  );
});

SearchResultItem.displayName = 'SearchResultItem';