# Specification: Global Search Functionality

## Goal
Implement a global search functionality that allows users to search across both prompts and context blocks from a single interface with a "Search everywhere" placeholder.

## User Stories
- As a user, I want to search for content across all my prompts and context blocks from a single search interface so that I can quickly find relevant information without navigating between different sections
- As a user, I want search results to be categorized and clearly labeled so that I can distinguish between prompts and context blocks at a glance
- As a user, I want to click on search results to navigate directly to the relevant item so that I can quickly access and work with found content

## Specific Requirements

**Global Search Component**
- Create GlobalSearch component with "Search everywhere" placeholder text
- Implement search input with debounced search functionality using existing debounce utilities
- Display search results in a dropdown/overlay format with categorized sections
- Use existing Tailwind CSS styling patterns (neutral-800/neutral-700 borders, dark theme)
- Implement keyboard navigation (arrow keys, enter to select, escape to close)
- Add search icon from Lucide React following existing SearchBar pattern

**Search Results Display**
- Categorize results into "Prompts" and "Context Blocks" sections with clear headers
- Show result items with title, content preview (truncated), and relevant metadata (tags, project name)
- Highlight matching text fragments in results
- Display result count for each category
- Show "No results found" state when applicable
- Implement loading state during search operations

**Search Functionality**
- Search across prompt titles, descriptions, content, and tags using existing searchPrompts service method
- Search across context block titles, content, and tags using existing searchContextBlocks service method
- Combine results from both services into unified search interface
- Maintain existing search ranking (by updated_at descending)
- Support empty query state showing recent or suggested content
- Cache recent searches for improved user experience

**Navigation Integration**
- Place global search in prominent location (header or top navigation)
- Ensure search is accessible from both /prompt and /knowledge routes
- Implement result click handlers to navigate to appropriate routes (/prompt for prompts, /knowledge for context blocks)
- Pass necessary parameters to target components for highlighting or scrolling to found items
- Maintain search state during navigation if needed

**Performance Optimization**
- Implement proper debouncing (300ms) using existing debounce utilities
- Limit search results per category (e.g., 10 each) to prevent UI overflow
- Implement virtualization for large result sets if needed
- Use React.memo and useMemo for component optimization
- Handle search cancellation to prevent race conditions

## Visual Design
No visual mockups provided for this specification.

## Existing Code to Leverage

**SearchBar Component (`/src/components/SearchBar.tsx`)**
- Reuse input styling, focus states, and keyboard event handling patterns
- Adapt the existing search input structure with "Search everywhere" placeholder
- Leverage Search icon from Lucide React and positioning logic
- Replicate border styling (border-neutral-700) and focus ring patterns

**Search Services (`/src/services/promptService.ts`, `/src/services/contextService.ts`)**
- Utilize existing searchPrompts() method which searches title, content, and description
- Utilize existing searchContextBlocks() method which searches title and content
- Leverage DatabaseResponse error handling patterns
- Follow existing user authentication and data transformation patterns

**Debounce Utilities (`/src/utils/debounceUtils.ts`)**
- Use existing debounce() function for search input handling
- Implement createDebouncedCallback for React hook integration
- Follow established cleanup patterns for search cancellation

**TypeScript Interfaces (`/src/types/SavedPrompt.ts`, `/src/types/ContextBlock.ts`)**
- Use existing SavedPrompt and ContextBlock interfaces for search results
- Leverage project relationship structures for metadata display
- Follow existing tag array patterns for filtering and display

**UI Components**
- Utilize existing Tailwind CSS color scheme (neutral-900 background, neutral-800 surfaces)
- Follow existing component layout patterns with proper spacing and typography
- Use established focus states and transition animations
- Implement consistent responsive design patterns

## Out of Scope
- Full-text search with advanced operators (AND, OR, NOT)
- Search across project names or folders only
- Search history and saved search functionality
- Search result export or sharing capabilities
- Advanced filtering (by date ranges, specific users, etc.)
- Search analytics or usage tracking
- Real-time search result updates as content changes
- Search result sorting options (relevance vs date)
- Global search keyboard shortcut (Cmd+K)
- Search result preview/quick view functionality
- Voice search integration