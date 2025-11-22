# Specification: Streaming Results Side Panel

## Goal
Create a sliding side panel that displays real-time streaming AI responses from Gemini 2.5 Pro via OpenRouter when users run prompts, with typewriter animation effects and comprehensive control features.

## User Stories
- As a user, I want to see AI responses streaming in real-time when I run a prompt so that I can get immediate feedback and see the model thinking process
- As a user, I want to stop streaming at any point and save my prompt with results so that I have control over the interaction and can preserve useful conversations
- As a user, I want to select different AI models including Gemini 2.5 Pro so that I can compare responses and choose the best model for my needs

## Specific Requirements

**Side Panel Component Architecture**
- Create new StreamingSidePanel component that slides in from right side covering 40% viewport width
- Implement smooth slide-in animation using CSS transitions and Tailwind classes
- Use React Portal to render side panel outside main DOM hierarchy for proper z-index layering
- Add overlay backdrop that dims main content when side panel is open
- Include close button (X) in top-right corner for manual dismissal

**Streaming Display Implementation**
- Integrate AI SDK v5.0.99 with @openrouter/ai-sdk-provider for Gemini 2.5 Pro model calls
- Implement typewriter animation effect displaying tokens as they arrive from streaming response
- Use React state to accumulate streaming text and re-render with each new token
- Add auto-scrolling to keep latest content visible during streaming
- Display streaming status indicator (pulsing dot or animated text) when active

**Model Selector Enhancement**
- Extend existing model dropdown in PromptBuilder header to include OpenRouter models
- Add Gemini 2.5 Pro and other popular OpenRouter models to dropdown options
- Store selected model in LibraryContext state for persistence across interactions
- Maintain backward compatibility with existing Claude model options

**State Management Integration**
- Add new state properties to LibraryContext: streamingPanelOpen, currentModel, streamingContent, streamingStatus
- Implement actions: setStreamingPanelOpen, setSelectedModel, updateStreamingContent, setStreamingStatus
- Integrate with existing setExecutionPanel action to trigger streaming panel open
- Maintain conversation history in context for multi-turn dialogues

**Control Features Implementation**
- Add stop streaming button that aborts current AI SDK request using AbortController
- Implement save prompt functionality that stores formatted prompt with streaming response
- Add retry button that re-sends last prompt to the same model
- Include copy response button for easy text copying from streaming results

**OpenRouter API Integration**
- Configure AI SDK to use OpenRouter's API endpoint: https://openrouter.ai/api/v1/chat/completions
- Implement proper OpenRouter headers including HTTP-Referer and X-Title for application identification
- Use Gemini 2.5 Pro model identifier: "google/gemini-2.5-pro-latest"
- Handle OpenRouter-specific error responses and rate limiting
- Implement model availability checking through OpenRouter's models endpoint

**Error Handling and Loading States**
- Show loading spinner while establishing connection to OpenRouter API
- Display user-friendly error messages for network issues, API errors, or model unavailability
- Implement exponential backoff retry mechanism for transient failures
- Add fallback option to switch models if selected model is unavailable
- Handle OpenRouter-specific error codes (401 for auth, 429 for rate limiting, 500 for server errors)

**Prompt Formatting and History**
- Maintain existing prompt structure with "Help me with the following task:" and "Context:" sections
- Store conversation history in streaming panel with user messages and AI responses
- Preserve current prompt builder formatting logic in handleRunPrompt function
- Add support for follow-up questions in the streaming conversation

**Responsive Design Considerations**
- Ensure side panel adapts to mobile screens with full-width overlay instead of 40% split
- Adjust button sizes and spacing for touch interaction on mobile devices
- Test across different viewport sizes to maintain usability
- Implement proper touch gesture handling for mobile users

**Accessibility Compliance**
- Add proper ARIA labels for all interactive elements in streaming panel
- Implement keyboard navigation support (Tab, Enter, Escape keys)
- Ensure screen reader announcements for streaming status changes
- Provide high contrast mode compatibility for visual accessibility

**Performance Optimization**
- Implement efficient token accumulation to avoid excessive re-renders
- Use React.memo and useMemo for expensive computations in streaming display
- Debounce auto-scrolling to prevent janky animation during rapid streaming
- Clean up AbortController and event listeners on component unmount

## Existing Code to Leverage

**LibraryContext State Management**
- Current context manages promptBuilder state with customText and blockOrder
- Already has SET_EXECUTION_PANEL action that can be extended for streaming panel
- Use existing useLibraryState and useLibraryActions hooks for integration
- Leverage current reducer pattern for adding new streaming-related state

**Prompt Formatting Logic**
- Existing handleRunPrompt function in PromptBuilder.tsx creates properly formatted prompts
- Current format includes task description, context blocks, and proper line breaks
- Maintain mockContextBlocks integration for context information
- Preserve existing console logging for debugging purposes

**UI Component Patterns**
- Use existing dark theme styling with neutral-900/950 backgrounds and neutral-100 text
- Follow established button styling patterns with gradient backgrounds and hover effects
- Leverage existing Tailwind class combinations for consistent spacing and layout
- Use lucide-react icons already available in project (Play, ChevronDown, etc.)

**Model Selector Infrastructure**
- Existing dropdown component with custom styling and ChevronDown icon
- Current structure supports easy addition of new model options
- Maintain same visual design language for consistency
- Leverage existing focus states and hover effects

**OpenRouter Configuration**
- .env file already contains VITE_OPENROUTER_API_KEY for API authentication
- Use Vite's environment variable system with VITE_ prefix for security
- Configure OpenRouter as the default provider in AI SDK initialization
- API key is properly excluded from client-side build process

## Out of Scope
- File upload or attachment functionality for streaming conversations
- Voice input/output capabilities for the streaming interface
- Multi-user collaborative streaming features
- Advanced conversation branching or editing capabilities
- Integration with external plugins or tools during streaming
- Real-time collaboration features like shared streaming sessions
- Advanced analytics or usage tracking for streaming interactions
- Custom model fine-tuning or training integration
- Multi-language translation features within streaming panel
- Integration with other AI providers besides OpenRouter