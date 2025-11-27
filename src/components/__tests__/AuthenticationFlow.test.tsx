import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuthState, useAuthActions } from '../../contexts/AuthContext';
import { ProfileModal } from '../ProfileModal';
import { GlobalSearch } from '../GlobalSearch';

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

  test('should render GlobalSearch correctly', () => {
    render(
      <AuthProvider>
        <GlobalSearch />
      </AuthProvider>
    );

    // GlobalSearch should render with "Search everywhere" placeholder
    expect(screen.getByPlaceholderText(/Search everywhere/i)).toBeInTheDocument();
  });

  test('should handle GlobalSearch input', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <GlobalSearch />
      </AuthProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search everywhere/i);
    await user.type(searchInput, 'test query');

    // Input should accept text
    expect(searchInput).toHaveValue('test query');
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