import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; session: Session } }
  | { type: 'AUTH_SIGNOUT' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_SIGNOUT':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const session = await auth.getCurrentSession();
        const user = await auth.getCurrentUser();

        if (session && user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, session },
          });
        } else {
          dispatch({ type: 'AUTH_LOADING', payload: false });
        }
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load session',
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: session.user, session },
          });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'AUTH_SIGNOUT' });
        } else {
          dispatch({ type: 'AUTH_LOADING', payload: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context.state;
}

export function useAuthActions() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }

  const { dispatch } = context;

  return {
    signInWithGoogle: async () => {
      try {
        dispatch({ type: 'AUTH_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        await auth.signInWithGoogle();
        // Auth state will be handled by the onAuthStateChange listener
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to sign in with Google',
        });
      }
    },

    signOut: async () => {
      try {
        await auth.signOut();
        // Auth state will be handled by the onAuthStateChange listener
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to sign out',
        });
      }
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };
}

// Export types for use in components
export type { AuthState };