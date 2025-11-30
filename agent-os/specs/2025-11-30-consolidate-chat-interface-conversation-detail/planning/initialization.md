# Chat Interface and Conversation Detail Consolidation

## Initial Idea

Create a unified conversation component by consolidating ChatInterface.tsx and ConversationDetail.tsx into a single component that can handle both live chat execution and historical conversation viewing.

## Current State

**ChatInterface.tsx** (`src/components/ChatInterface.tsx`):
- Side panel on `/prompt` page when executing prompts
- No URL - modal/overlay interface
- Handles streaming AI responses from OpenRouter
- Manages conversation creation and message saving
- Real-time chat with typing indicators, stop/regenerate/copy/favorite features
- Auto-creates conversations when first message is sent

**ConversationDetail.tsx** (`src/components/ConversationDetail.tsx`):
- Accessed via URL route `/conversation/:conversationId`
- Displays saved conversations from history
- Loads messages from database using ConversationMessageService
- Read-only view with export, copy, delete, favorite features
- Shows conversation metadata (model, tokens, duration, cost)
- No real-time streaming or input capabilities

## Expected Outcome

1. Use only ConversationDetail component for both live chat execution and historical viewing
2. Create a URL immediately when executing a prompt
3. Enable real-time chat functionality in ConversationDetail
4. Remove ChatInterface entirely and use one unified component

## Key Requirements to Clarify

- Routing & Navigation approach for prompt execution redirection
- Component state management strategy for live vs historical modes
- Real-time feature implementation scope
- UI/UX considerations for side-panel vs full-page views
- Data loading strategy for current vs historical messages
- Error handling differences between modes