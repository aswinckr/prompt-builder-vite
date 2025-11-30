# Specification: Folder Rename/Delete Management

## Goal
Enable users to rename and delete their custom prompt and dataset folders through an intuitive interface with proper confirmation dialogs and error handling.

## User Stories
- As a user, I want to rename my folders so that I can keep my organization structure organized and relevant
- As a user, I want to delete folders I no longer need so that I can maintain a clean workspace
- As a user, I want to be protected from accidentally deleting system folders or folders with content

## Specific Requirements

**Folder Actions UI Integration**
- Add three-dot menu to each user-created folder in ProjectSidebar
- Include "Rename" and "Delete" options in dropdown menu
- Ensure system folders (like "Unsorted") show no action menu
- Maintain keyboard navigation accessibility for new menu items

**Folder Rename Functionality**
- Create rename modal that pre-populates with current folder name
- Use same validation rules as folder creation (50 char limit, required)
- Show loading state during rename operation
- Provide immediate feedback on success or error
- Close modal automatically on successful rename
- Support keyboard shortcuts (Enter to confirm, Escape to cancel)

**Folder Delete Protection**
- Implement confirmation modal before delete with clear warning message
- Check for child folders and warn about nested content deletion
- Prevent deletion of system folders entirely
- Show count of items that will be deleted if applicable
- Use different styling for delete confirmation (red theme, trash icon)

**Data Management and Validation**
- Extend ProjectService.updateProject to handle renames
- Ensure ProjectService.deleteProject validates against system folders
- Handle cascading deletions for child folders and contained items
- Maintain referential integrity with prompts and context blocks
- Update all relevant state management in LibraryContext

**State Synchronization**
- Update local state immediately after successful operations
- Refresh data from server to ensure consistency
- Handle real-time updates from other browser sessions
- Maintain selected folder state during rename operations
- Clear selection if current folder is deleted

**Error Handling and Edge Cases**
- Show appropriate error messages for failed operations
- Handle network issues gracefully with retry options
- Prevent duplicate folder names within same type and parent
- Validate permissions before allowing actions
- Handle concurrent modifications from multiple sessions

**Accessibility and UX**
- Ensure all new UI elements are keyboard accessible
- Provide proper ARIA labels and descriptions
- Use focus management in modals and dropdowns
- Support screen reader announcements for actions
- Maintain consistent styling with existing components

**Performance and Responsiveness**
- Implement optimistic updates where appropriate
- Minimize re-renders during folder operations
- Ensure smooth animations and transitions
- Test performance with large folder structures
- Optimize database queries for folder hierarchy operations

## Existing Code to Leverage

**ProjectService.deleteProject method**
- Already implements system folder protection and user validation
- Handles both prompt and dataset project types
- Returns consistent DatabaseResponse format
- Includes proper error handling and user permission checks

**ConfirmationModal component**
- Provides flexible confirmation dialog with different types (delete, warning, info)
- Supports custom icons, colors, and messages
- Includes keyboard shortcuts (Enter/Esc)
- Has loading state support for async operations
- Already uses red theme for delete confirmations

**DropdownMenu components from Radix UI**
- Provides accessible dropdown menu infrastructure
- Supports keyboard navigation and proper focus management
- Has consistent styling with existing ContextDropdown
- Includes portal for proper z-index handling
- Supports various item types including separators

**CreateFolderModal validation patterns**
- Already implements folder name validation rules
- Has character limit enforcement (50 chars)
- Provides clear error messaging
- Uses same form patterns that should be replicated
- Includes loading states and proper focus management

**LibraryContext state management**
- Already has UPDATE_PROMPT_PROJECT and UPDATE_DATASET_PROJECT actions
- Includes DELETE_PROMPT_PROJECT and DELETE_DATASET_PROJECT actions
- Has established patterns for error handling and data refresh
- Supports real-time data synchronization
- Handles optimistic updates and rollback mechanisms

**Modal component infrastructure**
- Built on Shadcn Dialog for consistent styling
- Supports different sizes and mobile behaviors
- Has proper accessibility features built-in
- Includes focus management and escape handling
- Can be disabled during loading states

**ProjectSidebar folder rendering logic**
- Already sorts projects with system folders first
- Maintains proper type separation (prompts vs datasets)
- Has keyboard navigation for project selection
- Shows prompt counts for prompt folders
- Uses consistent styling and hover effects

## Out of Scope
- Bulk folder operations (multi-select rename/delete)
- Folder move/reorganize functionality
- Folder sharing or collaboration features
- Advanced folder search and filtering
- Folder templates or presets
- Import/export folder structures
- Folder access controls or permissions
- Folder usage analytics or statistics
- Archive or soft-delete functionality