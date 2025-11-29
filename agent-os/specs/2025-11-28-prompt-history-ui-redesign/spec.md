# Specification: Prompt History UI Redesign

## Goal
Transform the current bottom tab navigation for conversation history into an overflow menu system with hamburger-style triggers, while maintaining all existing conversation management functionality and simplifying the interface to search-only.

## User Stories
- As a user, I want to access conversation history through a hamburger menu on the prompt tab so that I can have more screen real estate for content creation
- As a user, I want to access conversation history through a history button on the knowledge tab so that I can reference previous conversations without leaving my knowledge management workspace
- As a user, I want the conversation history interface simplified to search-only so that I can quickly find conversations without being distracted by filters and statistics

## Specific Requirements

**Hamburger Menu Implementation**
- Add hamburger menu icon to top-left corner of /prompt route with MotionHighlight visual feedback behavior
- Position menu icon at consistent distance from left and top edges following existing UI spacing patterns
- Implement click handler to open conversation history modal overlay
- Apply existing MotionHighlight component behavior for smooth highlighting and transitions
- Use same visual styling (neutral-200 background, rounded-full) as current bottom navigation
- Ensure menu triggers remain accessible and keyboard-navigable following accessibility standards

**Knowledge Tab History Button**
- Add history button with appropriate icon (History from lucide-react) positioned at bottom of knowledge tab, above existing divider and profile button
- Maintain consistent spacing and alignment with existing bottom UI elements on knowledge tab
- Implement MotionHighlight behavior for visual feedback matching prompt tab implementation
- Ensure proper z-index layering to appear above other interactive elements
- Use same styling approach as prompt tab hamburger for visual consistency

**Modal Overlay Implementation**
- Implement conversation history as modal overlay using existing Modal component with size 'full' for desktop, 'fullscreen' mobile behavior
- Position modal to appear as overflow menu from respective trigger positions (simulate dropdown behavior)
- Create simplified version of ConversationHistory component removing Filters and Statistics panels entirely
- Preserve all existing conversation list functionality including search, conversation selection, and conversation actions
- Implement click-outside-to-close and escape key behavior using existing Modal props
- Ensure modal content is properly scrollable and responsive

**Conversation History Simplification**
- Remove ConversationFilters component and all related state management from ConversationHistory
- Remove ConversationStats component and all related state management from ConversationHistory
- Remove Stats and Filters toggle buttons from conversation history header
- Keep search functionality intact with ConversationSearch component
- Preserve conversation metadata display (model, tokens, duration, timestamp)
- Maintain all conversation actions (edit, delete, favorite, etc.) through existing ConversationActions modal
- Keep conversation preview and truncation logic unchanged

**Navigation Route Changes**
- Remove History tab from BottomTabNavigation component entirely
- Remove History NavLink and related navigation logic
- Update MotionHighlight defaultValue logic to handle removal of History option
- Keep /history route accessible in App.tsx for direct navigation access
- Ensure /history route still displays full ConversationHistory page as before
- Update isMainRoute logic in App.tsx to exclude /history for consistent tab behavior

**Visual Design Consistency**
- Apply existing neutral color scheme and spacing patterns to all new elements
- Use consistent hover states and transition animations matching current design system
- Implement proper responsive behavior for mobile and desktop viewports
- Ensure text contrast ratios meet accessibility requirements
- Apply same backdrop blur effects and shadow styles used in existing modals

## Existing Code to Leverage

**MotionHighlight Component**
- Provides smooth highlighting animations and state management for active selections
- Handles hardware acceleration and proper transition timing
- Can be reused directly for hamburger and history button highlighting behavior

**Modal Component**
- Provides consistent overlay behavior with accessibility features
- Handles escape key and click-outside-to-close functionality
- Supports responsive sizing with mobileBehavior prop for fullscreen on mobile
- Includes proper ARIA attributes and portal rendering

**ConversationHistory Component**
- Contains all conversation list rendering logic, search functionality, and conversation actions
- Includes conversation preview generation, metadata formatting, and interaction handlers
- Can be simplified by removing filter and stats related code and state
- Preserves all core conversation management functionality needed for modal version

**BottomTabNavigation Component**
- Current implementation to be modified by removing History tab and related navigation logic
- Provides existing MotionHighlight integration pattern to replicate in new components
- Contains responsive styling and spacing patterns to reference for new UI elements

**ConversationActions Component**
- Handles all conversation-specific actions (edit, delete, favorite, export)
- Includes proper modal overlay behavior and keyboard navigation
- Can be reused unchanged for conversation action management in simplified history

## Out of Scope
- Changes to core conversation data structure or database schema
- Modifications to conversation search backend implementation
- New conversation actions beyond existing edit, delete, favorite functionality
- Changes to conversation detail view or individual conversation rendering
- Modifications to user authentication or permission systems
- Changes to other navigation tabs (Prompt, Knowledge) beyond history removal
- Implementation of new filtering or statistics features
- Changes to conversation synchronization or real-time updates
- Modifications to conversation export or sharing functionality