# Specification: Context Dropdown Feature

## Goal
Enhance the "+ Add Context" button functionality by replacing direct navigation with a dropdown menu offering two options: adding inline text blocks with TipTap editor or navigating to the knowledge library.

## User Stories
- As a prompt builder user, I want to quickly add temporary text context without leaving the prompt page so that I can work more efficiently
- As a prompt builder user, I want to access my knowledge library for saved context so that I can reuse my existing resources
- As a prompt builder user, I want to organize and manage multiple context blocks through drag-and-drop so that I can structure my prompts optimally

## Specific Requirements

**Dropdown Menu Implementation**
- Replace current "+ Add Context" buttons with dropdown menu using shadcn component library
- Two menu options: "Add Text Block" and "Add Knowledge"
- Dropdown triggers on button click with keyboard and mouse support
- Menu appears positioned below and aligned to left of button
- Closes on option selection or click outside menu

**Text Block Creation**
- Silent creation of new temporary text blocks when "Add Text Block" selected
- Auto-focus on newly created TipTap editor upon creation
- Unique ID generation for each text block following existing UUID pattern
- Initial placeholder content "Start typing your context here..."
- Minimum 200px height for editor area
- Full TipTap functionality including toolbar with formatting options

**Text Block Management**
- Drag and drop reordering using existing React DnD implementation
- Expand/collapse functionality matching existing context blocks
- Delete capability with confirmation-free removal
- Multiple text blocks support within same prompt
- Visual distinction from library-sourced blocks (different icon or badge)

**TipTap Editor Integration**
- Use existing TipTapEditor component from `/src/components/TipTapEditor.tsx`
- Full formatting toolbar (bold, italic, lists, code blocks, etc.)
- Placeholder text support
- Real-time content updates saved to context state
- Proper styling integration with existing theme (neutral color scheme)

**Knowledge Library Integration**
- "Add Knowledge" option maintains current navigation behavior to `/knowledge`
- No changes to existing knowledge library functionality
- Maintains current user flow for selecting saved context blocks

**State Management**
- Extend existing LibraryContext to handle temporary text blocks
- New context block type flag: `isTemporary: true`
- Auto-add new text blocks to prompt builder block order
- Persistence in local state (no database saving for temporary blocks)
- Integration with existing prompt builder state management

**Responsive Design**
- Dropdown menu works on mobile and desktop viewports
- TipTap editor responsive sizing
- Touch-friendly interaction patterns for mobile devices
- Consistent with existing mobile-optimized UI patterns

## Visual Design

**No visual assets provided** - Implementation should follow existing UI patterns:
- Use neutral color scheme (neutral-800, neutral-700, neutral-600)
- Maintain existing button styling and hover states
- Dropdown should use standard shadcn dropdown appearance
- Text blocks should match existing context block visual design

## Existing Code to Leverage

**PromptBuilderBlockList Component**
- Located at `/src/components/PromptBuilderBlockList.tsx`
- Contains current "+ Add Context" button implementation (lines 42-67)
- Already uses React DnD for drag and drop functionality
- Has existing state management through LibraryContext hooks

**TipTapEditor Component**
- Located at `/src/components/TipTapEditor.tsx`
- Full-featured editor with toolbar integration
- Uses existing TipTapToolbar component
- Already integrated with neutral theme styling
- Supports content updates via onUpdate prop

**LibraryContext State Management**
- Located at `/src/contexts/LibraryContext.tsx`
- Already manages context blocks with CRUD operations
- Has prompt builder block ordering system
- Supports both temporary and permanent context blocks
- Uses useLibraryState and useLibraryActions hooks

**ContextBlock Type Definition**
- Located at `/src/types/ContextBlock.ts`
- Defines structure for context blocks with id, title, content, tags
- Can be extended with `isTemporary` boolean field
- Already integrates with project and user management

**React DnD Integration**
- Already implemented in PromptBuilderBlock components
- Supports drag and drop reordering functionality
- Can be reused for new text block management

## Out of Scope
- Adding new dropdown menu components beyond shadcn library
- Creating persistent storage for temporary text blocks in database
- Implementing new text formatting features beyond existing TipTap capabilities
- Modifying the existing knowledge library functionality
- Adding collaborative editing features
- Implementing text block templates or presets
- Creating advanced text block search or filtering
- Adding text block export functionality
- Implementing text block versioning or history
- Creating text block sharing capabilities
- Adding text block analytics or usage tracking