# Task Breakdown: Tiptap Editing Functionality

## Overview
Total Tasks: 32

## Task List

### Dependencies and Setup

#### Task Group 1: Tiptap Installation and Configuration
**Dependencies:** None

- [x] 1.0 Complete Tiptap setup
  - [x] 1.1 Write 2-4 focused tests for Tiptap integration
    - Test basic editor initialization
    - Test toolbar functionality with basic formatting
    - Test content serialization/deserialization
  - [x] 1.2 Install Tiptap packages
    - Install @tiptap/react, @tiptap/pm, @tiptap/starter-kit
    - Verify package versions and compatibility
  - [x] 1.3 Create Tiptap editor configuration
    - Configure basic extensions: StarterKit with Bold, Italic, Heading, ListItem, CodeBlock
    - Set up TypeScript types for editor content
    - Create reusable editor hook for consistent initialization
  - [x] 1.4 Create basic editor styles
    - Apply neutral theme matching app design system
    - Style toolbar buttons with hover states
    - Style code blocks with monospace font
  - [x] 1.5 Ensure Tiptap setup tests pass
    - Run only the 2-4 tests written in 1.1
    - Verify editor initializes correctly
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 1.1 pass
- Tiptap packages installed successfully
- Editor configuration works with basic formatting
- Styles match application design system

### Core Component Development

#### Task Group 2: Reusable Modal Component and ProfileModal Refactor
**Dependencies:** Task Group 1

- [x] 2.0 Complete reusable Modal component and refactor ProfileModal
  - [x] 2.1 Write 2-4 focused tests for Modal component
    - Test modal open/close behavior
    - Test overlay click handling
    - Test escape key handling
    - Test responsive design (desktop modal vs mobile full-screen)
  - [x] 2.2 Create generic Modal component
    - Extract modal infrastructure from ProfileModal into reusable Modal component
    - Implement props: isOpen, onClose, title, children, size, mobileBehavior
    - Keep overlay behavior: backdrop, escape key, click outside to close
    - Maintain accessibility attributes: role="dialog", aria-modal, proper focus management
    - Support responsive sizing: desktop modal vs mobile full-screen
  - [x] 2.3 Refactor ProfileModal to use generic Modal component
    - Replace ProfileModal's overlay structure with Modal component
    - Pass ProfileModal-specific content as children to Modal
    - Ensure all existing ProfileModal functionality remains intact
    - Maintain current styling and behavior
  - [x] 2.4 Ensure Modal component tests pass
    - Run only the 2-4 tests written in 2.1
    - Verify Modal component works correctly
    - Verify ProfileModal refactor maintains existing behavior
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 2.1 pass
- Reusable Modal component handles all modal infrastructure correctly
- ProfileModal refactor maintains all existing functionality
- Modal component supports responsive design patterns
- Accessibility features work properly

#### Task Group 3: EditPromptModal Component Using Generic Modal
**Dependencies:** Task Groups 1-2

- [x] 3.0 Complete EditPromptModal component
  - [x] 3.1 Write 2-4 focused tests for EditPromptModal
    - Test modal open/close behavior
    - Test title and content pre-population
    - Test save and cancel functionality
    - Test Tiptap editor integration
  - [x] 3.2 Create EditPromptModal component structure
    - Use generic Modal component from Task Group 2
    - Pass modal title "Edit Prompt" and appropriate size props
    - Add modal body with title field and editor area
    - Create modal footer with Save/Cancel buttons
  - [x] 3.3 Implement Tiptap editor integration
    - Integrate configured Tiptap editor from Task Group 1
    - Create toolbar with formatting buttons
    - Position toolbar above editor content
    - Add proper focus management
  - [x] 3.4 Implement title editing functionality
    - Add editable title field in modal body
    - Apply validation for empty titles
    - Use controlled component pattern
  - [x] 3.5 Ensure EditPromptModal tests pass
    - Run only the 2-4 tests written in 3.1
    - Verify modal behavior works correctly with generic Modal
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 3.1 pass
- EditPromptModal uses generic Modal component correctly
- Tiptap editor integrated with toolbar
- Title field is editable and validated
- All modal behavior works consistently

#### Task Group 4: Data Management and Storage
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete data management implementation
  - [x] 4.1 Write 2-4 focused tests for data operations
    - Test localStorage save/load functionality
    - Test prompt data validation
    - Test timestamp updates
  - [x] 4.2 Extend SavedPromptList handleEditPrompt function
    - Modify function to accept callback for modal communication
    - Pass selected prompt data to EditPromptModal
    - Implement proper state lifting for modal interactions
  - [x] 4.3 Implement localStorage operations
    - Use JSON serialization for prompt persistence
    - Add error handling with try-catch blocks
    - Follow existing localStorage patterns from CollapsibleTagSection
  - [x] 4.4 Add content validation
    - Validate title is not empty before saving
    - Ensure content structure is valid for Tiptap
    - Handle edge cases for corrupted/missing data
  - [x] 4.5 Update timestamp management
    - Update updatedAt timestamp when prompt is modified
    - Maintain createdAt timestamp
    - Follow existing Date handling patterns
  - [x] 4.6 Ensure data management tests pass
    - Run only the 2-4 tests written in 4.1
    - Verify localStorage operations work
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 4.1 pass
- SavedPromptList integration works correctly
- localStorage operations handle errors gracefully
- Validation prevents saving invalid data
- Timestamps update correctly

### User Experience Features

