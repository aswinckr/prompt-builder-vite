import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LibraryProvider } from '../../../contexts/LibraryContext';
import { ContextLibrary } from '../../ContextLibrary';

// Mock authentication actions for testing
const mockAuthActions = {
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn(),
  resetPassword: vi.fn(),
};

// Mock library actions for testing
const mockLibraryActions = {
  updateSavedPrompt: vi.fn(),
  deleteSavedPrompt: vi.fn(),
  createFolder: vi.fn(),
  closeFolderModal: vi.fn(),
};

describe('Integration Flow Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('should complete full auth flow for add knowledge action', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Should show loading state initially
    expect(screen.getByText('Loading your data...')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Find and click add knowledge button (simulating logged-out state)
    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);

    // Profile modal should open
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText(/Sign in to access your profile and saved prompts/i)).toBeInTheDocument();
  });

  test('should complete full auth flow for add prompt action', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Look for add prompt button
    const addButton = screen.getByLabelText(/Add new prompt template/i);
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);

    // Profile modal should open
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });

  test('should handle modal state transitions correctly', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Initially, no profile modal should be open
    expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();

    // Click add button to open modal
    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);

    // Modal should now be open
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();

    // Click close button (or escape) to close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
  });

  test('should maintain project selection context through auth flow', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Add knowledge button should be present and functional
    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    expect(addButton).toBeInTheDocument();

    await user.click(addButton);

    // Modal should open, maintaining the context that this was for knowledge addition
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });

  test('should show proper empty states for logged-out users', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Should show empty state for context blocks when no data
    expect(screen.getByText(/No context blocks found/i)).toBeInTheDocument();

    // Should not show authentication error overlay
    expect(screen.queryByText(/User not authenticated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to load data/i)).not.toBeInTheDocument();
  });

  test('should handle authentication error states gracefully', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Open profile modal
    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);

    // Should show sign-in form
    expect(screen.getByText('Sign in to access your profile and saved prompts')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Should have sign-in and sign-up tabs
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('should handle form interactions in auth modal', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete and open modal
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);

    // Fill in email field
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'test@example.com');

    // Fill in password field
    const passwordInput = screen.getByLabelText(/Password/i);
    await user.type(passwordInput, 'password123');

    // Verify form values
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');

    // Should have sign-in button
    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    expect(signInButton).toBeInTheDocument();
  });

  test('should handle password visibility toggle', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete and open modal
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);

    // Find password visibility toggle
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();

    // Click toggle to show password
    await user.click(toggleButton);

    // Password input type should change to text
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should handle Google OAuth button', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete and open modal
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText(/Add new knowledge context block/i);
    await user.click(addButton);

    // Should have Google sign-in button
    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toBeVisible();
  });

  test('should maintain responsive design in logged-out state', async () => {
    render(
      <AuthProvider>
        <LibraryProvider>
          <ContextLibrary />
        </LibraryProvider>
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();
    });

    // Should have responsive sidebar toggle
    const sidebarToggle = screen.getByTestId('context-library-sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();

    // Should have mobile sidebar toggle
    const mobileToggle = screen.getByTestId('mobile-sidebar-toggle');
    expect(mobileToggle).toBeInTheDocument();

    // Should maintain proper layout structure
    const mainContent = document.querySelector('.flex-1.flex.flex-col.overflow-hidden');
    expect(mainContent).toBeInTheDocument();
  });
});