import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RenameFolderModal } from '../components/RenameFolderModal';

// Mock the Project interface
const mockProject = {
  id: '1',
  user_id: 'user1',
  name: 'Test Folder',
  icon: '📁',
  is_system: false,
  created_at: new Date(),
  updated_at: new Date()
};

describe('RenameFolderModal', () => {
  const mockOnClose = jest.fn();
  const mockOnRename = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pre-populate folder name in input field when opened', () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const nameInput = screen.getByLabelText(/folder name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue('Test Folder');
  });

  it('should show character count and limit (50)', () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    expect(screen.getByText('11/50')).toBeInTheDocument();
  });

  it('should validate required field and show error when empty', async () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const nameInput = screen.getByLabelText(/folder name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /rename folder/i }));

    await waitFor(() => {
      expect(screen.getByText(/folder name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate character limit and show error when exceeding 50 chars', async () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const nameInput = screen.getByLabelText(/folder name/i);
    const longName = 'A'.repeat(51);
    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.submit(screen.getByRole('button', { name: /rename folder/i }));

    await waitFor(() => {
      expect(screen.getByText(/folder name must be 50 characters or less/i)).toBeInTheDocument();
    });
  });

  it('should call onRename with correct data when form is submitted successfully', async () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const nameInput = screen.getByLabelText(/folder name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Folder Name' } });
    fireEvent.submit(screen.getByRole('button', { name: /rename folder/i }));

    await waitFor(() => {
      expect(mockOnRename).toHaveBeenCalledWith({
        name: 'Updated Folder Name',
        folderId: '1',
        type: 'prompts'
      });
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={true}
      />
    );

    expect(screen.getByRole('button', { name: /renaming\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rename folder/i })).toBeDisabled();
    expect(screen.getByLabelText(/folder name/i)).toBeDisabled();
  });

  it('should not render when isOpen is false', () => {
    render(
      <RenameFolderModal
        isOpen={false}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle keyboard shortcuts - Enter to submit, Escape to cancel', async () => {
    render(
      <RenameFolderModal
        isOpen={true}
        onClose={mockOnClose}
        onRename={mockOnRename}
        folder={mockProject}
        type="prompts"
        loading={false}
      />
    );

    const nameInput = screen.getByLabelText(/folder name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnRename).toHaveBeenCalled();
    });

    jest.clearAllMocks();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});