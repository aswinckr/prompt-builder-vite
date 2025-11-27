# SavedPrompt CRUD Format Fix Specification

## Overview
This specification addresses critical issues with content format handling in the SavedPrompt CRUD operations, specifically focusing on fixing content detection logic, ensuring consistent format handling across all operations, and preventing content corruption during edit-save cycles.

## Critical Issues Identified

1. **EditPromptModal Content Detection Logic Flaw**: Lines 48-58 in EditPromptModal.tsx contain incorrect logic that treats HTML content as plain text when checking for HTML tags using `includes('<')`. This is too simplistic and can misclassify content.

2. **Inconsistent Content Format Handling**:
   - CreatePromptModal correctly saves HTML content using `content.html`
   - EditPromptModal has flawed content initialization that may corrupt content
   - Database stores HTML content but editing flow makes wrong assumptions

3. **Content Corruption During Updates**: The update flow may corrupt content format during save operations due to improper format detection and conversion.

4. **Legacy Data Handling**: No graceful handling for legacy plain text content that may exist in the database.

## Current State Analysis

### Content Format Flow Issues
- **Insertion Flow**: Works correctly - converts markdown/text to HTML using `markdownToHtml()`
- **Update Flow**: Broken - has wrong assumptions about content format detection
- **Display Flow**: Mixed results - inconsistent handling of different content formats

### Key Problems
1. **Line 52 in EditPromptModal**: `if (rawContent.includes('<'))` is insufficient for HTML detection
2. **Line 57**: Simple `p` tag wrapping may not be appropriate for all content
3. **No validation**: Content format is not validated before processing
4. **No migration strategy**: Legacy plain text content is not properly handled

## Required Solutions

### 1. Content Detection Logic Repair
- Replace simplistic `includes('<')` detection with robust format detection
- Use `htmlToText` utility for accurate format assessment
- Add content validation before format conversion
- Handle edge cases and malformed content

### 2. CRUD Operations Standardization
- Ensure consistent HTML format handling across all operations
- Fix content initialization for different formats
- Prevent unwanted format conversions during updates
- Maintain content integrity throughout edit cycle

### 3. Enhanced Validation and Error Handling
- Add content format validation
- Implement comprehensive error handling
- Create content sanitization layer
- Provide clear error messages for format issues

### 4. Legacy Data Migration
- Create migration script for legacy plain text content
- Implement safe migration process with rollback capability
- Add migration progress tracking
- Maintain backward compatibility during transition

## Technical Requirements

### Content Format Classification System
- Define clear criteria for HTML vs plain text detection
- Establish content format validation rules
- Document expected format for each CRUD operation

### Enhanced Conversion Utilities
- Improve `markdownToHtml` for TipTapEditor compatibility
- Enhance `htmlToText` for accurate format detection
- Add error handling for conversion failures

### Validation Layer
- Server-side validation for content formats
- Client-side validation for immediate feedback
- Allowlist approach for allowed HTML elements
- Content sanitization to prevent XSS

## Success Criteria

1. **Content Detection Accuracy**: 100% accurate detection of HTML vs plain text content
2. **Zero Content Corruption**: No content corruption during CRUD operations
3. **Legacy Content Handling**: All legacy content handled gracefully
4. **Comprehensive Testing**: Full test coverage for critical workflows
5. **Documentation**: Complete documentation for maintenance and troubleshooting

## Risk Mitigation

- **Data Loss Prevention**: Always backup data before migration
- **Backward Compatibility**: Maintain support for legacy content during transition
- **Incremental Testing**: Test each component independently before integration
- **Rollback Planning**: Ensure ability to revert changes if issues arise
- **Performance Monitoring**: Monitor performance impact of new validation logic

## Dependencies

- TipTapEditor component compatibility
- markdownUtils.ts utility functions
- SavedPrompt data type definitions
- Existing CRUD API endpoints

## Implementation Notes

This specification focuses specifically on content format handling issues in SavedPrompt CRUD operations. The solution should maintain existing functionality while fixing the identified format detection and corruption issues.