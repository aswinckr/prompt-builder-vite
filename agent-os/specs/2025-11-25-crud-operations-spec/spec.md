# Specification: Complete CRUD Operations with Confirmations and Feedback

## Goal
Implement complete CRUD operations with proper confirmation dialogs and user feedback for both prompts and context blocks, ensuring safe delete operations and clear success/error notifications.

## User Stories
- As a user, I want confirmation dialogs before deleting prompts or context blocks so I don't accidentally lose important content
- As a user, I want to see success/error notifications when I perform CRUD operations so I know whether they succeeded or failed
- As a user, I want to be able to delete context blocks from both the individual view and the grid view so I can manage my knowledge effectively
- As a user, I want consistent delete icons and confirmation messages across the application for a predictable experience

## Specific Requirements

**Toast Notification System**
- Create a reusable Toast notification component that supports success, error, warning, and info variants
- Position toasts in the top-right corner with auto-dismiss after 5 seconds
- Include manual dismiss option and stacking support for multiple notifications
- Use existing Tailwind color schemes with proper contrast ratios
- Support TypeScript with proper type definitions for toast props

**Confirmation Dialog Component**
- Create a reusable ConfirmationModal component based on existing Modal.tsx
- Include title, message content, confirm button, and cancel button
- Support customizable button text and colors for different confirmation types
- Use AlertTriangle icon for warning confirmations and Trash2 icon for delete confirmations
- Handle keyboard events (Enter to confirm, Escape to cancel)
- Implement proper overlay behavior to prevent interaction with background elements

**Prompt Delete Confirmation**
- Add confirmation dialog before deleting any prompt from SavedPromptList component
- Use clear message: "Are you sure you want to delete '{prompt title}'? This action cannot be undone."
- Position delete button with Trash2 icon in existing action buttons area
- Show success toast when deletion completes: "Prompt '{prompt title}' deleted successfully"
- Show error toast if deletion fails: "Failed to delete prompt. Please try again."

**Context Block Delete Functionality**
- Add delete button to ContextBlock component with Trash2 icon
- Add delete functionality to ContextBlocksGrid component
- Implement confirmation dialog for context block deletion with appropriate message
- Show success toast when context block deletion completes
- Show error toast if context block deletion fails
- Remove deleted context blocks from any active selections in prompt builder

**Update Operation Feedback**
- Add success toast notifications when prompt updates complete in EditPromptModal
- Add success toast notifications when context block updates complete in EditContextModal
- Show error toast notifications for update failures with specific error messages
- Ensure toasts don't interfere with ongoing user workflows

**CRUD Error Handling**
- Implement consistent error handling across all CRUD operations
- Show user-friendly error messages in toasts for database errors, network issues, and validation failures
- Include retry suggestions where appropriate (e.g., "Check your connection and try again")
- Log detailed errors to console for debugging while showing simplified messages to users

**Visual Consistency**
- Use lucide-react Trash2 icon for all delete actions
- Use consistent button styling with hover effects and focus states
- Maintain existing color schemes (red variants for delete actions)
- Ensure proper spacing and alignment with existing UI patterns
- Follow accessibility guidelines with proper ARIA labels and keyboard navigation

## Existing Code to Leverage

**Modal.tsx Component**
- Fully functional modal component with overlay behavior and accessibility features
- Supports different sizes (sm, md, lg, xl, full) and responsive behavior
- Includes proper keyboard event handling (Escape to close) and click-outside-to-close functionality
- Has consistent styling with existing application theme using neutral colors and proper contrast

**LibraryContext State Management**
- Complete CRUD actions already implemented: deleteSavedPrompt, deleteContextBlock, updateSavedPrompt, updateContextBlock
- Proper error handling patterns returning DatabaseResponse objects with data and error properties
- State management uses useReducer pattern with proper action types for all operations
- Context provider pattern with useLibraryActions and useLibraryState hooks for clean component integration

**Backend Services**
- PromptService.deletePrompt() and ContextService.deleteContextBlock() work correctly with proper error handling
- Update operations (PromptService.updatePrompt, ContextService.updateContextBlock) fully functional
- Services return DatabaseResponse objects with consistent error and data patterns
- Proper user authentication checks and row-level security integration

**Existing Icon Library**
- lucide-react library already integrated with Trash2, AlertTriangle, and other needed icons
- Icons properly sized and styled in existing components
- Consistent icon usage patterns established throughout the application

**SavedPromptList Component Pattern**
- Already has delete button with Trash2 icon in the action buttons area (line 237-244)
- Action button layout and styling can be replicated for confirmation functionality
- Proper error handling patterns already established with try-catch blocks

## Out of Scope
- Bulk delete operations for multiple selected items
- Undo functionality after delete operations
- Advanced toast customization (animations, custom positioning)
- Permission-based CRUD restrictions
- Audit logging for CRUD operations
- Real-time synchronization of CRUD operations across multiple browser tabs
- Advanced filtering or searching in confirmation dialogs
- Batch operations or drag-and-drop reordering in this spec