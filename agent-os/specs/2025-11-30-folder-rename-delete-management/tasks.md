# Task Breakdown: Folder Rename/Delete Management

## Overview
Total Tasks: 19
Estimated Effort: 2-3 days (leveraging 90% existing infrastructure)

## Key Insights from Requirements Analysis
- **High Leverage**: ~90% of required functionality already exists (ProjectService, LibraryContext, UI components)
- **Primary Work**: UI integration (context menus, rename modal) and wiring existing methods
- **Low Risk**: Building on proven patterns with established validation and error handling
- **Fast Iteration**: Focus on UI layer with minimal backend work required

## Task List

### Phase 1: UI Components and Context Menus
**Dependencies:** None
**Focus:** Adding three-dot context menus to folder cards

- [ ] 1.0 Complete UI context menu implementation
  - [ ] 1.1 Write 2-4 focused tests for context menu behavior
    - Test menu trigger and visibility for user folders
    - Test menu absence for system folders
    - Test keyboard navigation and accessibility
    - Test menu item click actions
  - [ ] 1.2 Create FolderActionMenu component
    - Reuse: ContextDropdown pattern as base
    - Props: folder, type, onRename, onDelete
    - Include three-dot button with proper hover states
    - Follow existing dropdown styling from Radix UI
  - [ ] 1.3 Add context menu to ProjectSidebar folder cards
    - Conditionally show only for user-created folders (!is_system)
    - Maintain existing folder card layout and styling
    - Preserve keyboard navigation for project selection
    - Add proper ARIA labels and descriptions
  - [ ] 1.4 Implement menu styling and positioning
    - Consistent with existing ContextDropdown styling
    - Proper z-index handling with Radix portal
    - Include hover/active states for menu items
    - Add icons for rename and delete actions
  - [ ] 1.5 Ensure UI component tests pass
    - Run ONLY the 2-4 tests written in 1.1
    - Verify context menu appears/disappears correctly
    - Test keyboard accessibility (Enter, Escape, Arrow keys)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 1.1 pass
- Context menus appear only on user folders
- System folders show no menu trigger
- Keyboard navigation works properly
- Styling matches existing design patterns

### Phase 2: Rename Modal Implementation
**Dependencies:** Phase 1
**Focus:** Creating rename modal with validation and state management

- [ ] 2.0 Complete rename modal implementation
  - [ ] 2.1 Write 2-4 focused tests for rename modal functionality
    - Test modal opens with current folder name pre-populated
    - Test form validation (required, 50 char limit)
    - Test successful rename with state update
    - Test cancel/close behavior
  - [ ] 2.2 Create RenameFolderModal component
    - Reuse: CreateFolderModal structure and validation patterns
    - Include pre-populated folder name in input field
    - Support keyboard shortcuts (Enter to save, Escape to cancel)
    - Show loading state during rename operation
    - Use existing Modal component infrastructure
  - [ ] 2.3 Implement folder name validation
    - Reuse validation logic from CreateFolderModal
    - Required field validation with clear error messages
    - 50 character limit enforcement
    - Prevent duplicate names within same parent/type
    - Show inline error messages with icons
  - [ ] 2.4 Wire modal to state management
    - Add modal state to LibraryContext (isOpen, folderId, folderName)
    - Connect to existing UPDATE_PROMPT_PROJECT/UPDATE_DATASET_PROJECT actions
    - Handle optimistic updates and rollback on errors
    - Maintain selected folder state during rename
  - [ ] 2.5 Ensure rename modal tests pass
    - Run ONLY the 2-4 tests written in 2.1
    - Verify form validation works correctly
    - Test successful rename updates UI immediately
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 2.1 pass
- Modal opens with current folder name
- Form validation prevents invalid names
- Rename operation updates UI immediately
- Modal closes automatically on success

### Phase 3: Delete Confirmation and API Integration
**Dependencies:** Phase 2
**Focus:** Delete confirmation dialog and service method integration

- [ ] 3.0 Complete delete confirmation and API integration
  - [ ] 3.1 Write 2-4 focused tests for delete functionality
    - Test confirmation modal shows for user folders
    - Test delete protection for system folders
    - Test successful delete removes folder from UI
    - Test cancel behavior keeps folder
  - [ ] 3.2 Enhance ConfirmationModal for folder deletion
    - Reuse existing ConfirmationModal component
    - Add warning message about nested content deletion
    - Show count of items that will be deleted (if applicable)
    - Use red theme and trash icon for delete confirmations
    - Include proper loading state during delete operation
  - [ ] 3.3 Integrate with existing ProjectService methods
    - Connect to ProjectService.deleteProject (already implemented)
    - Leverage existing system folder protection logic
    - Handle cascading deletions for child folders and contained items
    - Use existing error handling and user permission checks
  - [ ] 3.4 Update LibraryContext delete actions
    - Use existing DELETE_PROMPT_PROJECT/DELETE_DATASET_PROJECT actions
    - Handle state updates after successful deletion
    - Clear selection if current folder is deleted
    - Implement proper error handling and rollback
  - [ ] 3.5 Ensure delete functionality tests pass
    - Run ONLY the 2-4 tests written in 3.1
    - Verify delete protection works for system folders
    - Test successful delete updates UI immediately
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 3.1 pass
- Delete confirmation shows proper warnings
- System folders are protected from deletion
- UI updates immediately after successful delete
- Error handling works gracefully

