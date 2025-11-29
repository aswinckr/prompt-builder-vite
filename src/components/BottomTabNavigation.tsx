import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Library, Sparkles } from "lucide-react";
import { ROUTES } from "../routes/AppRoutes";
import { useLibraryState } from "../contexts/LibraryContext";
import { MotionHighlight } from "./ui/shadcn-io/motion-highlight";

export function BottomTabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contextSelection } = useLibraryState();

  // Hide tabs when multiple blocks are selected
  if (contextSelection.selectedBlockIds.length > 0) {
    return null;
  }

  // Determine active tab based on current route (only Prompt and Knowledge tabs)
  const isKnowledgeActive = location.pathname === ROUTES.KNOWLEDGE;
  const isBuilderActive = location.pathname === ROUTES.PROMPT;

  // Default value for MotionHighlight - only considers Prompt and Knowledge
  const defaultValue = isBuilderActive ? ROUTES.PROMPT : ROUTES.KNOWLEDGE;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transform md:bottom-6">
      <div className="flex max-w-[90vw] items-center rounded-full border border-primary/20 bg-muted/80 p-1 shadow-glow-sm backdrop-blur-md md:max-w-none">
        <MotionHighlight
          defaultValue={defaultValue}
          className="flex items-center gap-1"
          onValueChange={(value) => {
            // Navigate to the selected route
            navigate(value);
          }}
        >
          <NavLink
            to={ROUTES.PROMPT}
            data-value={ROUTES.PROMPT}
            role="tab"
            aria-selected={isBuilderActive}
            aria-controls="prompt-builder-panel"
            className="nav-tab-no-outline flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground no-underline transition-colors duration-200 ease-out hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-primary-foreground md:px-4"
            style={{ willChange: "color", backfaceVisibility: "hidden" }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Prompt</span>
          </NavLink>

          <NavLink
            to={ROUTES.KNOWLEDGE}
            data-value={ROUTES.KNOWLEDGE}
            role="tab"
            aria-selected={isKnowledgeActive}
            aria-controls="context-library-panel"
            className="nav-tab-no-outline flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground no-underline transition-colors duration-200 ease-out hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-primary-foreground md:px-4"
            style={{ willChange: "color", backfaceVisibility: "hidden" }}
          >
            <Library className="h-4 w-4" />
            <span>Knowledge</span>
          </NavLink>
        </MotionHighlight>
      </div>
    </div>
  );
}