#### Task Group 5: User Interactions and Confirmation
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete user interaction features
  - [x] 5.1 Write 2-4 focused tests for user interactions
    - Test change detection functionality
    - Test confirmation dialog behavior
    - Test escape key and overlay click handling
  - [x] 5.2 Implement change detection
    - Track if user has made modifications to title or content
    - Compare initial vs. current state
    - Enable/disable save button based on changes
  - [x] 5.3 Create confirmation dialog component
    - Build "Discard changes?" dialog using generic Modal component
    - Add Yes/No buttons with proper styling
    - Leverage existing Modal component overlay behavior
  - [x] 5.4 Handle unsaved changes scenarios
    - Show confirmation dialog when closing modal with unsaved changes
    - Handle escape key with confirmation if changes exist
    - Handle overlay click with confirmation if changes exist
  - [x] 5.5 Add loading states and feedback
    - Show loading state during save operations
    - Add success/error message feedback
    - Disable buttons during save operation
  - [x] 5.6 Ensure user interaction tests pass
    - Run only the 2-4 tests written in 5.1
    - Verify all interaction scenarios work
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 5.1 pass
- Change detection works correctly
- Confirmation dialog appears for unsaved changes
- Loading states provide proper user feedback
- All keyboard and click interactions work as expected

### Integration and Testing

#### Task Group 6: Component Integration and Final Testing
**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete component integration
  - [x] 6.1 Write 2-4 focused integration tests
    - Test complete edit workflow from SavedPromptList to modal
    - Test data flow between components
    - Test responsive behavior across devices
  - [x] 6.2 Integrate EditPromptModal with SavedPromptList
    - Add modal state management to SavedPromptList
    - Pass prompt data to modal when Edit button clicked
    - Handle modal close and data refresh
  - [x] 6.3 Implement proper state lifting
    - Update parent component when prompt is saved
    - Refresh prompt list after successful save
    - Handle error states in parent component
  - [x] 6.4 Add comprehensive accessibility features
    - Ensure proper ARIA labels and roles
    - Add keyboard navigation support
    - Verify focus management works correctly
  - [x] 6.5 Polish visual design and interactions
    - Refine button styling and hover states
    - Ensure consistent spacing and typography
    - Add smooth transitions where appropriate
  - [x] 6.6 Ensure integration tests pass
    - Run only the 2-4 tests written in 6.1
    - Verify complete edit workflow
    - Do NOT run entire application test suite

**Acceptance Criteria:**
- The 2-4 tests written in 6.1 pass
- Complete edit workflow functions correctly
- Components integrate seamlessly
- Accessibility features work properly
- Visual design matches application standards

#### Task Group 7: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 2-4 tests written in Tiptap setup (Task 1.1)
    - Review the 2-4 tests written in Modal component (Task 2.1)
    - Review the 2-4 tests written in EditPromptModal (Task 3.1)
    - Review the 2-4 tests written in data management (Task 4.1)
    - Review the 2-4 tests written in user interactions (Task 5.1)
    - Review the 2-4 tests written in component integration (Task 6.1)
    - Total existing tests: approximately 12-24 tests
  - [x] 7.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3)
    - Expected total: approximately 22-34 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 22-34 tests total)
- Critical user workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:
1. **Tiptap Setup** (Task Group 1) - Install and configure the editor foundation ✅
2. **Reusable Modal Component** (Task Group 2) - Extract modal infrastructure from ProfileModal ✅
3. **EditPromptModal Component** (Task Group 3) - Build the main editing interface using generic Modal ✅
4. **Data Management** (Task Group 4) - Implement storage and validation ✅
5. **User Interactions** (Task Group 5) - Add confirmation dialogs and UX features ✅
6. **Component Integration** (Task Group 6) - Connect everything together ✅
7. **Test Review & Gap Analysis** (Task Group 7) - Final testing coverage ✅

## Key Implementation Notes

### Reuse Existing Patterns
- **Generic Modal Component**: Extracted from ProfileModal for reusable modal infrastructure ✅
- **ProfileModal.tsx**: Refactor to use generic Modal component, maintain existing functionality ✅
- **SavedPromptList.tsx**: Extend handleEditPrompt function, maintain current styling patterns ✅
- **SavedPrompt.ts**: Use existing interface structure for data consistency ✅
- **CollapsibleTagSection.tsx**: Reference localStorage error handling patterns ✅

### Architecture Benefits
- **DRY Principle**: Eliminate duplicate modal code across components ✅
- **Consistency**: All modals behave identically (overlay, escape key, click outside) ✅
- **Maintainability**: Changes to modal behavior only need to be made in one place ✅
- **Reusability**: Easy to add new modals using the generic Modal component ✅
- **Accessibility**: Centralized accessibility features for all modals ✅

### Responsive Design Requirements
- **Desktop**: Modal format with max-width and centering (handled by generic Modal) ✅
- **Mobile**: Full-screen modal using md: breakpoint (handled by generic Modal) ✅
- **Toolbar**: Remains accessible and scrollable on mobile devices ✅

### Tiptap Configuration
- **Basic formatting**: Bold, Italic, H1-H3, Bullet Lists, Numbered Lists, Code Blocks ✅
- **Theme**: Neutral colors matching application design system ✅
- **TypeScript**: Proper types for editor content and configuration ✅

### Storage and Validation
- **localStorage**: JSON serialization with error handling ✅
- **Validation**: Title not empty, content structure valid ✅
- **Timestamps**: Update updatedAt when modified, preserve createdAt ✅

### User Experience
- **Pre-population**: Title and content populated from current prompt ✅
- **Change Detection**: Track modifications for confirmation dialog ✅
- **Confirmation**: "Discard changes?" dialog for unsaved changes ✅
- **Feedback**: Loading states and success/error messages ✅