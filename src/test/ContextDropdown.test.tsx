import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextDropdown } from '../components/ContextDropdown';
import { useLibraryActions } from '../contexts/LibraryContext';

// Mock the useLibraryActions hook
vi.mock('../contexts/LibraryContext', () => ({
  useLibraryActions: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('ContextDropdown Component', () => {
  const mockCreateTemporaryBlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLibraryActions as any).mockReturnValue({
      createTemporaryBlock: mockCreateTemporaryBlock,
    });
  });

  // Test 2.1: Test dropdown opens on button click
  it('should open dropdown when button is clicked', async () => {
    render(<ContextDropdown />);

    const button = screen.getByRole('button', { name: /add context/i });
    expect(button).toBeInTheDocument();

    // Initially dropdown should be closed
    expect(screen.queryByText('Add Text Block')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Knowledge')).not.toBeInTheDocument();

    // Click button to open dropdown
    fireEvent.click(button);

    // Check that dropdown items appear
    await waitFor(() => {
      expect(screen.getByText('Add Text Block')).toBeInTheDocument();
      expect(screen.getByText('Add Knowledge')).toBeInTheDocument();
    });
  });

  // Test 2.1: Test "Add Text Block" option triggers correct action
  it('should call createTemporaryBlock when "Add Text Block" is clicked', async () => {
    render(<ContextDropdown />);

    const button = screen.getByRole('button', { name: /add context/i });
    fireEvent.click(button);

    const addTextBlockItem = screen.getByText('Add Text Block');
    fireEvent.click(addTextBlockItem);

    expect(mockCreateTemporaryBlock).toHaveBeenCalledWith({
      title: 'Text Block',
      content: '',
      tags: [],
      project_id: null
    });
  });

  // Test 2.1: Test "Add Knowledge" option navigates correctly
  it('should navigate to knowledge when "Add Knowledge" is clicked', async () => {
    render(<ContextDropdown />);

    const button = screen.getByRole('button', { name: /add context/i });
    fireEvent.click(button);

    const addKnowledgeItem = screen.getByText('Add Knowledge');
    fireEvent.click(addKnowledgeItem);

    expect(mockNavigate).toHaveBeenCalledWith('/knowledge');
  });

  // Test 2.1: Test dropdown closes on outside click
  it('should close dropdown when clicking outside', async () => {
    render(<ContextDropdown />);

    const button = screen.getByRole('button', { name: /add context/i });
    fireEvent.click(button);

    // Check dropdown is open
    await waitFor(() => {
      expect(screen.getByText('Add Text Block')).toBeInTheDocument();
    });

    // Click outside the dropdown
    fireEvent.mouseDown(document.body);

    // Check dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText('Add Text Block')).not.toBeInTheDocument();
    });
  });
});