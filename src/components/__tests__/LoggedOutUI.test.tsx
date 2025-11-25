import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LibraryProvider } from '../../../contexts/LibraryContext';
import { ContextBlocksGrid } from '../../ContextBlocksGrid';
import { SavedPromptList } from '../../SavedPromptList';

// Test wrapper that provides both contexts
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LibraryProvider>
        {children}
      </LibraryProvider>
    </AuthProvider>
  );
}

describe('Logged-out UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('should display empty state in ContextBlocksGrid when no blocks exist', () => {
    render(
      <TestWrapper>
        <ContextBlocksGrid selectedProject="test-project-id" />
      </TestWrapper>
    );

    // Should show empty state message instead of error
    expect(screen.getByText(/No context blocks found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
  });

  test('should display empty state in SavedPromptList when no prompts exist', () => {
    render(
      <TestWrapper>
        <SavedPromptList
          selectedProject="test-project-id"
          prompts={[]}
        />
      </TestWrapper>
    );

    // Should show empty state message instead of error
    expect(screen.getByText(/No saved prompts found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
  });

  test('should maintain responsive grid layout in logged-out state', () => {
    const { container } = render(
      <TestWrapper>
        <ContextBlocksGrid selectedProject="test-project-id" />
      </TestWrapper>
    );

    // Should render the grid structure
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();

    // Should have responsive grid classes
    expect(gridElement).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  test('should show search interface in logged-out state', () => {
    render(
      <TestWrapper>
        <SavedPromptList
          selectedProject="test-project-id"
          prompts={[]}
        />
      </TestWrapper>
    );

    // Should show search functionality
    expect(screen.getByPlaceholderText(/Search prompts/i)).toBeInTheDocument();

    // Should show filter controls
    expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort by:/i)).toBeInTheDocument();
  });

  test('should maintain proper styling and accessibility in logged-out state', () => {
    render(
      <TestWrapper>
        <ContextBlocksGrid selectedProject="test-project-id" />
      </TestWrapper>
    );

    // Should have proper ARIA attributes
    const gridElement = screen.getByRole('grid');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveAttribute('aria-label', 'Context blocks grid');
  });
});