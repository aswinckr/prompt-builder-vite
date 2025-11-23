import React, { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Library, Sparkles } from 'lucide-react';
import { ROUTES } from '../routes/AppRoutes';
import { useLibraryState } from '../contexts/LibraryContext';

export function BottomTabNavigation() {
  const location = useLocation();
  const tabListRef = useRef<HTMLDivElement>(null);
  const { contextSelection } = useLibraryState();

  // Hide tabs when multiple blocks are selected
  if (contextSelection.selectedBlockIds.length > 0) {
    return null;
  }

  // Determine active tab based on current route
  const isKnowledgeActive = location.pathname === ROUTES.KNOWLEDGE;
  const isBuilderActive = location.pathname === ROUTES.PROMPT;

  const handleKeyDown = (event: React.KeyboardEvent, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Let the NavLink handle the navigation
      const target = event.currentTarget as HTMLAnchorElement;
      target.click();
      return;
    }

    // Arrow key navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const tabs = tabListRef.current?.querySelectorAll('a');
      if (!tabs) return;

      const currentIndex = Array.from(tabs).findIndex(t => t === event.target);
      let nextIndex;

      if (event.key === 'ArrowRight') {
        nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      } else {
        nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      }

      tabs[nextIndex]?.focus();
    }
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div
        ref={tabListRef}
        className="flex items-center bg-neutral-200 rounded-full p-1 shadow-lg max-w-[90vw] md:max-w-none"
        role="tablist"
        aria-label="Navigation tabs"
      >
        <NavLink
          to={ROUTES.PROMPT}
          role="tab"
          aria-selected={isBuilderActive}
          aria-controls="prompt-builder-panel"
          onKeyDown={(e) => handleKeyDown(e, ROUTES.PROMPT)}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-underline ${
            isBuilderActive
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white text-neutral-900 hover:bg-neutral-50'
          }`}
          tabIndex={isBuilderActive ? 0 : -1}
        >
          <Sparkles className="w-4 h-4" />
          <span>Prompt</span>
        </NavLink>

        <NavLink
          to={ROUTES.KNOWLEDGE}
          role="tab"
          aria-selected={isKnowledgeActive}
          aria-controls="context-library-panel"
          onKeyDown={(e) => handleKeyDown(e, ROUTES.KNOWLEDGE)}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-underline ${
            isKnowledgeActive
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white text-neutral-900 hover:bg-neutral-50'
          }`}
          tabIndex={isKnowledgeActive ? 0 : -1}
        >
          <Library className="w-4 h-4" />
          <span>Knowledge</span>
        </NavLink>
      </div>
    </div>
  );
}