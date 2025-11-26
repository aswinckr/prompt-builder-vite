# Specification: Data Synchronization Between Local State and Database

## Goal
Ensure automatic data synchronization between local state and database by implementing real-time library context refresh after every CRUD operation to maintain data consistency across the application.

## User Stories
- As a user, I want my saved prompts to appear immediately in the knowledge tab after saving them so that I can access my latest data without manual refresh
- As a user, I want context blocks to be automatically synchronized across all app sections after CRUD operations so that I always see the most current data
- As a user, I want a seamless experience with loading states and proper error handling during data synchronization so that the application remains responsive and reliable

## Specific Requirements

**Automatic Library Context Refresh**
- Modify existing LibraryContext CRUD actions to automatically refresh all data types after successful operations
- Wait for database confirmation before updating local state to ensure data integrity
- Refresh all data types (context blocks, saved prompts, projects) after any CRUD operation for consistency
- Implement loading states during refresh operations to provide user feedback

**Event-Driven Real-time Synchronization**
- Implement real-time data synchronization using Supabase subscriptions
- Create event listeners for database changes on context_blocks, prompts, and projects tables
- Handle subscription cleanup to prevent memory leaks
- Filter real-time events by user_id to ensure users only receive their own data updates

**Enhanced CRUD Actions Integration**
- Extend createContextBlock, updateContextBlock, deleteContextBlock actions with auto-refresh
- Extend createSavedPrompt, updateSavedPrompt, deleteSavedPrompt actions with auto-refresh
- Extend project-related CRUD actions with auto-refresh
- Preserve temporary block functionality as local-only state without database sync

**Error Handling and User Experience**
- Implement proper error handling for sync operations with user-friendly messages
- Show loading indicators during data refresh operations
- Handle network failures gracefully with retry mechanisms
- Maintain application responsiveness during background sync operations

## Visual Design
No visual assets provided for this feature specification.

## Existing Code to Leverage

**LibraryContext Actions Pattern**
- Current CRUD actions in LibraryContext use async/await with DatabaseService calls
- Actions return DatabaseResponse objects and dispatch state updates on success
- Follow existing error handling patterns using try-catch blocks
- Reuse existing action creators with additional refresh logic

**loadInitialData Function**
- Uses Promise.all for parallel loading of all data types from ContextService, PromptService, ProjectService
- Includes proper error handling for multiple service calls
- Dispatches separate SET_* actions for each data type
- Can be reused as the core refresh mechanism after CRUD operations

**DatabaseService Patterns**
- DatabaseService.handleResponse provides consistent error handling across services
- DatabaseService.createRealtimeSubscription exists for implementing real-time sync
- DatabaseResponse<T> interface provides standardized return types
- DatabaseService.getUser handles authentication checks consistently

**Service Layer Architecture**
- ContextService, PromptService, ProjectService follow consistent CRUD patterns
- All services use DatabaseService for authentication and error handling
- Services implement proper TypeScript interfaces for data structures
- Existing methods can be extended with subscription management

**Loading State Management**
- SET_LOADING/SET_ERROR action pattern for managing sync states
- Folder modal loading pattern can be reused for CRUD operation loading
- Authentication integration with useAuthState hook for authenticated data loading

## Out of Scope
- Temporary context blocks (remain local-only without database synchronization)
- User settings and preferences synchronization
- Authentication state management modifications
- Database schema changes or migrations
- Offline functionality or conflict resolution
- Real-time collaboration between multiple users
- Data export/import functionality
- Bulk operations or batch processing
- Data analytics or usage tracking
- Third-party integrations beyond existing Supabase setup