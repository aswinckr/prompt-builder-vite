# Specification: Prompt History UI Redesign

## Goal
Transform the prompt history interface from bottom tab navigation to hamburger menu overflow menus while preserving all existing conversation history functionality through simplified, search-only modal overlays.

## User Stories
- As a user, I want to access conversation history through a hamburger menu on the /prompt tab so that I can have a cleaner interface while still maintaining full access to my conversation history
- As a user, I want to access conversation history through a History button on the /knowledge tab so that I can quickly search and navigate to previous conversations without leaving my current context
- As a user, I want the /history route to remain accessible for direct navigation so that I can bookmark or directly access my conversation history when needed

## Specific Requirements

**Hamburger Menu Implementation**
- Create overflow button with hamburger menu icon (Menu from lucide-react) positioned at top-left corner of /prompt tab
- Apply MotionHighlight component for interactive highlighting behavior consistent with current tab navigation
- Implement modal overlay using existing Drawer component with left-side slide-in animation
- Use size 'md' for appropriate modal dimensions

**Knowledge Tab History Button**
- Add History button with icon at bottom position above divider and profile button in /knowledge tab
- Position the button in the lower area of the knowledge interface, maintaining visual hierarchy
- Apply same MotionHighlight highlighting behavior as hamburger menu for consistency
- Use same modal overlay implementation as hamburger menu

**Simplified Conversation History Component**
- Remove filters and statistics panels from conversation history interface
- Maintain search functionality with existing ConversationSearch component integration
- Preserve conversation list display with metadata (model, tokens, duration, timestamp)
- Keep conversation actions (edit, delete, favorite) accessible through existing ConversationActions modal
- Optimize for modal usage with proper title prop and className customization

**Bottom Navigation Removal**
- Remove History tab from BottomTabNavigation component entirely
- Maintain only Prompt and Knowledge tabs in bottom navigation
- Update MotionHighlight defaultValue logic to only consider Prompt and Knowledge routes
- Ensure proper tab highlighting and navigation behavior after History removal

**Route Preservation**
- Keep /history route defined in AppRoutes for direct access
- Maintain existing navigation functionality to individual conversation details (/history/:id)
- Preserve all conversation data fetching and management logic

**Modal Implementation Pattern**
- Use existing HistoryMenuButton component as foundation for both menu implementations
- Leverage Drawer component with consistent side="left" and size="md" configuration
- Apply existing SimplifiedConversationHistory component for search-only interface
- Ensure proper modal closing, overlay clicks, and escape key handling

## Existing Code to Leverage

**MotionHighlight Component** (`/src/components/ui/shadcn-io/motion-highlight.tsx`)
- Provides smooth highlighting animation and interaction behavior
- Already integrated with tab navigation and can be reused for menu highlighting
- Hardware-accelerated with proper accessibility support

**SimplifiedConversationHistory Component** (`/src/components/SimplifiedConversationHistory.tsx`)
- Search-only conversation history interface already implemented
- Includes debounced search optimization and conversation caching
- Responsive design with proper loading and empty states
- Conversation metadata display and action handling built-in

**HistoryMenuButton Component** (`/src/components/HistoryMenuButton.tsx`)
- Complete button and modal implementation pattern
- Uses Drawer component for consistent modal behavior
- Integrates MotionHighlight for interactive highlighting
- Flexible icon and positioning props for reuse

**Drawer Component** (`/src/components/ui/drawer.tsx`)
- Radix UI-based modal overlay with proper accessibility
- Left-side slide-in animation with backdrop blur
- Configurable sizing and responsive behavior
- Built-in close button and overlay click handling

**ConversationService** (`/src/services/conversationService.ts`)
- Complete conversation CRUD operations and search functionality
- Real-time subscription capabilities for live updates
- Proper error handling and user authentication checks
- Search conversations method for debounced search implementation

**BottomTabNavigation Component** (`/src/components/BottomTabNavigation.tsx`)
- Current implementation to be modified for History tab removal
- MotionHighlight integration to be updated for two-tab system
- Responsive design and navigation logic to preserve

## Out of Scope
- Changes to core conversation management logic or data structure
- Modifications to ConversationService API methods or database schema
- New conversation functionality beyond UI restructuring
- Changes to search backend implementation or algorithms
- Modifications to individual conversation detail views
- Changes to authentication or user management systems
- Updates to other UI components not related to navigation or history
- Performance optimizations beyond existing conversation caching
- Mobile-specific adaptations beyond current responsive design