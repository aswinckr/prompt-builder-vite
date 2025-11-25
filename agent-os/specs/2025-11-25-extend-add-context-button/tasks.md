#### Task Group 1: Data Model and State Enhancement
**Dependencies:** None

- [x] 1.0 Extend ContextBlock interface and types
  - [x] 1.1 Add isTemporary field to ContextBlock interface
  - [x] 1.2 Update LibraryContext reducer for temporary blocks
  - [x] 1.3 Add createTemporaryBlock and removeTemporaryBlock actions
  - [x] 1.4 Ensure proper type safety for mixed block types

#### Task Group 2: Dropdown Menu Implementation
**Dependencies:** Task Group 1

- [x] 2.0 Implement shadcn-based ContextDropdown
  - [x] 2.1 Create ContextDropdown component with shadcn UI
  - [x] 2.2 Add "Add Text Block" and "Add Knowledge" menu options
  - [x] 2.3 Implement keyboard and mouse interaction support
  - [x] 2.4 Add proper accessibility attributes (ARIA)
  - [x] 2.5 Ensure dropdown positioning and closing behavior
  - [x] 2.6 Test responsive design on mobile and desktop

#### Task Group 3: Temporary Text Block Creation and Management
**Dependencies:** Task Group 2

- [x] 3.0 Complete text block management system
  - [x] 3.1 Write 5 focused tests for temporary text blocks
    - Test temporary block creation with unique ID
    - Test auto-focus on newly created editor
    - Test content updates save to state
    - Test drag and drop reordering of temporary blocks
    - Test delete functionality for temporary blocks
  - [x] 3.2 Create TemporaryContextBlock component
    - Extend existing ContextBlock component
    - Add visual distinction for temporary blocks (different icon/badge)
    - Maintain expand/collapse functionality
    - Add delete capability without confirmation
    - Minimum 200px height for editor area
  - [x] 3.3 Integrate TipTapEditor for temporary blocks
    - Use existing TipTapEditor component
    - Set placeholder "Start typing your context here..."
    - Configure full formatting toolbar integration
    - Handle real-time content updates to state
    - Apply neutral theme styling consistency
  - [x] 3.4 Implement drag and drop for temporary blocks
    - Leverage existing React DnD implementation
    - Ensure temporary blocks can be reordered with permanent blocks
    - Maintain visual feedback during drag operations
  - [x] 3.5 Add auto-focus functionality
    - Focus TipTap editor when temporary block is created
    - Scroll newly created block into view if needed
    - Handle edge cases for multiple blocks
  - [x] 3.6 Ensure text block management tests pass
    - Run the 5 tests written in 3.1
    - Verify integration with existing drag and drop system
    - Do NOT run the entire test suite

#### Task Group 4: Component Integration and UI Updates
**Dependencies:** Task Group 3

- [x] 4.0 Integrate ContextDropdown into existing UI
  - [x] 4.1 Update PromptBuilderBlockList.tsx to use ContextDropdown
  - [x] 4.2 Replace old "+ Add Context" buttons with dropdown
  - [x] 4.3 Add block count indicators (text blocks vs knowledge blocks)
  - [x] 4.4 Implement compact dropdown variant for when blocks exist
  - [x] 4.5 Ensure consistent neutral theme styling
  - [x] 4.6 Add responsive design for mobile and desktop
  - [x] 4.7 Test user flow from empty state to multiple blocks

#### Task Group 5: Comprehensive Testing and Edge Cases
**Dependencies:** Task Group 4

- [x] 5.0 Complete testing coverage and edge case handling
  - [x] 5.1 Write integration tests for ContextDropdown (10 tests)
    - Test dropdown opens/closes correctly
    - Test "Add Text Block" creates temporary blocks
    - Test "Add Knowledge" navigates correctly
    - Test accessibility attributes
    - Test responsive behavior
    - Test empty state display
    - Test mixed block type display
    - Test custom className support
  - [x] 5.2 Write LibraryContext actions tests (6 tests)
    - Test createTemporaryBlock function
    - Test removeTemporaryBlock function
    - Test mixed temporary/permanent block state
    - Test unique ID generation
    - Test default properties
    - Test state persistence
  - [x] 5.3 Verify existing TemporaryContextBlock tests pass
  - [x] 5.4 Test drag and drop integration with mixed block types
  - [x] 5.5 Test auto-focus and scroll-to-view functionality
  - [x] 5.6 Test multiple temporary blocks creation and management
  - [x] 5.7 Test block removal updates prompt builder correctly
  - [x] 5.8 Test responsive design on various screen sizes
  - [x] 5.9 Test keyboard navigation and accessibility
  - [x] 5.10 Run focused tests to verify feature works correctly

## Implementation Summary

**All 5 task groups have been completed successfully:**

✅ **Task Group 1**: Extended ContextBlock interface with `isTemporary` field, implemented createTemporaryBlock and removeTemporaryBlock actions in LibraryContext

✅ **Task Group 2**: Created ContextDropdown component with shadcn UI, supporting both "Add Text Block" and "Add Knowledge" options with proper accessibility

✅ **Task Group 3**: Built TemporaryContextBlock component with full TipTap editor integration, drag-and-drop support, and visual distinction for temporary blocks

✅ **Task Group 4**: Integrated ContextDropdown into PromptBuilderBlockList, replacing old buttons with dropdown and adding block count indicators

✅ **Task Group 5**: Comprehensive test coverage including integration tests (10 tests), LibraryContext actions tests (6 tests), and existing component tests

**Key Features Implemented:**
- Dropdown menu with "Add Text Block" and "Add Knowledge" options
- Temporary text blocks with TipTap editor and full formatting
- Auto-focus on newly created blocks with scroll-to-view
- Drag-and-drop reordering between temporary and permanent blocks
- Visual distinction (orange theme) for temporary blocks
- Block count indicators showing "X texts • Y knowledge"
- Responsive design with mobile support
- Full accessibility support with ARIA attributes
- Unique ID generation for temporary blocks
- State management without database persistence for temporary blocks

The feature is now fully functional and ready for use. Users can add both temporary text blocks and permanent knowledge blocks through the enhanced dropdown interface.