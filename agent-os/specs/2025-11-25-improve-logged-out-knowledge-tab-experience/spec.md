# Specification: Improve Logged Out Knowledge Tab Experience

## Goal
Transform the knowledge tab from showing error messages for logged-out users to a browsable experience that allows exploring content but requires authentication for add actions.

## User Stories
- As a logged-out user, I want to browse the knowledge tab interface without seeing error messages so that I can understand the product's functionality
- As a logged-out user, I want to be prompted to sign in when I click "add knowledge" or "add prompt" buttons so that I can create content after authentication
- As a logged-out user, I want the original action to trigger automatically after successful sign-in so that I don't lose my intended workflow

## Specific Requirements

**Authentication State Handling**
- Replace current error overlay with conditional rendering based on authentication status
- Use existing AuthContext to detect user authentication state
- Allow full interface browsing for logged-out users without blocking error states
- Preserve existing authenticated user behavior without changes

**Sign-in Modal Integration**
- Reuse existing ProfileModal component when users click add buttons while logged out
- Trigger modal before any data entry to prevent work loss
- Close modal automatically after successful authentication
- Handle authentication failures gracefully with proper error states

**Post-Authentication Flow**
- Store the originally clicked action (add knowledge vs add prompt) before sign-in
- Automatically trigger the appropriate modal (CreateContextModal or CreatePromptModal) after successful authentication
- Maintain project selection context through the authentication flow
- Return users to a clean state if authentication is canceled

**Content Display for Logged-out Users**
- Show existing UI components (sidebar, search, grid layouts) without data
- Display empty states in context blocks grid and saved prompts sections
- Keep all navigation and filtering interface elements visible and functional
- Show system projects if available, or clean empty state if none exist

**Error State Management**
- Remove the current "Failed to load data" and "User not authenticated" error overlay
- Replace with appropriate empty states that match the application's design patterns
- Maintain error handling for legitimate data loading failures separate from authentication
- Show helpful messaging without promotional content

**User Interface Consistency**
- Follow existing component patterns using Tailwind CSS classes
- Maintain responsive design patterns established in ContextLibrary component
- Use consistent modal behavior and animations
- Preserve existing loading states and transitions

## Existing Code to Leverage

**AuthContext and Authentication Flow**
- Complete authentication system with email/password and Google OAuth in AuthContext.tsx
- Existing useAuthState() and useAuthActions() hooks for authentication state management
- ProfileModal.tsx provides full authentication interface with sign-in/sign-up functionality
- Automatic session restoration and OAuth hash processing

**Modal System**
- Reusable Modal.tsx component with consistent styling, animations, and accessibility
- CreateContextModal.tsx and CreatePromptModal.tsx for post-authentication content creation
- Existing modal management patterns in ContextLibrary component

**UI Component Infrastructure**
- ContextLibrary.tsx provides the main layout structure for logged-out browsing
- ContextBlocksGrid.tsx and SavedPromptList.tsx for content display components
- SearchBar.tsx with existing add button handlers that can be extended
- ProjectSidebar.tsx for project navigation functionality

**State Management**
- LibraryContext for managing projects, prompts, and data state
- Existing patterns for conditional rendering based on data availability
- Loading and error state management through SynchronizedLoading component

**Responsive Design System**
- Tailwind CSS configuration and utility classes
- Mobile-first responsive design patterns
- Consistent spacing, colors, and typography using neutral color palette

## Out of Scope
- Creating new authentication flows or modal components
- Adding promotional messaging or marketing content for logged-out users
- Modifying other tab experiences (prompt builder tab)
- Implementing new template content or sample data
- Changing the core authentication logic or database structure
- Implementing persistent user preferences or advanced onboarding flows