# Spec Requirements: Conversation Interface Consolidation

## Initial Description
Create a unified conversation component by consolidating ChatInterface.tsx and ConversationDetail.tsx into a single component that can handle both live chat execution and historical conversation viewing. The goal is to eliminate the side panel experience and move to a full-page conversation view with immediate URL creation when executing prompts.

## Requirements Discussion

### User's Direct Answers

**Navigation Flow:**
- **Immediate redirect to full-page conversation view** - When a user executes a prompt from `/prompt`, they should be immediately redirected to a full-page conversation view at `/conversation/:conversationId`. No side panel experience.

**Component Mode Detection:**
- **Automatic detection + URL parameters** - The component should automatically detect live vs historical mode based on conversation state, and also support URL query parameters like `?live=true` to indicate initial live state during navigation.

**Historical Conversation Functionality:**
- **Full continuation support** - Users should be able to continue chatting in historical conversations. All ChatInterface features should work consistently whether starting a new conversation or continuing an existing one.

**URL Route Strategy:**
- **Create new `/conversation/:conversationId` route** - This should replace the current side panel approach. The existing `/history/:conversationId` route should redirect to the new route for backward compatibility.

**Message Loading Strategy:**
- **Hybrid approach** - The component should load existing messages from the database first, then seamlessly handle real-time streaming for new messages. This should work whether the conversation is being actively created or continued later.

**Feature Preservation:**
- **Keep all existing features** - The unified component should include:
  - From ChatInterface: streaming, stop generation, regenerate, typing indicators, auto-scroll
  - From ConversationDetail: info modal, export, copy, favorite, delete, metadata display

### Existing Code to Reference

**Similar UI Components:**
- `src/components/ChatMessage.tsx` - Already used by both components
- `src/components/AIPromptInput.tsx` - Used in ChatInterface for input
- `src/components/Modal.tsx` - Used for modals across the app
- `src/components/ui/` directory - Shared UI components like buttons

**Service Patterns:**
- `src/services/conversationMessageService.ts` - Database operations for messages
- `src/contexts/LibraryContext.tsx` - Conversation management
- `src/contexts/ToastContext.tsx` - Notification system

**Routing Patterns:**
- Current routing in `src/App.tsx` shows existing route structure
- `/prompt` route for the main interface
- `/history` route for conversation listing

**Similar Page Layouts:**
- Other full-page components in the app that use similar header/content layouts
- The existing ConversationDetail layout structure is a good base

### Technical Implementation Context

**Current ChatInterface Features to Migrate:**
- OpenRouter integration with `streamText` from AI SDK
- Real-time streaming and abort controller logic
- Auto-conversation creation with `createConversation`
- Message saving during streaming with accurate token counts
- Execution statistics tracking

**Current ConversationDetail Features to Preserve:**
- Database message loading with `ConversationMessageService.getMessagesByConversationId`
- Conversation metadata display (model, tokens, duration, cost)
- Export functionality and info modal
- Responsive layout and action buttons

**Key Integration Points:**
- Use existing `useLibraryActions` for conversation operations
- Maintain `useToast` for notifications
- Preserve existing message rendering with `ChatMessage` component

**State Management Strategy:**
- URL-based conversation identification
- Real-time connection management for streaming
- Database synchronization for message persistence

**Navigation Flow:**
1. User executes prompt on `/prompt`
2. Create conversation immediately
3. Redirect to `/conversation/:conversationId?live=true`
4. Start streaming in the unified component
5. Continue conversation as normal

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- Unified conversation component that handles both live streaming and historical viewing
- Immediate URL creation when executing prompts from `/prompt` page
- Full-page conversation experience (no side panel)
- Automatic mode detection based on conversation state and URL parameters
- Hybrid message loading (database first, then real-time streaming)

**User Actions Enabled:**
- Execute prompts with immediate redirection to conversation view
- Continue conversations in both new and historical contexts
- Access all ChatInterface features (streaming, stop, regenerate, copy, favorite)
- Access all ConversationDetail features (export, info modal, delete, metadata)

**Data Management:**
- Real-time message streaming with database synchronization
- Token counting and execution statistics tracking
- Conversation metadata preservation and display
- Export functionality for conversation history

### Reusability Opportunities

**Components to Reuse:**
- `ChatMessage.tsx` - Already shared between both components
- `AIPromptInput.tsx` - Input component from ChatInterface
- `Modal.tsx` - Existing modal system
- UI components from `src/components/ui/` directory

**Backend Patterns to Follow:**
- `ConversationMessageService` - Message database operations
- `LibraryContext` - Conversation management state
- `ToastContext` - Notification system integration

**Similar Features to Model After:**
- Existing full-page component layouts in the app
- Current ConversationDetail layout structure as base
- Existing routing patterns in `App.tsx`

### Scope Boundaries

**In Scope:**
- Complete consolidation of ChatInterface and ConversationDetail
- New `/conversation/:conversationId` route creation
- Backward compatibility redirect from `/history/:conversationId`
- All existing ChatInterface streaming features
- All existing ConversationDetail management features
- Real-time message loading and database synchronization
- OpenRouter integration with AI SDK streaming

**Out of Scope:**
- Fundamental changes to OpenRouter integration
- Database schema modifications
- Complete redesign of the UI system
- Changes to other unrelated components

### Technical Considerations

**Integration Points:**
- OpenRouter API integration with `streamText` from AI SDK
- Database operations through `ConversationMessageService`
- State management via `LibraryContext`
- Notification system via `ToastContext`

**Existing System Constraints:**
- Must work with current OpenRouter configuration
- Must preserve existing message data structure
- Must maintain compatibility with existing export functionality
- Must preserve conversation metadata accuracy

**Technology Preferences:**
- Continue using React hooks for state management
- Maintain existing TypeScript patterns
- Preserve current CSS/styling approach
- Keep existing testing patterns

**Similar Code Patterns to Follow:**
- Use `useLibraryActions` for conversation operations
- Follow existing modal patterns from `Modal.tsx`
- Implement error handling consistent with existing patterns
- Maintain responsive design approach from existing components