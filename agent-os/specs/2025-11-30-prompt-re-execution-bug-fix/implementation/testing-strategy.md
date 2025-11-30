# Testing Strategy: Prompt Re-execution Bug Fix

## Overview
This document outlines the comprehensive testing approach to ensure the simplified architecture works correctly - removing ChatInterface and using ConversationDetail for all prompt execution.

## Test Categories

### 1. Unit Tests

#### 1.1 PromptBuilder Component Tests
**File Location**: `src/components/__tests__/PromptBuilder.test.tsx`

**Test Cases**:
```typescript
describe('PromptBuilder Navigation-Based Execution', () => {
  test('should create conversation and navigate on prompt execution', async () => {
    const mockCreateConversation = jest.fn().mockResolvedValue({
      data: { id: 'conv-123' }
    });
    const mockNavigate = jest.fn();

    // Build and execute prompt
    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    // Verify conversation was created
    expect(mockCreateConversation).toHaveBeenCalledWith(expect.objectContaining({
      model_name: expect.any(String),
      original_prompt_content: expect.any(String)
    }));

    // Verify navigation occurred with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith(
      '/conversation/conv-123?execute=true&prompt=...&model=...'
    );
  });

  test('should handle conversation creation failure gracefully', async () => {
    const mockCreateConversation = jest.fn().mockRejectedValue(
      new Error('Failed to create conversation')
    );
    const mockShowToast = jest.fn();

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(mockShowToast).toHaveBeenCalledWith('Failed to create conversation', 'error');
  });

  test('should preserve prompt builder state after execution', async () => {
    // Build prompt with blocks and custom text
    // Execute prompt
    // Verify prompt content remains in builder
  });

  test('should not open ChatInterface modal', async () => {
    // Execute prompt
    // Verify ChatInterface component is not rendered
    // Verify no modal state management occurs
  });
});
```

#### 1.2 ConversationDetail Component Tests
**File Location**: `src/components/__tests__/ConversationDetail.test.tsx`

**Test Cases**:
```typescript
describe('ConversationDetail Execution Integration', () => {
  test('should detect execution mode from URL parameters', () => {
    render(
      <MemoryRouter initialEntries={['/conversation/conv-123?execute=true&prompt=test&model=gpt-4']}>
        <ConversationDetail />
      </MemoryRouter>
    );

    expect(screen.getByText(/executing/i)).toBeInTheDocument();
  });

  test('should execute prompt when execution parameters are valid', async () => {
    const mockCreateMessage = jest.fn().mockResolvedValue({
      id: 'msg-1',
      role: 'user',
      content: 'test prompt'
    });

    render(
      <MemoryRouter initialEntries={['/conversation/conv-123?execute=true&prompt=test&model=gpt-4']}>
        <ConversationDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockCreateMessage).toHaveBeenCalledWith(expect.objectContaining({
        conversation_id: 'conv-123',
        role: 'user',
        content: 'test prompt'
      }));
    });
  });

  test('should not execute prompt for saved conversations without execution params', () => {
    render(
      <MemoryRouter initialEntries={['/conversation/conv-123']}>
        <ConversationDetail />
      </MemoryRouter>
    );

    expect(screen.queryByText(/executing/i)).not.toBeInTheDocument();
  });

  test('should handle invalid execution parameters', () => {
    render(
      <MemoryRouter initialEntries={['/conversation/conv-123?execute=true&prompt=&model=']}>
        <ConversationDetail />
      </MemoryRouter>
    );

    expect(screen.getByText(/invalid prompt or model/i)).toBeInTheDocument();
  });

  test('should clean URL parameters after execution completes', async () => {
    const mockNavigate = jest.fn();

    render(
      <MemoryRouter initialEntries={['/conversation/conv-123?execute=true&prompt=test&model=gpt-4']}>
        <ConversationDetail />
      </MemoryRouter>
    );

    // Simulate execution completion
    await act(async () => {
      // Complete execution...
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/conversation/conv-123', { replace: true });
    });
  });
});
```

#### 1.3 LibraryContext Tests
**File Location**: `src/contexts/__tests__/LibraryContext.test.tsx`

**Test Cases**:
```typescript
describe('LibraryContext Simplified State', () => {
  test('should not have chat panel state', () => {
    const state = useLibraryState();

    expect(state.chat.isChatPanelOpen).toBeUndefined();
    expect(state.chat.hasExecutedOnce).toBeUndefined();
    expect(state.chat.isNavigationMode).toBeUndefined();
  });

  test('should maintain conversation functionality', () => {
    const { createConversation, createConversationMessage } = useLibraryActions();

    expect(typeof createConversation).toBe('function');
    expect(typeof createConversationMessage).toBe('function');
  });

  test('should not have SET_CHAT_PANEL_OPEN action', () => {
    // Verify SET_CHAT_PANEL_OPEN action is removed
    const actions = Object.keys(LibraryAction);
    expect(actions).not.toContain('SET_CHAT_PANEL_OPEN');
  });
});
```

