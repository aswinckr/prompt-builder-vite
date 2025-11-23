# Specification: Tiptap Editing Functionality

## Goal
Enable users to edit their saved prompts through a modal-based rich text editor, providing seamless editing capabilities with basic formatting options and local storage persistence.

## User Stories
- As a user, I want to edit my saved prompts by clicking the Edit button in SavedPromptList so that I can modify and improve my existing prompts
- As a user, I want a rich text editor with basic formatting options so that I can structure my content effectively
- As a mobile user, I want the editor to be full-screen on small devices so that I have adequate space to edit my content

## Specific Requirements

**Tiptap Editor Integration**
- Install and configure Tiptap with React integration (@tiptap/react, @tiptap/pm, @tiptap/starter-kit)
- Configure editor with basic formatting tools: bold, italic, headings (H1-H3), bullet lists, numbered lists, and code blocks
- Set up proper TypeScript types for the editor content and configuration
- Implement editor state management with controlled component pattern

**Modal Component Architecture**
- Create EditPromptModal component that follows ProfileModal patterns for overlay, escape key handling, and focus management
- Implement modal header with title "Edit Prompt" and close button with proper aria-labels
- Design modal body with two sections: editable title field and Tiptap editor content area
- Add modal footer with Save and Cancel buttons, properly styled with primary/secondary button patterns

**Data Management and Storage**
- Extend handleEditPrompt function in SavedPromptList to open modal with prompt data
- Implement localStorage operations using JSON serialization for prompt persistence
- Use existing SavedPrompt interface structure for consistency with current data model
- Add basic validation to ensure title is not empty and content structure is valid before saving
- Update the updatedAt timestamp when prompt is successfully modified

**Responsive Design Implementation**
- Desktop: Modal format with max-width and proper centering (following ProfileModal sizing)
- Mobile: Full-screen modal with no overlay, taking entire viewport height and width
- Implement breakpoint detection using Tailwind CSS responsive utilities (md: breakpoint)
- Ensure toolbar remains accessible and scrollable on mobile devices

**User Experience and Interactions**
- Pre-populate both title and content fields with current prompt data when modal opens
- Implement change detection to track if user has made modifications
- Show confirmation dialog "Discard changes?" when attempting to close modal with unsaved changes
- Handle escape key and overlay clicks properly with confirmation if changes exist
- Provide visual feedback during save operations (loading states, success messages)

**Error Handling and Validation**
- Validate that prompt title is not empty before allowing save
- Ensure JSON serialization/deserialization handles edge cases gracefully
- Implement try-catch blocks around localStorage operations with error logging
- Handle cases where prompt data is corrupted or missing from localStorage

**Component Integration Points**
- Modify SavedPromptList handleEditPrompt to accept callback function for modal communication
- Pass selected prompt data to EditPromptModal through props
- Implement proper state lifting to update parent component when prompt is saved
- Ensure modal reopens with fresh data if edit button is clicked again

**Toolbar Configuration**
- Position toolbar above editor content with proper spacing and styling
- Include buttons for: Bold, Italic, H1, H2, H3, Bullet List, Numbered List, Code Block
- Style toolbar to match application design system (neutral colors, hover states)
- Ensure toolbar buttons have proper tooltips and accessibility attributes

**Content Rendering and Display**
- Configure Tiptap to render content in a neutral-themed editor that matches app design
- Apply consistent typography and spacing using Tailwind CSS classes
- Ensure code blocks have proper syntax highlighting appearance with monospace font
- Handle empty content states gracefully with placeholder text

## Visual Design
No visual assets provided in planning/visuals/ folder.

## Existing Code to Leverage

**ProfileModal Component (/src/components/ProfileModal.tsx)**
- Reuse modal overlay pattern with proper z-index and backdrop styling
- Implement escape key handling and overlay click detection logic
- Apply focus management and accessibility attributes (role="dialog", aria-modal)
- Follow responsive modal sizing patterns and border styling

**SavedPromptList Component (/src/components/SavedPromptList.tsx)**
- Extend existing handleEditPrompt function to open EditPromptModal
- Maintain current prompt filtering and sorting logic
- Use existing prompt data structure from mockSavedPrompts for consistency
- Preserve current button styling and hover effects for Edit button

**ContextBlock Component (/src/components/ContextBlock.tsx)**
- Reference existing tag display patterns for consistent UI
- Follow established text truncation and line-clamp patterns for content preview
- Use similar border and background styling conventions for consistency

**localStorage Patterns (/src/components/CollapsibleTagSection.tsx)**
- Implement error handling with try-catch blocks for localStorage operations
- Use JSON serialization for complex data storage
- Follow consistent key naming conventions for localStorage keys
- Implement proper error logging when localStorage operations fail

**SavedPrompt Interface (/src/types/SavedPrompt.ts)**
- Maintain existing data structure with id, title, description, content, projectId, createdAt, updatedAt, folder, and tags
- Ensure type safety when working with prompt data throughout the application
- Follow established Date handling patterns for timestamps

## Out of Scope
- Collaborative editing features or real-time synchronization
- Advanced formatting options like tables, links, or images
- "Save as new" functionality or prompt duplication
- Auto-save functionality during editing
- Character limits or content restrictions
- @mention functionality or user tagging
- Markdown export/import capabilities
- Advanced validation beyond basic structure checking
- Undo/redo history management beyond Tiptap's built-in capabilities
- Plugin extensibility or custom editor extensions