# Specification: SavedPrompt CRUD Operations with Consistent HTML Formatting

## Goal
Ensure all CRUD operations for SavedPrompts maintain consistent HTML content formatting throughout the application, eliminating format mismatches between database storage and UI display/editing flows.

## User Stories
- As a user, I want my saved prompts to maintain consistent formatting when I create, edit, and load them
- As a user, I want rich text formatting to be preserved when editing saved prompts
- As a developer, I want predictable content format handling across all CRUD operations to prevent data corruption

## Specific Requirements

**Content Format Standardization**
- All prompt content MUST be stored as HTML in the database
- TipTapEditor requires HTML content for proper initialization and editing
- Display contexts (like prompt builder) require plain text content
- Content conversion functions MUST handle HTML to text transformation safely
- Legacy plain text content MUST be automatically migrated to HTML format

**Create Operations**
- CreatePromptModal MUST save content as HTML using TipTapEditor's html output
- Insertion flow MUST convert markdown/plain text to HTML before database storage
- Content validation MUST ensure HTML format before database operations
- markdownToHtml utility MUST be used for initial content conversion

**Read Operations**
- Database queries MUST return HTML content format
- ContextLibrary.handlePromptLoad MUST convert HTML to plain text for prompt builder
- Display components MUST use htmlToText utility for showing content previews
- TipTapEditor MUST receive HTML content directly for editing

**Update Operations**
- EditPromptModal MUST detect and handle both HTML and legacy plain content
- Content detection logic MUST use proper HTML validation (not just '<' character check)
- Save operations MUST preserve TipTapEditor's HTML output format
- Original content comparison MUST account for normalized HTML format

**Delete Operations**
- Delete operations must not be affected by content format
- Cascading deletes should handle both HTML and legacy content appropriately

**TipTapEditor Integration**
- Editor initialization MUST receive HTML content string
- Editor content updates MUST provide HTML, JSON, and text formats
- Content change detection MUST compare HTML output properly
- Editor focus and blur states must not affect content format

**Format Conversion Utilities**
- htmlToText MUST safely extract plain text from HTML content
- markdownToHtml MUST convert markdown to proper HTML structure
- Content validation MUST distinguish between HTML and plain text accurately
- All conversion functions MUST handle edge cases and malformed input

**Error Handling and Validation**
- Database operations MUST validate content format before storage
- Conversion functions MUST handle malformed HTML gracefully
- Error messages MUST clearly indicate format-related issues
- Failed operations MUST not corrupt existing content format

**Data Migration Strategy**
- Legacy plain text prompts MUST be auto-migrated to HTML on first edit
- Migration logic MUST preserve content integrity during conversion
- Batch migration utilities SHOULD be provided for existing data
- Migration status SHOULD be tracked to prevent duplicate conversions

**Testing Requirements**
- Unit tests for all format conversion utilities with edge cases
- Integration tests for complete CRUD workflows with format validation
- Migration tests for legacy content handling
- Performance tests for large content handling with conversion operations

## Existing Code to Leverage

**markdownUtils.ts - Format Conversion Functions**
- htmlToText function extracts plain text from HTML content safely
- markdownToHtml function converts markdown to HTML structure
- sanitizeHtml function prevents XSS attacks in HTML content
- These utilities should be standardized across all content operations

**TipTapEditor Component**
- Already properly handles HTML content input/output
- Provides standardized content interface with html, json, and text formats
- Should be the single source of truth for HTML content generation

**PromptService - Database Operations**
- createPrompt and updatePrompt methods handle content storage
- Should enforce HTML format validation before database operations
- Content field must accept HTML format consistently

**LibraryContext Update Logic**
- updateSavedPrompt function refreshes data after database updates
- Should maintain format consistency during state updates
- No optimistic updates to prevent format mismatch issues

## Out of Scope
- Complete redesign of the TipTapEditor component
- Database schema changes for content field
- Real-time collaborative editing features
- Advanced HTML sanitization beyond current implementation
- Content versioning or history tracking
- Bulk content migration scripts
- Performance optimizations for very large content
- Content format validation middleware
- HTML content compression or optimization
- Import/export functionality for different formats
- Content preview generation optimizations
- Custom HTML elements beyond standard TipTap features