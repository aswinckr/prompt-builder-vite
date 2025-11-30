# Requirements: Prompt Re-execution Bug Fix

## Problem Statement
When a user executes a prompt in the /prompt tab, then navigates to the /knowledge tab, then goes back to the /prompt tab, the previous prompt gets automatically re-executed. This is unwanted behavior that leads to unintended API calls and potential cost implications.

## Current Behavior (Problematic)
1. User builds a prompt and executes it in /prompt tab
2. ChatInterface modal opens with the prompt execution
3. User navigates to /knowledge tab (chat remains open in background)
4. User returns to /prompt tab
5. The previously executed prompt automatically re-executes due to useEffect hooks

## Expected Behavior
1. User executes a prompt in /prompt tab
2. System immediately creates a unique conversation URL and navigates to ConversationDetail view
3. Prompt execution runs in the ConversationDetail view with a unique URL (like chat history)
4. User can navigate between tabs freely without any automatic re-execution
5. The prompt builder content should remain as last left by the user for potential editing
6. Each prompt execution creates a new, unique conversation accessible via its URL

## User Stories
- As a user, I want prompt execution to create a unique URL immediately, so that I can navigate freely without automatic re-execution.
- As a user, I want all prompt executions to happen in the ConversationDetail view, so that I have a consistent experience.
- As a user, I want my prompt content to remain in the builder after execution, so that I can review or modify it as needed.
- As a user, I want each executed prompt to be saved as a unique conversation, so that I can reference it later.

## Acceptance Criteria
- Prompt execution must immediately create a unique conversation URL and navigate to ConversationDetail
- ChatInterface component must be completely removed from the codebase
- All prompt execution must happen in ConversationDetail view only
- Navigation between tabs should not trigger any prompt execution
- Previously executed prompt content should remain editable in the prompt builder
- Each prompt execution should create a new conversation with a unique URL
- Solution should maintain existing functionality for conversation history and access
- URLs for new conversations should follow the same pattern as existing conversation history

## Technical Constraints
- Must completely remove ChatInterface component and all related code
- Must use ConversationDetail as the single view for all prompt execution
- Must maintain existing conversation history functionality and URL patterns
- Must preserve prompt builder state during navigation
- Should work with current React Router navigation patterns
- Must integrate with existing LibraryContext state management
- Should maintain existing database schema and conversation storage

## Out of Scope
- Changes to ConversationDetail component UI/UX (beyond prompt execution integration)
- Modifications to conversation history functionality
- Changes to authentication or user management
- Database schema modifications
- Changes to model selection or configuration
- Modifications to existing conversation URLs or access patterns