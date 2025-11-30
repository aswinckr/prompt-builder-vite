# Implementation Plan: Prompt Re-execution Bug Fix

## Technical Analysis

### Root Cause
The issue stems from using a modal-based ChatInterface that remains open in the background during navigation, causing useEffect hooks to trigger re-execution when users return to the prompt tab.

### New Architecture Solution
Replace the modal-based approach with immediate navigation to a unique conversation URL, eliminating the modal state management that causes re-execution issues.

### New Expected Flow
1. User executes prompt → Create conversation record → Navigate to `/conversation/{id}`
2. User navigates between tabs → No execution occurs (no modal state to manage)
3. User returns to prompt tab → No automatic re-execution (conversation already exists)

## Implementation Strategy

### Phase 1: Component Removal and Cleanup

#### 1.1 Remove ChatInterface Component
```bash
# Files to delete
rm src/components/ChatInterface.tsx
rm src/components/__tests__/ChatInterface.test.tsx (if exists)
```

#### 1.2 Clean Up LibraryContext
```typescript
// In LibraryContext.tsx - remove from ChatState interface
interface ChatState {
  // Remove: isChatPanelOpen: boolean;
  // Remove: selectedModel: string;
  // Remove: hasExecutedOnce: boolean;
  // Remove: currentConversationId: string | null;
  // Remove: isNavigationMode: boolean;
}

// Remove these actions from LibraryAction type
// | { type: 'SET_CHAT_PANEL_OPEN'; payload: boolean }
// | { type: 'SET_HAS_EXECUTED_ONCE'; payload: boolean }
// | { type: 'SET_CURRENT_CONVERSATION_ID'; payload: string | null }
// | { type: 'SET_NAVIGATION_MODE'; payload: boolean }

// Remove corresponding reducer cases
```

#### 1.3 Update App.tsx
```typescript
// Remove ChatInterface import and usage
// Remove modal state management
// Update routing if needed for conversation routes
```

### Phase 2: Extend ConversationDetail for Execution

#### 2.1 Add Execution Mode to ConversationDetail
```typescript
// In ConversationDetail.tsx
interface ConversationDetailProps {
  // No new props needed - detect execution mode via URL params
}

// Add execution state
const [isExecuting, setIsExecuting] = useState(false);
const [executionError, setExecutionError] = useState<string | null>(null);
const [promptToExecute, setPromptToExecute] = useState<string | null>(null);
const [selectedModel, setSelectedModel] = useState<string | null>(null);
```

#### 2.2 Add Execution Detection Logic
```typescript
// Add to ConversationDetail component
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const executePrompt = searchParams.get('execute');
  const model = searchParams.get('model');
  const prompt = searchParams.get('prompt');

  if (executePrompt === 'true' && prompt && model && messages.length === 0) {
    setPromptToExecute(prompt);
    setSelectedModel(model);
    setIsExecuting(true);
    executePromptInConversation(prompt, model);
  }
}, [location.search]);
```

#### 2.3 Implement Execution in ConversationDetail
```typescript
const executePromptInConversation = async (prompt: string, model: string) => {
  try {
    setExecutionError(null);

    // Create initial user message
    const userMessage = await ConversationMessageService.createMessage({
      conversation_id: conversationId,
      role: 'user',
      content: prompt,
      token_count: Math.round(prompt.length / 4),
      metadata: {}
    });

    // Add to UI state
    setMessages(prev => [...prev, userMessage]);

    // Execute AI response (reuse ChatInterface logic)
    await executeAIResponse(prompt, model, conversationId);

  } catch (error) {
    setExecutionError(error.message);
  } finally {
    setIsExecuting(false);
  }
};
```

### Phase 3: Update PromptBuilder Execution

#### 3.1 Modify PromptBuilder Execution Logic
```typescript
// In PromptBuilder.tsx
const handleExecutePrompt = async () => {
  try {
    const prompt = assemblePrompt();

    // Create conversation immediately
    const conversation = await createConversation({
      title: generateConversationTitle(prompt),
      model_name: selectedModel,
      model_provider: 'openrouter',
      original_prompt_content: prompt,
      metadata: {
        started_at: new Date().toISOString(),
        interface: 'prompt_builder'
      }
    });

    if (conversation.data) {
      // Navigate to conversation with execution parameters
      navigate(`/conversation/${conversation.data.id}?execute=true&prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`);
    }
  } catch (error) {
    showToast('Failed to create conversation', 'error');
  }
};
```

#### 3.2 Remove ChatInterface Integration
```typescript
// Remove all ChatInterface related code from PromptBuilder
// Remove SET_CHAT_PANEL_OPEN actions
// Remove modal state management
// Clean up any useEffect hooks related to chat panel
```

### Phase 4: Navigation and URL Management

#### 4.1 Update React Router Configuration
```typescript
// Ensure conversation route is properly configured
// In App.tsx or router configuration
<Route path="/conversation/:conversationId" element={<ConversationDetail />} />
```

