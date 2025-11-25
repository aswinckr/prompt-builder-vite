import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmationModal, ConfirmationType } from '../components/ConfirmationModal';

describe('ConfirmationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Confirmation',
    message: 'Are you sure you want to perform this action?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with correct title and message', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to perform this action?')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders custom button text when provided', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Delete Item"
        cancelText="Keep Item"
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Keep Item')).toBeInTheDocument();
  });

  it('shows correct icon for delete type', () => {
    render(<ConfirmationModal {...defaultProps} type="delete" />);

    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Item') || screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows correct icon for warning type', () => {
    render(<ConfirmationModal {...defaultProps} type="warning" />);

    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Enter key is pressed', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not respond to keyboard when loading', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmationModal
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
        isLoading={true}
      />
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables buttons and shows loading state when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(confirmButton.querySelector('div')).toHaveClass('animate-spin');
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();
  });

  it('focuses confirm button when modal opens', () => {
    render(<ConfirmationModal {...defaultProps} />);

    act(() => {
      // Need to wait for the setTimeout to execute
      vi.advanceTimersByTime(100);
    });

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveFocus();
  });

  it('displays keyboard shortcut help text', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText(/Press.*Enter.*to confirm/)).toBeInTheDocument();
    expect(screen.getByText(/Esc.*to cancel/)).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('prevents overlay interaction when loading', () => {
    const onClose = vi.fn();
    render(
      <ConfirmationModal
        {...defaultProps}
        onClose={onClose}
        isLoading={true}
      />
    );

    // Try to click outside the modal content
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Should not call onClose when loading
    expect(onClose).not.toHaveBeenCalled();
  });

  it('allows overlay interaction when not loading', () => {
    const onClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

    // Try to click outside the modal content
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Should call onClose when not loading (due to Modal's closeOnOverlayClick)
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});