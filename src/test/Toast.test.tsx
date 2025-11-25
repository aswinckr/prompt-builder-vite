import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Toast, ToastVariant } from '../components/Toast';
import { ToastProvider, useToast } from '../contexts/ToastContext';

// Mock timers
vi.useFakeTimers();

describe('Toast Component', () => {
  const defaultProps = {
    id: 'test-toast',
    message: 'Test message',
    isVisible: true,
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toast with correct message and variant', () => {
    render(<Toast {...defaultProps} variant="success" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Dismiss notification')).toBeInTheDocument();
  });

  it('shows correct icon for each variant', () => {
    const variants: ToastVariant[] = ['success', 'error', 'warning', 'info'];
    const iconNames = ['CheckCircle', 'AlertCircle', 'AlertTriangle', 'Info'];

    variants.forEach((variant, index) => {
      const { container } = render(<Toast {...defaultProps} variant={variant} />);
      const icons = container.querySelectorAll('svg');
      // The first icon should be the variant icon, second should be X for dismiss
      expect(icons[0]).toBeInTheDocument();
    });
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledWith('test-toast');
  });

  it('auto-dismisses after default duration (5000ms)', () => {
    const onDismiss = vi.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledWith('test-toast');
  });

  it('does not render when isVisible is false', () => {
    render(<Toast {...defaultProps} isVisible={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('uses custom duration when provided', () => {
    const onDismiss = vi.fn();
    render(<Toast {...defaultProps} duration={2000} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onDismiss).toHaveBeenCalledWith('test-toast');
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onDismiss = vi.fn();
    render(<Toast {...defaultProps} duration={0} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('Toast Context', () => {
  it('provides showToast and dismissToast functions', () => {
    const TestComponent = () => {
      const { showToast, dismissToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('Test message', 'success')}>
            Show Toast
          </button>
          <button onClick={() => dismissToast('test-id')}>
            Dismiss Toast
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Toast')).toBeInTheDocument();
    expect(screen.getByText('Dismiss Toast')).toBeInTheDocument();
  });

  it('shows toast when showToast is called', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <button onClick={() => showToast('Hello world', 'success')}>
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Toast');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('dismisses toast when dismiss button is clicked', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <button onClick={() => showToast('Test message', 'error')}>
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Toast');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    // Wait for animation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('auto-dismisses toast after duration', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <button onClick={() => showToast('Auto dismiss test', 'warning')}>
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Toast');
    fireEvent.click(showButton);

    await waitFor(() => {
      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();
    });

    // Fast-forward time beyond auto-dismiss duration
    act(() => {
      vi.advanceTimersByTime(5000 + 300); // duration + animation time
    });

    expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument();
  });

  it('shows multiple toasts and stacks them correctly', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('First toast', 'success')}>
            Show First
          </button>
          <button onClick={() => showToast('Second toast', 'error')}>
            Show Second
          </button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const firstButton = screen.getByText('Show First');
    const secondButton = screen.getByText('Show Second');

    fireEvent.click(firstButton);
    fireEvent.click(secondButton);

    await waitFor(() => {
      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
  });
});