#### 1.4 Navigation and Routing Tests
**File Location**: `src/__tests__/Navigation.test.tsx`

**Test Cases**:
```typescript
describe('Navigation-Based Execution Flow', () => {
  test('should navigate to conversation URL with correct parameters', async () => {
    const history = createMemoryHistory();
    const mockCreateConversation = jest.fn().mockResolvedValue({
      data: { id: 'conv-123' }
    });

    render(
      <Router history={history}>
        <PromptBuilder />
      </Router>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Run'));
    });

    expect(history.location.pathname).toBe('/conversation/conv-123');
    expect(history.location.search).toContain('execute=true');
    expect(history.location.search).toContain('prompt=');
    expect(history.location.search).toContain('model=');
  });

  test('should handle navigation interruptions gracefully', async () => {
    // Test what happens when user navigates away during execution
    // Verify cleanup occurs properly
  });
});
```

### 2. Integration Tests

#### 2.1 End-to-End Execution Flow Tests
**File Location**: `src/test/__tests__/PromptExecutionFlow.test.tsx`

```typescript
describe('Complete Prompt Execution Flow', () => {
  test('should execute prompt and navigate without re-execution issues', async () => {
    // 1. Start at /prompt page
    // 2. Build prompt with blocks and custom text
    // 3. Click run button
    // 4. Verify conversation creation
    // 5. Verify navigation to conversation URL
    // 6. Verify prompt execution in ConversationDetail
    // 7. Navigate back to /prompt
    // 8. Verify no automatic re-execution
  });

  test('should maintain conversation history functionality', async () => {
    // Execute prompt → create conversation
    // Navigate to /history
    // Verify new conversation appears in history
    // Click on conversation → verify proper loading
  });

  test('should handle multiple prompt executions correctly', async () => {
    // Execute prompt 1 → navigate → execute prompt 2
    // Verify both conversations exist
    // Verify URLs are unique
    // Verify no state contamination
  });
});
```

#### 2.2 Navigation State Preservation Tests
**File Location**: `src/test/__tests__/NavigationState.test.tsx`

```typescript
describe('Navigation State Preservation', () => {
  test('should preserve prompt builder state during navigation', async () => {
    // Build complex prompt
    // Execute → navigate to conversation
    // Navigate back to prompt
    // Verify all blocks, custom text, and model selection preserved
  });

  test('should handle rapid navigation without issues', async () => {
    // Execute prompt → rapidly navigate between tabs
    // Verify no state corruption
    // Verify no duplicate executions
  });

  test('should handle browser back/forward correctly', async () => {
    // Execute prompt → navigate away → use browser back
    // Verify conversation loads properly
    // Verify no unwanted executions
  });
});
```

### 3. End-to-End Tests

#### 3.1 User Journey Tests
**File Location**: `src/test/__tests__/UserJourneyE2E.test.tsx`

```typescript
describe('User Journey E2E Tests', () => {
  test('complete workflow: build → execute → navigate → return', async () => {
    // 1. User navigates to /prompt
    // 2. User builds prompt with multiple blocks
    // 3. User selects model
    // 4. User clicks run button
    // 5. Verify immediate navigation to conversation URL
    // 6. Verify prompt execution starts automatically
    // 7. Wait for execution to complete
    // 8. User navigates to /knowledge tab
    // 9. User navigates back to /prompt tab
    // 10. Verify: no automatic re-execution
    // 11. Verify: prompt content preserved
    // 12. Verify: can build new prompt
  });

  test('conversation management workflow', async () => {
    // Execute multiple prompts
    // Navigate to history
    // Access previous conversations
    // Verify all conversations work properly
  });
});
```

### 4. Manual Testing Scenarios

#### 4.1 Core Functionality Tests
**Test Sheet**: `manual-testing-checklist.md`

```markdown
## Manual Testing Checklist

### Basic Execution Flow
- [ ] Build prompt → Click Run → Immediate navigation to conversation URL
  - Expected: URL format: /conversation/{id}?execute=true&prompt=...&model=...
  - Expected: Conversation record created immediately
  - Expected: Prompt execution starts in ConversationDetail

### Navigation Safety
- [ ] Execute prompt → Navigate to Knowledge → Return to Prompt
  - Expected: No automatic re-execution
  - Expected: Prompt content preserved
  - Expected: No modal windows

### Conversation Management
- [ ] Execute prompt → Check conversation history
  - Expected: New conversation appears in history
  - Expected: Can access via URL directly
  - Expected: All conversation features work

### Error Scenarios
- [ ] Execute prompt with network error
  - Expected: Proper error message
  - Expected: No navigation occurs
  - Expected: Prompt builder state preserved

- [ ] Navigate to invalid execution URL
  - Expected: Proper error handling
  - Expected: No crashes
  - Expected: Can navigate away
```

