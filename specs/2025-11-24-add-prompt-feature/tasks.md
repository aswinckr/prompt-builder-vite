# Task Breakdown: Add Prompt Feature

## Overview
Total Tasks: 4 major task groups with 22 sub-tasks

## Task List

### Frontend Components

#### Task Group 1: Prompt Creation Modal
**Dependencies:** None

- [x] 1.0 Complete prompt creation modal
  - [x] 1.1 Write 2-8 focused tests for CreatePromptModal component
    - Limit to 2-8 highly focused tests maximum
    - Test only critical modal behaviors (e.g., form submission, validation, modal open/close)
    - Skip exhaustive testing of all modal states and interactions
  - [x] 1.2 Create CreatePromptModal.tsx component
    - Base structure adapted from CreateContextModal.tsx
    - Form fields: title, description (optional), content
    - Project selection integration using existing pattern
    - Keyboard shortcuts (Cmd+Enter to save)
  - [x] 1.3 Implement TipTapEditor integration
    - Rich text editing with markdown support
    - Variable placeholder syntax highlighting ({{user_input}})
    - Helper text for variable syntax
    - Preserve plain text variables in database
  - [x] 1.4 Add form validation and error handling
    - Title required validation
    - Content required validation
    - Proper error message display
    - Loading states during submission
  - [x] 1.5 Implement mobile-responsive behavior
    - Fullscreen modal on mobile devices
    - Proper touch interactions
    - Responsive form layout
  - [x] 1.6 Ensure CreatePromptModal tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify modal opens/closes correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Modal renders correctly with all form fields
- TipTapEditor supports variable placeholders
- Form validation works properly
- Mobile-responsive behavior implemented

#### Task Group 2: Variable Placeholder System
**Dependencies:** Task Group 1

- [ ] 2.0 Complete variable placeholder system
  - [ ] 2.1 Write 2-8 focused tests for variable placeholder functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical variable behaviors (e.g., syntax detection, highlighting, persistence)
    - Skip exhaustive testing of all variable scenarios
  - [ ] 2.2 Create VariablePlaceholderHelper component
    - Visual guide for {{variable}} syntax
    - Examples of common variable usage
    - Integration with TipTapEditor
  - [ ] 2.3 Implement variable syntax highlighting
    - Visual distinction for {{variable}} patterns
    - CSS styling for highlighted variables
    - Performance optimization for large content
  - [ ] 2.4 Add variable validation and persistence
    - Ensure variables stored as plain text
    - Prevent malformed variable syntax
    - Helper text for variable creation
  - [ ] 2.5 Ensure variable placeholder tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify variables are correctly highlighted
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Variables are visually highlighted in editor
- Variable syntax is preserved in database
- Helper text provides clear guidance

#### Task Group 3: UI Integration and Button Placement
**Dependencies:** Task Groups 1-2

- [ ] 3.0 Complete UI integration
  - [ ] 3.1 Write 2-8 focused tests for UI integration
    - Limit to 2-8 highly focused tests maximum
    - Test only critical UI behaviors (e.g., button click, modal opening, responsive behavior)
    - Skip exhaustive testing of all UI states
  - [ ] 3.2 Update SearchBar component for prompt projects
    - Add "Add Prompt" button for prompt project views
    - Reuse existing "Add Knowledge" button pattern
    - Conditional rendering based on project type
    - Mobile text truncation behavior
  - [ ] 3.3 Implement blue gradient button styling
    - Consistent with existing button patterns
    - Hover effects and transitions
    - Accessibility attributes
  - [ ] 3.4 Add modal opening and callback handling
    - Integration with existing modal system
    - Success callback for prompt creation
    - Error handling and user feedback
  - [ ] 3.5 Implement responsive design patterns
    - Mobile-first approach
    - Tablet and desktop layouts
    - Touch-friendly button sizing
  - [ ] 3.6 Ensure UI integration tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify button appears in correct contexts
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- "Add Prompt" button appears in prompt project views
- Button styling matches existing patterns
- Responsive behavior works correctly

### State Management and Data Layer

#### Task Group 4: State Management Integration
**Dependencies:** Task Group 3

- [ ] 4.0 Complete state management integration
  - [ ] 4.1 Write 2-8 focused tests for state management
    - Limit to 2-8 highly focused tests maximum
    - Test only critical state behaviors (e.g., prompt creation, state updates, error handling)
    - Skip exhaustive testing of all state scenarios
  - [ ] 4.2 Update LibraryContext for prompt operations
    - Add createPrompt action if not exists
    - Real-time state updates after creation
    - Error state management
    - Loading state handling
  - [ ] 4.3 Integrate with existing PromptService
    - Use existing createPrompt() method
    - User authentication handling
    - Project association
    - Error handling patterns
  - [ ] 4.4 Add project organization integration
    - Support for prompt_projects table
    - "Unsorted" folder handling
    - Project sidebar updates
    - Folder modal integration
  - [ ] 4.5 Ensure state management tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify prompt creation updates state correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Prompt creation updates LibraryContext state
- Integration with PromptService works correctly
- Project organization functions properly

### Testing

#### Task Group 5: End-to-End Testing
**Dependencies:** Task Groups 1-4

- [ ] 5.0 Review existing tests and fill critical gaps only
  - [ ] 5.1 Review tests from Task Groups 1-4
    - Review the 2-8 tests written in Task 1.1 (CreatePromptModal)
    - Review the 2-8 tests written in Task 2.1 (Variable placeholders)
    - Review the 2-8 tests written in Task 3.1 (UI integration)
    - Review the 2-8 tests written in Task 4.1 (State management)
    - Total existing tests: approximately 8-32 tests
  - [ ] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 5.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 18-42 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 18-42 tests total)
- Critical user workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. **Frontend Components** - Task Group 1 (Prompt Creation Modal)
2. **Variable Placeholder System** - Task Group 2 (Variable Placeholders)
3. **UI Integration** - Task Group 3 (Button Placement and Integration)
4. **State Management** - Task Group 4 (LibraryContext Integration)
5. **End-to-End Testing** - Task Group 5 (Test Review and Gap Analysis)

## Technical Notes

### Existing Patterns to Leverage
- **CreateContextModal.tsx**: Complete modal structure with form validation and error handling
- **LibraryContext.tsx**: State management for prompt operations and real-time updates
- **PromptService.ts**: Complete CRUD operations for prompt creation and management
- **SearchBar.tsx**: Existing "Add Knowledge" button pattern and styling
- **TipTapEditor**: Rich text editor with markdown support
- **Modal.tsx**: Reusable modal component with accessibility features

### Key Constraints
- Feature leverages existing backend services (PromptService.ts)
- UI patterns should match existing CreateContextModal.tsx
- Variable placeholders should be preserved as plain text
- Mobile-responsive design is required
- Integration with existing project organization system

### Out of Scope
- Advanced prompt variable validation or type checking
- Prompt execution or testing functionality
- Variable value substitution at runtime
- Prompt analytics or usage tracking
- Import/export functionality for prompts