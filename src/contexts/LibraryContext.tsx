import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ContextBlock } from '../types/ContextBlock';

interface PromptBuilderState {
  customText: string;
  blockOrder: number[];
}

interface LibraryState {
  promptBuilder: PromptBuilderState;
}

type LibraryAction =
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'ADD_BLOCK_TO_BUILDER'; payload: number }
  | { type: 'REMOVE_BLOCK_FROM_BUILDER'; payload: number }
  | { type: 'REORDER_BLOCKS_IN_BUILDER'; payload: number[] }
  | { type: 'CLEAR_PROMPT_BUILDER' }
  | { type: 'SET_EXECUTION_PANEL'; payload: boolean };

const initialState: LibraryState = {
  promptBuilder: {
    customText: '',
    blockOrder: []
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
      return state; // Implementation simplified for this version
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