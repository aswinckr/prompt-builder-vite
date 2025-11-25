import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Toast, ToastVariant } from '../components/Toast';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  isVisible: boolean;
}

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction =
  | { type: 'SHOW_TOAST'; payload: Omit<ToastItem, 'isVisible'> }
  | { type: 'DISMISS_TOAST'; payload: string }
  | { type: 'REMOVE_TOAST'; payload: string };

const initialState: ToastState = {
  toasts: [],
};

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'SHOW_TOAST': {
      const existingToast = state.toasts.find(t => t.message === action.payload.message && t.variant === action.payload.variant);
      if (existingToast) {
        return state;
      }

      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.payload, isVisible: true },
        ],
      };
    }
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === action.payload
            ? { ...toast, isVisible: false }
            : toast
        ),
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    default:
      return state;
  }
}

const ToastContext = createContext<{
  showToast: (message: string, variant?: ToastVariant) => string;
  dismissToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const showToast = (message: string, variant: ToastVariant = 'info'): string => {
    const id = crypto.randomUUID();
    dispatch({
      type: 'SHOW_TOAST',
      payload: { id, message, variant },
    });

    // Auto-remove after animation completes
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 5000 + 300); // duration + animation time

    return id;
  };

  const dismissToast = (id: string) => {
    dispatch({ type: 'DISMISS_TOAST', payload: id });
    // Remove from DOM after animation completes
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 300);
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast Container */}
      <div
        className={`
          fixed top-4 right-4 z-[9999]
          flex flex-col-reverse items-end
          gap-2 pointer-events-none
          max-h-[80vh] overflow-hidden
          sm:max-h-[100vh] sm:overflow-visible
        `}
        aria-live="polite"
        aria-label="Notifications"
      >
        {state.toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto transform animate-in slide-in-from-right-full duration-300 ease-out"
          >
            <Toast
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              isVisible={toast.isVisible}
              onDismiss={dismissToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}