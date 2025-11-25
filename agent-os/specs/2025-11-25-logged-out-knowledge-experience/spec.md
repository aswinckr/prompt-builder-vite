# Specification: Logged-Out Knowledge Experience

## Goal
Enable logged-out users to explore the knowledge interface without blocking authentication, while prompting sign-in for add actions and providing a smooth, non-blocking experience that encourages authentication.

## User Stories
- As a logged-out user, I want to view the knowledge interface and search functionality so I can explore the platform without commitment
- As a logged-out user, I want to be prompted to sign in when trying to add knowledge or prompts so I can understand the value of creating an account

## Specific Requirements

**Read-Only Interface Access**
- Display the same interface layout as authenticated users with empty/default state
- Show SearchBar component but display "No results found" or similar empty state for searches
- Maintain responsive design patterns already established in the codebase
- Ensure bottom tab navigation works properly for logged-out users

**Authentication Gate for Add Actions**
- Intercept clicks on "Add Knowledge" and "Add Prompt" buttons for logged-out users
- Open ProfileModal in authentication mode instead of CreateContextModal/CreatePromptModal
- Preserve the existing ProfileModal authentication UI (email/password + Google OAuth)
- Close modal after successful authentication and redirect to appropriate add action

**Empty State Management**
- Display appropriate empty state messaging for context blocks grid
- Show placeholder content that indicates what would be available with an account
- Maintain consistent styling with existing empty states in the application
- Ensure copy functionality is available even with empty state (future-proofing)

**Authentication State Integration**
- Use existing useAuthState hook to determine authentication status
- Leverage existing useAuthActions for authentication flows
- Maintain existing error handling patterns from AuthContext
- Ensure loading states are handled consistently with current patterns

**Copy Functionality**
- Enable copy-to-clipboard actions for any visible knowledge content
- Use existing copy patterns from PromptBuilder component
- Provide visual feedback for successful copy operations
- Handle clipboard access errors gracefully

**Mobile Responsive Behavior**
- Maintain existing mobile-responsive sidebar behavior
- Ensure ProfileModal works properly in fullscreen mode on mobile
- Preserve mobile search bar and navigation patterns
- Test touch interactions for add buttons on mobile devices

**Navigation and Routing**
- Maintain existing route structure (/knowledge for logged-out users)
- Preserve bottom tab navigation functionality
- Ensure proper focus management when modals open/close
- Handle browser back button correctly for modal states

## Visual Design

No visual assets provided. Design should follow existing UI patterns:
- Use established color scheme (neutral-900 background, neutral-700/800 borders)
- Maintain existing component spacing and typography
- Follow established modal patterns from ProfileModal
- Preserve existing button styling and hover states
- Use established loading states and error messaging patterns

## Existing Code to Leverage

**ProfileModal Component**
- Contains complete authentication UI with email/password forms
- Includes Google OAuth integration already implemented
- Handles both sign-in and sign-up flows
- Manages error states and loading states appropriately
- Should be reused with minimal modifications for logged-out authentication prompts

**AuthContext System**
- Provides useAuthState() hook for checking authentication status
- Offers useAuthActions() for authentication operations
- Handles session management and state updates automatically
- Includes proper error handling and loading state management
- Can be leveraged to determine when to show authentication prompts

**ContextLibrary Layout Structure**
- Already implements responsive sidebar behavior
- Contains SearchBar component with appropriate styling
- Includes proper mobile navigation patterns
- Manages modal states for multiple different modals
- Should be extended to handle authentication state checks

**SearchBar Component**
- Already handles both "Add Knowledge" and "Add Prompt" buttons
- Includes proper responsive text handling (hidden/visible text based on screen size)
- Uses established button styling and hover effects
- Can be modified to check authentication state before calling onAdd callbacks

**BottomTabNavigation**
- Provides navigation between Prompt and Knowledge tabs
- Already handles route changes and active states
- Uses MotionHighlight for smooth transitions
- Works correctly for both authenticated and logged-out users

## Out of Scope
- Creating demo content for logged-out users to view
- Implementing view-only restrictions on existing content (interface will be empty)
- Adding persistent CTA banners or marketing messaging
- Modifying the core authentication flows in ProfileModal
- Implementing social sharing features for logged-out users
- Creating separate "preview" mode for content
- Modifying the existing PromptBuilder component behavior for logged-out users
- Implementing analytics or tracking for logged-out user behavior
- Creating premium/gated content experiences