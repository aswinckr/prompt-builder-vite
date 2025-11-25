# Spec Requirements: CRUD Operations for Text Blocks in Prompt Builder

## Initial Description
Enhance the context block management system to support inline CRUD operations for temporary text blocks directly within the prompt builder, allowing users to create, read, update, and delete text content without leaving the prompt building interface.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the dropdown menu should appear when users click the existing "Add Context Block" or "Add More" buttons in the prompt builder. Is that correct, or should it be a separate dedicated button?
**Answer:** Yes, dropdown appears below current "Add Context Block" and "Add More" buttons

**Q2:** I'm thinking the text blocks should be temporary by default but offer an option to save them to the knowledge library. Should we make this a checkbox in the text block interface, a button in the dropdown, or save to library automatically if content exceeds a certain length?
**Answer:** Text blocks are temporary with option to save to knowledge library

**Q3:** For the dropdown menu styling, should we match the existing dark theme of the app with hover effects? I'm assuming a simple dropdown with "Add Text Block" option, but should we include other block types that might be added later?
**Answer:** Use shadcn dropdown menu component (https://www.shadcn.io/ui/dropdown-menu)

**Q4:** Do text blocks need to behave exactly like context blocks (draggable, reorderable, expandable/collapsible) or should they have a simpler interface since they're temporary? Should they have the same save/delete functionality in the block header?
**Answer:** Yes - text blocks behave like existing context blocks (drag, reorder, expand/collapse, removable) with save to library option

**Q5:** For the rich text editor in the modal, should we include all formatting options (bold, italic, links, lists, etc.) or just basic text editing? I'm assuming we want full TipTap features but with a toggle to show/hide formatting toolbar.
**Answer:** Full TipTap features but with toggle for formatting on/off

**Q6:** What accessibility features should we prioritize? I'm thinking ARIA labels for screen readers, keyboard navigation for the dropdown (arrow keys, Enter to select), and focus management when the modal opens/closes. Any specific accessibility requirements?
**Answer:** Simple ARIA labels and keyboard shortcuts

**Q7:** Should we show any confirmation messages when blocks are added/deleted, or should these actions happen silently with visual feedback only (like the block appearing/disappearing)? I'm assuming no toast notifications to avoid clutter.
**Answer:** No confirmation messages - appear silently

**Q8:** Can users add multiple text blocks, and if so, should they be able to reorder them alongside context blocks? I'm assuming yes, but should we limit the number of text blocks or treat them differently in the ordering?
**Answer:** Support multiple text blocks and deletion

### Existing Code to Reference

**Similar Features Identified:**
- Existing ContextBlock component (`/Users/aswin/Documents/1-Projects/Prompt Builder/prompt-builder-vite/src/components/ContextBlock.tsx`) - Provides the core block interface with drag, expand/collapse, and delete functionality
- PromptBuilderBlock component - Handles drag and drop reordering between blocks
- TipTapEditor component (`/Users/aswin/Documents/1-Projects/Prompt Builder/prompt-builder-vite/src/components/TipTapEditor.tsx`) - Full-featured rich text editor with formatting capabilities
- TipTapToolbar component - Provides rich text formatting controls that can be toggled
- Current PromptBuilderBlockList component (`/Users/aswin/Documents/1-Projects/Prompt Builder/prompt-builder-vite/src/components/PromptBuilderBlockList.tsx`) - Contains the "Add Context Block" and "Add More" buttons that need dropdown enhancement

**Components to potentially reuse:**
- TipTapEditor and TipTapToolbar for rich text editing
- ContextBlock interface pattern for block display
- Drag and drop logic from PromptBuilderBlock
- Existing modal patterns from the application

**Backend logic to reference:**
- Context management patterns from LibraryContext
- Block ordering and management logic
- Navigation patterns using handleAddBlock function

### Follow-up Questions
No follow-up questions needed - user provided comprehensive answers.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- Add dropdown menu to existing "Add Context Block" and "Add More" buttons
- Create temporary text blocks that can be saved to knowledge library
- Implement full CRUD operations (Create, Read, Update, Delete) for text blocks
- Integrate shadcn dropdown menu component
- Support drag and drop reordering with existing context blocks
- Provide rich text editing with full TipTap features
- Include toggle for formatting toolbar on/off
- Support multiple text blocks in a single prompt
- Maintain expandable/collapsible block functionality

### Reusability Opportunities
- TipTapEditor component for rich text editing capabilities
- ContextBlock component structure for consistent block interface
- PromptBuilderBlock drag and drop functionality
- LibraryContext patterns for block management
- Existing modal components for text editing interface
- Current navigation and button patterns in PromptBuilderBlockList

### Scope Boundaries
**In Scope:**
- Dropdown menu integration with existing buttons
- Temporary text block creation and management
- Rich text editing with full formatting capabilities
- Block reordering and interaction patterns matching context blocks
- Save to library functionality for temporary blocks
- Multiple text block support
- Delete functionality for text blocks

**Out of Scope:**
- New block types beyond text blocks
- Advanced collaboration features
- Block versioning or history
- External content integration
- Mobile-specific optimizations (beyond responsive design)

### Technical Considerations
- Need to add shadcn/ui components to the project (not currently integrated)
- Leverage existing TipTapEditor with formatting toggle capability
- Maintain compatibility with current dark theme styling
- Preserve existing drag and drop functionality
- Ensure accessibility with keyboard navigation and ARIA labels
- Follow existing component patterns and naming conventions
- Integrate with current LibraryContext state management
- Maintain backward compatibility with existing context block functionality