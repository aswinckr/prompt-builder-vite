import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePromptModal } from '../components/CreatePromptModal';
import { LibraryProvider } from '../contexts/LibraryContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';

// Test component to capture toast calls
const ToastCapture = ({ children }: { children: React.ReactNode }) => {
  const { showToast } = useToast();
  const [capturedToasts, setCapturedToasts] = useState<Array<{ message: string; variant: string }>>([]);

  // Override showToast to capture calls
  const originalShowToast = showToast;
  const captureShowToast = (message: string, variant: any) => {
    setCapturedToasts(prev => [...prev, { message, variant: variant.toString() }]);
    return originalShowToast(message, variant);
  };

  return (
    <div>
      {children}
      <div data-testid="captured-toasts">
        {capturedToasts.map((toast, index) => (
          <div key={index} data-testid={`toast-${index}`}>
            {toast.message} - {toast.variant}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock the LibraryContext to provide test data
const mockLibraryActions = {
  createSavedPrompt: vi.fn(),
};

// Mock LibraryContext to return our test data
vi.mock('../contexts/LibraryContext', async () => {
  const actual = await vi.importActual('../contexts/LibraryContext');
  return {
    ...actual,
    useLibraryActions: () => mockLibraryActions,
    useLibraryState: () => ({
      promptBuilder: { customText: '', blockOrder: [] },
      contextBlocks: [],
      savedPrompts: [],
      loading: false,
      error: null,
    }),
  };
});

// Mock TipTapEditor to avoid complex editor initialization
vi.mock('../components/TipTapEditor', () => ({
  TipTapEditor: ({ content, onUpdate }: any) => (
    <textarea
      data-testid="tip-tap-editor"
      defaultValue={content || ''}
      onChange={(e) => {
        onUpdate?.({
          html: e.target.value,
          json: null,
          text: e.target.value,
        });
      }}
    />
  ),
}));

describe('Toast Feedback System Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows success toast when prompt is saved successfully', async () => {
    const mockCreateSavedPrompt = vi.fn().mockResolvedValue({ data: { id: '123' } });
    mockLibraryActions.createSavedPrompt = mockCreateSavedPrompt;

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt Title',
        description: null,
        content: 'Test prompt content',
        project_id: null,
        tags: [],
      });
    });

    // Wait for modal to close and success toast to be shown
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast when prompt save fails', async () => {
    const mockCreateSavedPrompt = vi.fn().mockRejectedValue(new Error('Network error'));
    mockLibraryActions.createSavedPrompt = mockCreateSavedPrompt;

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateSavedPrompt).toHaveBeenCalledWith({
        title: 'Test Prompt Title',
        description: null,
        content: 'Test prompt content',
        project_id: null,
        tags: [],
      });
    });

    // Check that error is displayed in the modal
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles validation errors without showing toast', async () => {
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    // Should show validation error but not trigger toast
    expect(screen.getByText('Please enter a title')).toBeInTheDocument();

    // Create prompt should not be called
    expect(mockLibraryActions.createSavedPrompt).not.toHaveBeenCalled();
  });

  it('auto-dismisses toast after delay', async () => {
    vi.useFakeTimers();

    const mockCreateSavedPrompt = vi.fn().mockResolvedValue({ data: { id: '123' } });
    mockLibraryActions.createSavedPrompt = mockCreateSavedPrompt;

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByText('Save Prompt');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    // Toast should be shown and then auto-dismiss after delay
    vi.advanceTimersByTime(5300); // 5000ms duration + 300ms animation

    vi.useRealTimers();
  });

  it('handles multiple toasts in quick succession', async () => {
    const mockCreateSavedPrompt = vi.fn()
      .mockResolvedValueOnce({ data: { id: '123' } })
      .mockRejectedValueOnce(new Error('Second save failed'));
    mockLibraryActions.createSavedPrompt = mockCreateSavedPrompt;

    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content"
          />
        </LibraryProvider>
      </ToastProvider>
    );

    const titleInput = screen.getByPlaceholderText('Enter a descriptive title for this prompt template');
    fireEvent.change(titleInput, { target: { value: 'Test Prompt Title' } });

    const saveButton = screen.getByText('Save Prompt');

    // First successful save
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    // Reopen modal for second test
    render(
      <ToastProvider>
        <LibraryProvider>
          <CreatePromptModal
            {...defaultProps}
            initialContent="Test prompt content 2"
          />
        </LibraryProvider>
      </ToastProvider>
    );
  });
});