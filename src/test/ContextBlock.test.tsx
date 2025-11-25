import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContextBlock } from '../components/ContextBlock';
import { ContextBlock as ContextBlockType } from '../types/ContextBlock';

const mockBlock: ContextBlockType = {
  id: '1',
  title: 'Test Context Block',
  content: 'This is a test context block with some content',
  tags: ['test', 'context'],
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-02'),
  user_id: 'user1',
  project_id: 'project1',
};

describe('ContextBlock Component', () => {
  const defaultProps = {
    block: mockBlock,
    isSelected: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders context block with correct content', () => {
    render(<ContextBlock {...defaultProps} />);

    expect(screen.getByText('Test Context Block')).toBeInTheDocument();
    expect(screen.getByText('This is a test context block with some content')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('context')).toBeInTheDocument();
  });

  it('shows delete button when onDelete prop is provided', () => {
    render(<ContextBlock {...defaultProps} onDelete={vi.fn()} />);

    const deleteButton = screen.getByLabelText('Delete Test Context Block');
    expect(deleteButton).toBeInTheDocument();
  });

  it('does not show delete button when onDelete prop is not provided', () => {
    render(<ContextBlock {...defaultProps} />);

    expect(screen.queryByLabelText('Delete Test Context Block')).not.toBeInTheDocument();
  });

  it('shows edit button when onEdit prop is provided', () => {
    render(<ContextBlock {...defaultProps} onEdit={vi.fn()} />);

    const editButton = screen.getByLabelText('Edit Test Context Block');
    expect(editButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<ContextBlock {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('Delete Test Context Block');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockBlock);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ContextBlock {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByLabelText('Edit Test Context Block');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockBlock);
  });

  it('calls onSelect when block is clicked', () => {
    const onSelect = vi.fn();
    render(<ContextBlock {...defaultProps} onSelect={onSelect} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.click(blockElement);
    }

    expect(onSelect).toHaveBeenCalled();
  });

  it('shows selection indicator when isSelected is true', () => {
    render(<ContextBlock {...defaultProps} isSelected={true} />);

    const selectionIndicator = screen.getByText('✓');
    expect(selectionIndicator).toBeInTheDocument();
    expect(selectionIndicator.parentElement).toHaveClass('bg-blue-500');
  });

  it('applies selected styling when isSelected is true', () => {
    const { container } = render(<ContextBlock {...defaultProps} isSelected={true} />);

    const blockElement = container.querySelector('[data-block-id]');
    expect(blockElement).toHaveClass('bg-blue-500/10', 'border-blue-500/30');
  });

  it('calls onDelete when D key is pressed', () => {
    const onDelete = vi.fn();
    render(<ContextBlock {...defaultProps} onDelete={onDelete} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.keyDown(blockElement, { key: 'd' });
    }

    expect(onDelete).toHaveBeenCalledWith(mockBlock);
  });

  it('calls onDelete when D key is pressed (uppercase)', () => {
    const onDelete = vi.fn();
    render(<ContextBlock {...defaultProps} onDelete={onDelete} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.keyDown(blockElement, { key: 'D' });
    }

    expect(onDelete).toHaveBeenCalledWith(mockBlock);
  });

  it('calls onEdit when E key is pressed', () => {
    const onEdit = vi.fn();
    render(<ContextBlock {...defaultProps} onEdit={onEdit} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.keyDown(blockElement, { key: 'e' });
    }

    expect(onEdit).toHaveBeenCalledWith(mockBlock);
  });

  it('calls onSelect when Enter key is pressed', () => {
    const onSelect = vi.fn();
    render(<ContextBlock {...defaultProps} onSelect={onSelect} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.keyDown(blockElement, { key: 'Enter' });
    }

    expect(onSelect).toHaveBeenCalled();
  });

  it('calls onSelect when Space key is pressed', () => {
    const onSelect = vi.fn();
    render(<ContextBlock {...defaultProps} onSelect={onSelect} />);

    const blockElement = screen.getByText('Test Context Block').closest('[data-block-id]');
    if (blockElement) {
      fireEvent.keyDown(blockElement, { key: ' ' });
    }

    expect(onSelect).toHaveBeenCalled();
  });

  it('displays help text on hover', () => {
    render(<ContextBlock {...defaultProps} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const helpText = screen.getByText(/Press.*E.*to edit.*D.*to delete/);
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveClass('opacity-0');
  });

  it('limits displayed tags to 3 and shows count for remaining', () => {
    const blockWithManyTags: ContextBlockType = {
      ...mockBlock,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    render(<ContextBlock {...defaultProps} block={blockWithManyTags} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument(); // 5 total - 3 shown = 2 remaining
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
    expect(screen.queryByText('tag5')).not.toBeInTheDocument();
  });

  it('truncates long titles properly', () => {
    const blockWithLongTitle: ContextBlockType = {
      ...mockBlock,
      title: 'This is a very long title that should be truncated with proper line-clamp styling',
    };

    render(<ContextBlock {...defaultProps} block={blockWithLongTitle} />);

    const titleElement = screen.getByText(blockWithLongTitle.title);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  it('truncates long content properly', () => {
    const blockWithLongContent: ContextBlockType = {
      ...mockBlock,
      content: 'This is a very long content that should be truncated with proper line-clamp styling to ensure the content does not overflow and maintains a consistent card height across all context blocks in the grid layout.',
    };

    render(<ContextBlock {...defaultProps} block={blockWithLongContent} />);

    const contentElement = screen.getByText(blockWithLongContent.content);
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveClass('line-clamp-3');
  });

  it('has correct ARIA attributes', () => {
    render(<ContextBlock {...defaultProps} />);

    const blockElement = screen.getByRole('gridcell');
    expect(blockElement).toHaveAttribute('aria-selected', 'false');
    expect(blockElement).toHaveAttribute('tabIndex', '0');
    expect(blockElement).toHaveAttribute('aria-label', 'Context block: Test Context Block');
  });

  it('has correct ARIA attributes when selected', () => {
    render(<ContextBlock {...defaultProps} isSelected={true} />);

    const blockElement = screen.getByRole('gridcell');
    expect(blockElement).toHaveAttribute('aria-selected', 'true');
  });
});