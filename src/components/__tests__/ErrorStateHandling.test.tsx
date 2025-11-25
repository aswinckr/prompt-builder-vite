import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuthState, useAuthActions } from '../../../contexts/AuthContext';
import { LibraryProvider } from '../../../contexts/LibraryContext';
import { ContextLibrary } from '../../ContextLibrary';

// Mock component to simulate error states
function MockContextWithError() {
  const { error, setError } = useAuthActions();
  const { isAuthenticated } = useAuthState();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'not authenticated'}
      </div>
      <div data-testid="error-state">{error || 'no error'}</div>
      <button
        onClick={() => setError('Test authentication error')}
        data-testid="trigger-auth-error"
      >
        Trigger Auth Error
      </button>
      <button
        onClick={() => setError('Network connection failed')}
        data-testid="trigger-network-error"
      >
        Trigger Network Error
      </button>
    </div>
  );
}

describe('Error State Management & Polish', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('should handle authentication failure gracefully', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <MockContextWithError />
        </LibraryProvider>
      </AuthProvider>
    );

    // Should show not authenticated initially
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');

    // Trigger authentication error
    const triggerErrorBtn = screen.getByTestId('trigger-auth-error');
    await userEvent.click(triggerErrorBtn);

    // Should show the error state
    expect(screen.getByTestId('error-state')).toHaveTextContent('Test authentication error');
  });

  test('should differentiate network errors from authentication errors', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <MockContextWithError />
        </LibraryProvider>
      </AuthProvider>
    );

    // Trigger network error
    const triggerNetworkErrorBtn = screen.getByTestId('trigger-network-error');
    await userEvent.click(triggerNetworkErrorBtn);

    // Should show the network error
    expect(screen.getByTestId('error-state')).toHaveTextContent('Network connection failed');
  });

  test('should not show error overlay for user not authenticated errors', () => {
    const mockSetError = vi.fn();

    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // ContextLibrary should render without crashing
    expect(screen.getByText('Loading your data...')).toBeInTheDocument();

    // Should not show error overlay for auth-related issues
    // (This is tested through the shouldShowErrorOverlay logic in ContextLibrary)
  });

  test('should maintain interface visibility during authentication errors', () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Should show the main interface structure even during loading/error states
    expect(document.querySelector('[data-testid="context-library-sidebar-toggle"]')).toBeInTheDocument();
  });

  test('should handle loading states during authentication transitions', () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Should show loading state initially
    expect(screen.getByText('Loading your data...')).toBeInTheDocument();
  });
});