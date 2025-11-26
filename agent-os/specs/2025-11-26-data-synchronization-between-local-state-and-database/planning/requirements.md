# Spec Requirements: Data Synchronization Between Local State and Database

## Initial Description
The user wants to ensure data synchronization between local state and database. When they save a prompt and navigate to the knowledge tab, the data is still local and not synced to the database, so saved prompts don't appear. They want the library context (which contains all context data) to be updated after every CRUD operation in the app to ensure data is always latest from the database.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the synchronization should happen immediately after any CRUD operation completes successfully. Should we wait for database confirmation before updating the local state, or should we optimistically update local state and handle rollbacks on errors?

**Answer:** Wait for database confirmation before updating the local state.

**Q2:** I'm thinking this should specifically target the library context actions that modify context blocks and saved prompts. Should this also include other data types like projects, folders, or user settings?

**Answer:** Focus mainly on context blocks and saved prompts.

**Q3:** For context modification operations, should we modify the existing library context actions to automatically handle the data refresh, or create new wrapper actions that perform both the operation and refresh?

**Answer:** Modify library context actions to automatically handle data refresh.

**Q4:** When refreshing data after a CRUD operation, should we only refresh the specific data type that was modified (e.g., only context blocks after updating a block) or should we refresh all data types to ensure maximum consistency?

**Answer:** Refresh all data types after any CRUD operation for consistency.

**Q5:** Should we implement a real-time synchronization mechanism using websockets/subscriptions, or would periodic polling be sufficient for this use case?

**Answer:** Real-time event-driven sync for now.

**Q6:** For the user experience, should we show loading indicators during data refresh operations, or should the refresh happen seamlessly in the background?

**Answer:** Real-time seamless experience with loading states and error handling.

**Q7:** Should we maintain separate local-only state for temporary blocks and only synchronize permanent knowledge blocks, or should all context blocks follow the same synchronization rules?

**Answer:** Temporary blocks remain local-only, not synced to database.

**Q8:** Are there any specific CRUD operations or data flows that should be excluded from this synchronization requirement? For example, should temporary operations, drafts, or local-only features be excluded?

**Answer:** No other exclusions beyond temporary blocks mentioned in Q7.

### Existing Code to Reference
Based on the user's response about similar features:

**Similar Features Identified:**
- Feature: LibraryContext - Path: `/Users/aswin/Documents/1-Projects/Prompt Builder/prompt-builder-vite/src/contexts/LibraryContext.tsx`
- Components to potentially reuse: The existing CRUD actions pattern in LibraryContext (createContextBlock, updateContextBlock, deleteContextBlock, createSavedPrompt, updateSavedPrompt, deleteSavedPrompt)
- Backend logic to reference: Service layer patterns from ContextService, PromptService, ProjectService

**Other Existing Patterns:**
- Service response pattern: DatabaseService with DatabaseResponse type
- Auth state integration: useAuthState hook pattern
- Loading state management: SET_LOADING/SET_ERROR actions pattern
- Data refresh pattern: loadInitialData function in LibraryContext

### Follow-up Questions
No follow-up questions needed based on the comprehensive user answers provided.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No design patterns identified from visual assets.

## Requirements Summary

### Functional Requirements
- Implement automatic library context refresh after every CRUD operation
- Wait for database confirmation before updating local state
- Refresh all data types (context blocks, saved prompts, projects) for consistency after any CRUD operation
- Maintain real-time event-driven synchronization
- Provide loading states and error handling during sync operations
- Preserve temporary blocks as local-only state
- Modify existing LibraryContext actions to handle automatic refresh

### Reusability Opportunities
- Extend existing CRUD actions in LibraryContext: createContextBlock, updateContextBlock, deleteContextBlock, createSavedPrompt, updateSavedPrompt, deleteSavedPrompt
- Leverage DatabaseService and DatabaseResponse patterns from existing services
- Follow existing loadInitialData pattern for refreshing data
- Reuse authentication state management from useAuthState
- Utilize existing loading/error state management patterns

### Scope Boundaries
**In Scope:**
- Context block CRUD operations (create, update, delete)
- Saved prompt CRUD operations (create, update, delete)
- Project/folder CRUD operations (create, update, delete)
- Library context automatic refresh mechanisms
- Real-time synchronization implementation
- Loading states and error handling
- Database confirmation waiting mechanism

**Out of Scope:**
- Temporary context blocks (remain local-only)
- User settings synchronization
- Local-only features and drafts
- Authentication state management
- Database schema changes

### Technical Considerations
- **Integration points**: LibraryContext actions, DatabaseService, existing service layers (ContextService, PromptService, ProjectService)
- **Existing system constraints**: Current service patterns, authentication flow, loading state management
- **Technology preferences stated**: Event-driven real-time sync, waiting for database confirmation
- **Similar code patterns to follow**:
  - DatabaseService.handleResponse pattern for error handling
  - loadInitialData parallel loading pattern using Promise.all
  - Context action creators with async/await pattern
  - State dispatch patterns for CRUD operations