#### 4.2 Handle URL Parameters
```typescript
// In ConversationDetail - add URL parameter handling
const { conversationId } = useParams<{ conversationId: string }>();
const location = useLocation();

// Parse execution parameters
const shouldExecute = location.search.includes('execute=true');
const promptFromUrl = new URLSearchParams(location.search).get('prompt');
const modelFromUrl = new URLSearchParams(location.search).get('model');
```

#### 4.3 Clean URLs After Execution
```typescript
// Clean URL parameters after execution completes
useEffect(() => {
  if (!isExecuting && promptToExecute && messages.length > 1) {
    // Remove execution parameters from URL
    const cleanUrl = `/conversation/${conversationId}`;
    navigate(cleanUrl, { replace: true });
  }
}, [isExecuting, messages.length]);
```

### Phase 5: Error Handling and Edge Cases

#### 5.1 Handle Conversation Creation Failures
```typescript
const handleExecutePrompt = async () => {
  try {
    const conversation = await createConversation({...});

    if (!conversation.data) {
      throw new Error('Failed to create conversation');
    }
    // ... rest of execution logic

  } catch (error) {
    showToast('Failed to start conversation', 'error');
    // Optionally: Show error state in PromptBuilder
  }
};
```

#### 5.2 Handle Navigation During Execution
```typescript
// Add cleanup for interrupted executions
useEffect(() => {
  return () => {
    // Cleanup any ongoing executions if component unmounts
    if (abortController) {
      abortController.abort();
    }
  };
}, [conversationId]);
```

#### 5.3 Handle Invalid URL Parameters
```typescript
// Validate execution parameters
const validateExecutionParams = (prompt: string, model: string) => {
  return prompt && prompt.trim().length > 0 &&
         model && model.trim().length > 0;
};

// Only execute if parameters are valid
if (shouldExecute && validateExecutionParams(promptFromUrl, modelFromUrl)) {
  // Execute prompt
} else if (shouldExecute) {
  // Handle invalid parameters
  setExecutionError('Invalid prompt or model specified');
}
```

### Phase 6: State Management and Context Updates

#### 6.1 Update LibraryContext State
```typescript
// Simplify ChatState interface
interface ChatState {
  // Remove all chat panel related state
  // Keep only conversation-related state if needed
}

// Remove chat panel actions and reducer cases
// Keep conversation actions (createConversation, etc.)
```

#### 6.2 Update Global State Usage
```typescript
// Remove chat panel state from any components
// Update components that relied on SET_CHAT_PANEL_OPEN
// Ensure proper state cleanup throughout the app
```

## Migration Steps

### Step 1: Backup and Preparation
1. Create git branch for the changes
2. Backup current ChatInterface implementation
3. Document current modal behavior for reference

### Step 2: Component Removal
1. Remove ChatInterface.tsx and related files
2. Clean up LibraryContext chat panel state
3. Update App.tsx routing and imports

### Step 3: Extend ConversationDetail
1. Add execution mode detection
2. Implement prompt execution logic
3. Add loading states and error handling

### Step 4: Update PromptBuilder
1. Replace ChatInterface modal with navigation
2. Add conversation creation before navigation
3. Update loading indicators and user feedback

### Step 5: Testing and Validation
1. Test prompt execution flow end-to-end
2. Verify navigation doesn't trigger re-execution
3. Test error scenarios and edge cases
4. Validate existing conversation functionality

### Step 6: Cleanup and Documentation
1. Remove any remaining chat panel references
2. Update component documentation
3. Add JSDoc comments for new execution logic

## Implementation Checklist

- [ ] Delete ChatInterface.tsx and related test files
- [ ] Remove SET_CHAT_PANEL_OPEN action from LibraryContext
- [ ] Clean up chat panel state from ChatState interface
- [ ] Update App.tsx to remove ChatInterface imports and usage
- [ ] Extend ConversationDetail with execution mode detection
- [ ] Implement prompt execution logic in ConversationDetail
- [ ] Add URL parameter parsing and validation
- [ ] Update PromptBuilder to use navigation instead of modal
- [ ] Add conversation creation before navigation in PromptBuilder
- [ ] Implement URL cleanup after execution
- [ ] Add proper error handling for conversation creation failures
- [ ] Add cleanup for interrupted executions
- [ ] Test full execution flow: PromptBuilder → ConversationDetail
- [ ] Test navigation scenarios: no re-execution
- [ ] Verify existing conversation functionality remains intact
- [ ] Update documentation and component comments

## Risk Mitigation

### Potential Issues
1. **Breaking existing conversation functionality**: Risk of breaking ConversationDetail for saved conversations
2. **Navigation complexity**: Managing state during navigation and execution
3. **URL parameter handling**: Security and validation concerns
4. **State synchronization**: Ensuring proper state updates during execution

### Mitigation Strategies
1. **Incremental implementation**: Test ConversationDetail changes thoroughly before removing ChatInterface
2. **Comprehensive error handling**: Add proper error states and recovery mechanisms
3. **Input validation**: Validate all URL parameters and user inputs
4. **Preserve existing functionality**: Ensure saved conversations work exactly as before

### Rollback Plan
1. Keep ChatInterface implementation in a separate branch for quick rollback
2. Use feature flags if needed for gradual rollout
3. Monitor user behavior and performance closely after deployment
4. Have hotfix procedures ready for critical issues