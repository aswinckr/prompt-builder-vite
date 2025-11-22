import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ContextBlock } from '../types/ContextBlock';

interface StreamingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StreamingState {
  isStreamingPanelOpen: boolean;
  selectedModel: string;
  streamingContent: string;
  streamingStatus: 'idle' | 'connecting' | 'streaming' | 'error' | 'stopped';
  conversationHistory: StreamingMessage[];
  errorMessage?: string;
  currentAbortController?: AbortController;
}

interface PromptBuilderState {
  customText: string;
  blockOrder: number[];
}

interface LibraryState {
  promptBuilder: PromptBuilderState;
  streaming: StreamingState;
}

type LibraryAction =
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'ADD_BLOCK_TO_BUILDER'; payload: number }
  | { type: 'REMOVE_BLOCK_FROM_BUILDER'; payload: number }
  | { type: 'REORDER_BLOCKS_IN_BUILDER'; payload: number[] }
  | { type: 'CLEAR_PROMPT_BUILDER' }
  | { type: 'SET_EXECUTION_PANEL'; payload: boolean }
  // Streaming actions
  | { type: 'SET_STREAMING_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'UPDATE_STREAMING_CONTENT'; payload: string }
  | { type: 'SET_STREAMING_STATUS'; payload: StreamingState['streamingStatus'] }
  | { type: 'ADD_CONVERSATION_MESSAGE'; payload: StreamingMessage }
  | { type: 'CLEAR_CONVERSATION_HISTORY' }
  | { type: 'SET_STREAMING_ERROR'; payload: string }
  | { type: 'SET_ABORT_CONTROLLER'; payload: AbortController | undefined }
  | { type: 'STOP_STREAMING' };

const initialState: LibraryState = {
  promptBuilder: {
    customText: '',
    blockOrder: []
  },
  streaming: {
    isStreamingPanelOpen: false,
    selectedModel: 'gemini-3-pro',
    streamingContent: '',
    streamingStatus: 'idle',
    conversationHistory: []
  }
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_CUSTOM_TEXT':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          customText: action.payload
        }
      };
    case 'ADD_BLOCK_TO_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: [...state.promptBuilder.blockOrder, action.payload]
        }
      };
    case 'REMOVE_BLOCK_FROM_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: state.promptBuilder.blockOrder.filter(id => id !== action.payload)
        }
      };
    case 'REORDER_BLOCKS_IN_BUILDER':
      return {
        ...state,
        promptBuilder: {
          ...state.promptBuilder,
          blockOrder: action.payload
        }
      };
    case 'CLEAR_PROMPT_BUILDER':
      return {
        ...state,
        promptBuilder: {
          customText: '',
          blockOrder: []
        }
      };
    case 'SET_EXECUTION_PANEL':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          isStreamingPanelOpen: action.payload
        }
      };
    case 'SET_STREAMING_PANEL_OPEN':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          isStreamingPanelOpen: action.payload
        }
      };
    case 'SET_SELECTED_MODEL':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          selectedModel: action.payload
        }
      };
    case 'UPDATE_STREAMING_CONTENT':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          streamingContent: action.payload
        }
      };
    case 'SET_STREAMING_STATUS':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          streamingStatus: action.payload,
          errorMessage: action.payload === 'error' ? state.streaming.errorMessage : undefined
        }
      };
    case 'ADD_CONVERSATION_MESSAGE':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          conversationHistory: [...state.streaming.conversationHistory, action.payload]
        }
      };
    case 'CLEAR_CONVERSATION_HISTORY':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          conversationHistory: [],
          streamingContent: ''
        }
      };
    case 'SET_STREAMING_ERROR':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          streamingStatus: 'error',
          errorMessage: action.payload
        }
      };
    case 'SET_ABORT_CONTROLLER':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          currentAbortController: action.payload
        }
      };
    case 'STOP_STREAMING':
      const abortController = state.streaming.currentAbortController;
      if (abortController) {
        abortController.abort();
      }
      return {
        ...state,
        streaming: {
          ...state.streaming,
          streamingStatus: 'stopped',
          currentAbortController: undefined
        }
      };
    default:
      return state;
  }
}

const LibraryContext = createContext<{
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
} | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibraryState() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryState must be used within a LibraryProvider');
  }
  return context.state;
}

export function useLibraryActions() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryActions must be used within a LibraryProvider');
  }

  const { dispatch } = context;

  return {
    setCustomText: (text: string) => dispatch({ type: 'SET_CUSTOM_TEXT', payload: text }),
    addBlockToBuilder: (blockId: number) => dispatch({ type: 'ADD_BLOCK_TO_BUILDER', payload: blockId }),
    removeBlockFromBuilder: (blockId: number) => dispatch({ type: 'REMOVE_BLOCK_FROM_BUILDER', payload: blockId }),
    reorderBlocksInBuilder: (order: number[]) => dispatch({ type: 'REORDER_BLOCKS_IN_BUILDER', payload: order }),
    clearPromptBuilder: () => dispatch({ type: 'CLEAR_PROMPT_BUILDER' }),
    setExecutionPanel: (open: boolean) => dispatch({ type: 'SET_EXECUTION_PANEL', payload: open }),

    // Streaming actions
    setStreamingPanelOpen: (open: boolean) => dispatch({ type: 'SET_STREAMING_PANEL_OPEN', payload: open }),
    setSelectedModel: (model: string) => dispatch({ type: 'SET_SELECTED_MODEL', payload: model }),
    updateStreamingContent: (content: string) => dispatch({ type: 'UPDATE_STREAMING_CONTENT', payload: content }),
    setStreamingStatus: (status: StreamingState['streamingStatus']) => dispatch({ type: 'SET_STREAMING_STATUS', payload: status }),
    addConversationMessage: (message: StreamingMessage) => dispatch({ type: 'ADD_CONVERSATION_MESSAGE', payload: message }),
    clearConversationHistory: () => dispatch({ type: 'CLEAR_CONVERSATION_HISTORY' }),
    setStreamingError: (error: string) => dispatch({ type: 'SET_STREAMING_ERROR', payload: error }),
    setAbortController: (controller?: AbortController) => dispatch({ type: 'SET_ABORT_CONTROLLER', payload: controller }),
    stopStreaming: () => dispatch({ type: 'STOP_STREAMING' }),

    // Legacy actions
    savePromptAsTemplate: (name: string) => {
      // Simplified implementation
      return Date.now().toString();
    },
    createFolder: (name: string) => {
      // Simplified implementation
      return Date.now().toString();
    },
    movePromptToFolder: (promptId: string, folderId: string) => {
      // Simplified implementation
    }
  };
}

// Export types for use in components
export type { StreamingMessage, StreamingState };