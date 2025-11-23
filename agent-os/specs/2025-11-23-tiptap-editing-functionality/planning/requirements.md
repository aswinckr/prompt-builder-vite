# Spec Requirements: Tiptap Editing Functionality

## Initial Description
The system currently displays ContextBlock components in a read-only format. I want to add editing functionality to allow users to modify their prompt contexts. When a user clicks the Edit button in SavedPromptList, it should open a modal with a Tiptap editor populated with the current prompt title and content. Users can make changes and save them to local storage.

## Requirements Discussion

### First Round Questions

**Q1:** I assume you want basic formatting options like bold, italic, headings, lists, and code blocks. Is that correct, or do you need tables, links, or images too?
**Answer:** Basic formatting like bold, italic, headings, lists, and code blocks. No tables, links, or images needed initially.

**Q2:** I'm thinking the modal should have save/cancel buttons, maybe an auto-save feature, and the formatting toolbar. Should we add "save as new" functionality or keep it simple with just overwriting the existing prompt?
**Answer:** Save button, cancel button, and formatting toolbar. Auto-save would be nice but not required for v1. No "save as new" functionality needed yet.

**Q3:** For mobile responsiveness, should the modal go full-screen on smaller devices, or remain as a modal with scrollable content?
**Answer:** Full screen on mobile for better usability. Desktop can keep modal format.

**Q4:** For local storage integration, should we use the existing localStorage key structure that you already have for saved prompts, or create a new structure for editable content? And what validation do you want on the content before saving?
**Answer:** localStorage with JSON serialization. Basic validation to ensure content structure is valid before saving.

**Q5:** When the modal opens, should it pre-populate with the current ContextBlock content, or start with a blank editor? And should the title be editable within the modal as well?
**Answer:** Pre-populate with current content AND show the current title. The title should also be editable.

**Q6:** Should there be confirmation dialogs when discarding changes (like if user closes modal without saving), or should we handle this silently?
**Answer:** Yes, show "Discard changes?" confirmation if there are unsaved changes when closing the modal.

**Q7:** Are there any character limits or content restrictions we should enforce for the title or content fields?
**Answer:** No specific limits needed initially, but keep reasonable for local storage performance.

**Q8:** Are there any features you definitely want to exclude from v1, like collaborative editing, mentions (@), or other advanced editor features?
**Answer:** No collaborative editing, mentions, or tables for this initial version.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: ProfileModal - Path: `src/components/ProfileModal.tsx`
  - Components to potentially reuse: Modal pattern with overlay, escape key handling, responsive design, proper focus management
- Feature: SavedPromptList - Path: `src/components/SavedPromptList.tsx`
  - Components to potentially reuse: Edit button and handleEditPrompt function (currently just console.log) - perfect integration points
- Feature: ContextBlock - Path: `src/components/ContextBlock.tsx`
  - Components to potentially reuse: Shows current ContextBlock structure, no edit functionality exists yet

### Follow-up Questions
No follow-up questions needed - all requirements clarified.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets to analyze.

## Requirements Summary

### Functional Requirements
- Add editing functionality to ContextBlock components through SavedPromptList Edit button
- Open a modal with Tiptap editor populated with current prompt title and content
- Allow users to edit both title and content with basic formatting options (bold, italic, headings, lists, code blocks)
- Save edited content to localStorage with JSON serialization
- Implement discard changes confirmation dialog
- Make the modal responsive - full screen on mobile, modal format on desktop

### Reusability Opportunities
- Modal pattern and behavior from ProfileModal.tsx
- Integration points from SavedPromptList.tsx handleEditPrompt function
- ContextBlock structure understanding from ContextBlock.tsx
- Existing localStorage patterns from current saved prompts implementation

### Scope Boundaries
**In Scope:**
- Basic Tiptap editor integration with formatting toolbar
- Modal with editable title and content fields
- Save/cancel functionality with localStorage integration
- Responsive design (mobile full-screen, desktop modal)
- Confirmation dialogs for unsaved changes
- Basic content validation

**Out of Scope:**
- Tables, links, or image functionality
- Collaborative editing features
- Mentions (@) functionality
- Auto-save functionality
- "Save as new" functionality
- Character limits or content restrictions
- Advanced validation beyond basic structure checking

### Technical Considerations
- Integration with existing localStorage structure for saved prompts
- Responsive modal design following existing app patterns
- Tiptap editor integration with React
- Content structure validation before saving
- Escape key handling and focus management following ProfileModal patterns
- JSON serialization for localStorage storage