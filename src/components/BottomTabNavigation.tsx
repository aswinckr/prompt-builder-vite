import React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { Library, Sparkles } from 'lucide-react';
import { ROUTES } from '../routes/AppRoutes';
import { useLibraryState } from '../contexts/LibraryContext';
import { MotionHighlight } from './ui/shadcn-io/motion-highlight';

export function BottomTabNavigation() {
  const location = useLocation();
  const history = useHistory();
  const { contextSelection } = useLibraryState();

  // Add custom CSS to remove all outlines
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .nav-tab-no-outline {
        outline: none !important;
        box-shadow: none !important;
      }
      .nav-tab-no-outline:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      .nav-tab-no-outline:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
      .nav-tab-no-outline::-moz-focus-inner {
        border: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Hide tabs when multiple blocks are selected
  if (contextSelection.selectedBlockIds.length > 0) {
    return null;
  }

  // Determine active tab based on current route
  const isKnowledgeActive = location.pathname === ROUTES.KNOWLEDGE;
  const isBuilderActive = location.pathname === ROUTES.PROMPT;

  const defaultValue = isBuilderActive ? ROUTES.PROMPT : ROUTES.KNOWLEDGE;

  
  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex items-center bg-neutral-200 rounded-full p-1 shadow-lg max-w-[90vw] md:max-w-none">
        <MotionHighlight
          defaultValue={defaultValue}
          className="flex items-center gap-1"
          onValueChange={(value) => {
            // Navigate to the selected route
            history.push(value);
          }}
        >
          <NavLink
            to={ROUTES.PROMPT}
            data-value={ROUTES.PROMPT}
            role="tab"
            aria-selected={isBuilderActive}
            aria-controls="prompt-builder-panel"
            className="nav-tab-no-outline flex items-center gap-2 px-3 md:px-4 h-8 rounded-full text-sm font-medium transition-all duration-300 no-underline data-[active=true]:text-white data-[active=true]:font-medium text-neutral-900 cursor-pointer justify-center"
          >
            <Sparkles className="w-4 h-4" />
            <span>Prompt</span>
          </NavLink>

          <NavLink
            to={ROUTES.KNOWLEDGE}
            data-value={ROUTES.KNOWLEDGE}
            role="tab"
            aria-selected={isKnowledgeActive}
            aria-controls="context-library-panel"
            className="nav-tab-no-outline flex items-center gap-2 px-3 md:px-4 h-8 rounded-full text-sm font-medium transition-all duration-300 no-underline data-[active=true]:text-white data-[active=true]:font-medium text-neutral-900 cursor-pointer justify-center"
          >
            <Library className="w-4 h-4" />
            <span>Knowledge</span>
          </NavLink>
        </MotionHighlight>
      </div>
    </div>
  );
}