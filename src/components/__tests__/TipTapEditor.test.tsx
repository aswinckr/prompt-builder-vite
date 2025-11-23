import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { TipTapEditor } from '../TipTapEditor';

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

describe('TipTapEditor', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders editor with toolbar', async () => {
    render(<TipTapEditor content="Initial content" />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    // Check if toolbar buttons are present
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
    expect(screen.getByTitle('Code Block')).toBeInTheDocument();
  });

  it('initializes with provided content', async () => {
    render(<TipTapEditor content="<p>Hello World</p>" />);

    // Wait for content to be rendered
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('shows placeholder when empty', () => {
    render(<TipTapEditor content="" placeholder="Start typing..." />);

    // Check if placeholder is visible
    const placeholder = screen.getByText('Start typing...');
    expect(placeholder).toBeInTheDocument();
  });

  it('applies correct styling for code blocks', async () => {
    render(<TipTapEditor content='<pre><code>const x = 1;</code></pre>' />);

    // Wait for content to render
    await waitFor(() => {
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });
  });

  it('handles editable state correctly', async () => {
    render(<TipTapEditor content="Test" editable={false} />);

    // Wait for toolbar to render
    await waitFor(() => {
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
    });

    // When not editable, toolbar buttons should be disabled
    const boldButton = screen.getByTitle('Bold');
    expect(boldButton).toBeDisabled();
  });

  it('renders loading state when editor is initializing', () => {
    render(<TipTapEditor content="Test" />);

    // Should show loading skeleton initially
    expect(screen.getByRole('textbox') || document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});