### Phase 4: Error Handling and Accessibility
**Dependencies:** Phase 3
**Focus:** Comprehensive error handling and accessibility features

- [ ] 4.0 Complete error handling and accessibility
  - [ ] 4.1 Write 2-3 focused tests for error handling scenarios
    - Test network error handling with retry options
    - Test concurrent modification handling
    - Test accessibility with screen reader
  - [ ] 4.2 Implement comprehensive error handling
    - Show appropriate error messages for failed operations
    - Handle network issues with retry options
    - Validate permissions before allowing actions
    - Handle concurrent modifications from multiple sessions
  - [ ] 4.3 Add accessibility enhancements
    - Ensure all new UI elements are keyboard accessible
    - Add proper ARIA labels and descriptions
    - Implement focus management in modals and dropdowns
    - Support screen reader announcements for actions
    - Test with keyboard-only navigation
  - [ ] 4.4 Add performance optimizations
    - Implement optimistic updates for immediate UI feedback
    - Minimize re-renders during folder operations
    - Ensure smooth animations and transitions
    - Test performance with large folder structures
  - [ ] 4.5 Ensure error handling tests pass
    - Run ONLY the 2-3 tests written in 4.1
    - Verify error messages are clear and helpful
    - Test retry functionality works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-3 tests written in 4.1 pass
- Error messages are clear and actionable
- All features work with keyboard navigation
- Screen reader announces actions properly
- Performance remains smooth with large data

### Phase 5: Integration Testing and Refinement
**Dependencies:** Phases 1-4
**Focus:** End-to-end workflows and final polish

- [ ] 5.0 Complete integration and refinement
  - [ ] 5.1 Write 2-3 focused integration tests
    - Test complete rename workflow from menu to success
    - Test complete delete workflow with confirmation
    - Test state synchronization between components
  - [ ] 5.2 Perform end-to-end testing
    - Test rename functionality with both prompt and dataset folders
    - Test delete protection for all system folder types
    - Verify state consistency across LibraryContext
    - Test real-time updates from other browser sessions
  - [ ] 5.3 Validate responsive design and mobile experience
    - Ensure context menus work on mobile devices
    - Test modal behavior on different screen sizes
    - Verify touch interactions work properly
    - Maintain consistent styling across devices
  - [ ] 5.4 Final code review and cleanup
    - Remove any dead code or unused imports
    - Ensure consistent naming conventions
    - Add necessary inline documentation
    - Verify all components follow established patterns
  - [ ] 5.5 Run complete feature test suite
    - Run ALL tests written in phases 1-4 (approximately 8-14 tests total)
    - Verify all critical workflows pass
    - Do NOT run the entire application test suite
    - Focus exclusively on this feature's functionality

**Acceptance Criteria:**
- All 2-3 integration tests from 5.1 pass
- Complete workflows work end-to-end
- Mobile experience is fully functional
- Code follows all established conventions
- All 8-14 feature-specific tests pass

## Execution Order

**Recommended implementation sequence:**
1. **Phase 1: UI Components** - Build the visible interface elements first
2. **Phase 2: Rename Modal** - Add rename functionality with validation
3. **Phase 3: Delete Integration** - Wire up delete confirmation and existing APIs
4. **Phase 4: Error/Accessibility** - Add comprehensive error handling and accessibility
5. **Phase 5: Integration Testing** - End-to-end validation and final polish

**Key Advantages of This Approach:**
- **Leverages Existing Infrastructure**: 90% of backend/service logic already exists
- **Focused UI Development**: Primary work is integrating new UI components
- **Low Risk Implementation**: Building on proven patterns and established validation
- **Fast Time to Value**: Core functionality achievable quickly with existing foundation
- **Iterative Testing**: Each phase has focused test coverage for rapid feedback

## Technical Notes

**Existing Components to Reuse:**
- `ProjectService.updateProject()` and `ProjectService.deleteProject()` - Already implemented
- `LibraryContext` actions - UPDATE_* and DELETE_* actions ready to use
- `ConfirmationModal` - Flexible confirmation dialog infrastructure
- `CreateFolderModal` - Validation patterns and form structure
- `DropdownMenu` - Radix UI component for context menus

**New Components to Create:**
- `FolderActionMenu` - Three-dot context menu for folder cards
- `RenameFolderModal` - Rename dialog with validation
- Enhanced delete confirmation messages

**State Management Strategy:**
- Extend existing LibraryContext with minimal new state
- Reuse existing action patterns for rename/delete operations
- Leverage established optimistic update mechanisms