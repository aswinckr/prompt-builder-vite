import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuthState, useAuthActions } from '../../contexts/AuthContext';
import { ProfileModal } from '../ProfileModal';
import { SearchBar } from '../SearchBar';

// Test wrapper component to access auth context
function TestComponent() {
  const { isAuthenticated } = useAuthState();
  const { signInWithEmail } = useAuthActions();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'not authenticated'}
      </div>
      <button
        onClick={() => signInWithEmail('test@example.com', 'password')}
        data-testid="sign-in-button"
      >
        Sign In
      </button>
    </div>
  );
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    // Clear any stored session before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('should detect authentication state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should show not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
  });

  test('should render add button correctly', () => {
    const mockOnAddKnowledge = vi.fn();

    render(
      <AuthProvider>
        <SearchBar
          onAddKnowledge={mockOnAddKnowledge}
          searchType="context"
        />
      </AuthProvider>
    );

    // The add button should be present when onAddKnowledge is provided
    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    expect(addButton).toBeInTheDocument();
  });

  test('should handle add button click', async () => {
    const mockOnAddKnowledge = vi.fn();
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <SearchBar
          onAddKnowledge={mockOnAddKnowledge}
          searchType="context"
        />
      </AuthProvider>
    );

    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);
    expect(mockOnAddKnowledge).toHaveBeenCalled();
  });

  test('should render ProfileModal without crashing', () => {
    render(
      <AuthProvider>
        <ProfileModal
          isOpen={true}
          onClose={() => {}}
        />
      </AuthProvider>
    );

    // ProfileModal should render without crashing
    expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument();
  });

  test('should handle ProfileModal with auth success callback', () => {
    const mockOnAuthSuccess = vi.fn();

    render(
      <AuthProvider>
        <ProfileModal
          isOpen={true}
          onClose={() => {}}
          onAuthSuccess={mockOnAuthSuccess}
        />
      </AuthProvider>
    );

    // ProfileModal should render without crashing
    expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument();
  });
});