#### 4.2 Performance and Resource Tests

```markdown
### Performance Testing
- [ ] Monitor API calls during navigation
  - Expected: No duplicate API calls
  - Expected: Proper conversation creation
  - Expected: Clean resource management

- [ ] Memory usage during multiple executions
  - Expected: No memory leaks
  - Expected: Proper cleanup of execution states
  - Expected: Stable performance over time

- [ ] URL parameter handling
  - Expected: No URL parameter bloat
  - Expected: Clean URLs after execution
  - Expected: Proper encoding of special characters
```

### 5. Regression Tests

#### 5.1 Existing Functionality Preservation
**File Location**: `src/test/__tests__/RegressionTests.test.tsx`

```typescript
describe('Regression Tests', () => {
  test('conversation history functionality unchanged', async () => {
    // Test conversation history access
    // Verify conversation detail view works
    // Verify all conversation features work as before
  });

  test('prompt builder features unaffected', async () => {
    // Test all prompt builder features
    // Verify drag-and-drop works
    // Verify content editing works
    // Verify model selection works
  });

  test('no ChatInterface references remain', () => {
    // Search codebase for ChatInterface references
    // Verify no imports or usage remain
    // Verify no chat panel state management
  });
});
```

## Test Environment Setup

### Testing Dependencies
- **Jest**: Unit and integration tests
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for OpenRouter calls
- **React Router Testing**: Navigation and routing simulation
- **URLSearchParams Mocking**: For URL parameter testing

### Mock Configuration
```typescript
// test/setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/conversation/test-id',
    search: '?execute=true&prompt=test&model=gpt-4'
  }),
  useParams: () => ({ conversationId: 'test-id' })
}));

// Mock URLSearchParams
global.URLSearchParams = jest.fn().mockImplementation(() => ({
  get: jest.fn((key) => {
    const params = {
      'execute': 'true',
      'prompt': 'test prompt',
      'model': 'gpt-4'
    };
    return params[key] || null;
  })
}));
```

### Test Data Management
```typescript
// test/fixtures/conversations.ts
export const testConversations = {
  newExecution: {
    id: 'conv-123',
    title: 'New Conversation',
    messages: [],
    is_new: true
  },
  existingConversation: {
    id: 'conv-456',
    title: 'Previous Chat',
    messages: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ],
    is_new: false
  }
};

// test/fixtures/prompts.ts
export const testPrompts = {
  simplePrompt: "Hello, world!",
  complexPrompt: "Custom introduction with context",
  encodedPrompt: "Hello%20world%21%20This%20is%20a%20test."
};
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Prompt Re-execution Architecture Change Tests

on:
  push:
    paths:
      - 'src/components/PromptBuilder.tsx'
      - 'src/components/ConversationDetail.tsx'
      - 'src/contexts/LibraryContext.tsx'
      - 'src/components/ChatInterface.tsx' # Should be deleted
  pull_request:
    paths:
      - 'src/components/PromptBuilder.tsx'
      - 'src/components/ConversationDetail.tsx'
      - 'src/contexts/LibraryContext.tsx'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

  verify-cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify ChatInterface removal
        run: |
          if [ -f "src/components/ChatInterface.tsx" ]; then
            echo "ChatInterface.tsx should be deleted"
            exit 1
          fi
          if grep -r "ChatInterface" src/ --exclude-dir=node_modules; then
            echo "ChatInterface references should be removed"
            exit 1
          fi
```

## Success Criteria

### Must Pass
1. ChatInterface completely removed from codebase
2. Prompt execution creates unique conversation URL immediately
3. Navigation between tabs never triggers re-execution
4. Existing conversation functionality remains intact
5. All prompt builder features work as before
6. No modal-based chat interfaces remain

### Performance Benchmarks
- Conversation creation time: < 500ms
- Navigation to conversation URL: < 100ms
- Execution start time: < 200ms after navigation
- Memory usage: No significant increase vs current implementation
- URL parameter size: < 2000 characters

### Code Quality
- Test coverage: > 90% for modified files
- No ChatInterface references in codebase
- All tests pass consistently
- No console errors or warnings
- Proper error handling in all execution scenarios