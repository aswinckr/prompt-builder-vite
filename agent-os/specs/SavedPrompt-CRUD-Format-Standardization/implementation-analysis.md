# SavedPrompt CRUD Format Standardization - Implementation Analysis

## Current State Analysis

### Identified Issues

**1. EditPromptModal Content Detection Logic (Lines 48-58)**
```typescript
// PROBLEMATIC CODE
if (rawContent.includes('<')) {
  // Content is already HTML, use as-is
  processedContent = rawContent;
} else {
  // Content is plain text, convert to simple HTML for TipTapEditor
  processedContent = `<p>${rawContent}</p>`;
}
```
- Issue: Simple string-based detection is unreliable
- Problem: Plain text containing '<' characters (like "< 5 items") will be misidentified as HTML
- Impact: Content format corruption during edit operations

**2. Database Format Inconsistency**
- Database stores both legacy plain text and new HTML content
- No standardized format validation on save operations
- Mixed content creates unpredictable behavior across CRUD flows

**3. Display vs Edit Format Mismatch**
- ContextLibrary.handlePromptLoad converts HTML to text for prompt builder (correct)
- EditPromptModal assumes content format without proper validation
- CreatePromptModal properly saves HTML content (working correctly)

### Working Components

**1. CreatePromptModal (Lines 96, 45)**
```typescript
// CORRECT IMPLEMENTATION
const htmlContent = markdownToHtml(initialContent);
content: content.html, // Save as HTML to preserve formatting
```

**2. ContextLibrary.handlePromptLoad (Lines 185-187)**
```typescript
// CORRECT IMPLEMENTATION
const textContent = rawContent.includes('<') ? htmlToText(rawContent) : rawContent;
```

**3. TipTapEditor Component**
- Properly handles HTML content input and output
- Provides standardized content interface

## Implementation Requirements

### 1. Content Format Detection Utility

**Create a robust HTML detection function:**
```typescript
// src/utils/contentUtils.ts
export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Check for HTML tags using regex
  const htmlTagRegex = /<[^>]+>/;
  if (!htmlTagRegex.test(content)) {
    return false;
  }

  // Validate that it's actually structured HTML (not just text with < symbols)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    // Check if parsing resulted in actual HTML elements
    return doc.body.children.length > 0 ||
           content.includes('<p>') ||
           content.includes('<div>') ||
           content.includes('<h1>') ||
           content.includes('<strong>');
  } catch {
    return false;
  }
}
```

### 2. Enhanced Content Conversion

**Improve markdownUtils.ts:**
```typescript
// Enhanced markdownToHtml function
export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) {
    return '';
  }

  // Escape HTML-like characters that aren't meant to be HTML
  const escapedMarkdown = markdown
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return parseMarkdownToHtml(escapedMarkdown);
}

// Enhanced htmlToText with better error handling
export function htmlToText(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  } catch {
    // Fallback to simple tag removal
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  }
}
```

### 3. EditPromptModal Fixes

**Replace problematic content detection:**
```typescript
// In EditPromptModal.tsx, useEffect (lines 43-63)
useEffect(() => {
  if (prompt) {
    setTitle(prompt.title);
    setDescription(prompt.description || '');

    const rawContent = prompt.content || '';
    let processedContent = '';

    // Use robust HTML detection
    if (isHtmlContent(rawContent)) {
      processedContent = rawContent;
    } else {
      // Convert plain text to HTML for TipTapEditor
      processedContent = `<p>${rawContent.replace(/\n/g, '</p><p>')}</p>`;
    }

    setContent(processedContent);
    setOriginalContent(processedContent);
    setHasChanges(false);
  }
}, [prompt]);
```

### 4. Content Validation Middleware

**Add validation to PromptService:**
```typescript
// In PromptService.ts
export class PromptService {
  static async createPrompt(promptData: CreatePromptData): Promise<DatabaseResponse<Prompt>> {
    try {
      const user = await DatabaseService.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Validate and normalize content format
      const normalizedContent = await this.normalizeContentFormat(promptData.content);

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          title: promptData.title,
          description: promptData.description || null,
          content: normalizedContent,
          project_id: promptData.project_id || null,
          folder: promptData.folder || null,
          tags: promptData.tags || []
        })
        .select()
        .single();

      return await DatabaseService.handleResponse(
        DatabaseService.convertRow<Prompt>(data)
      );
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  private static async normalizeContentFormat(content: string): Promise<string> {
    if (isHtmlContent(content)) {
      return content;
    } else {
      return markdownToHtml(content);
    }
  }
}
```

### 5. Testing Strategy

**Unit Tests for Content Detection:**
```typescript
// src/utils/__tests__/contentUtils.test.ts
import { describe, it, expect } from 'vitest';
import { isHtmlContent } from '../contentUtils';

describe('isHtmlContent', () => {
  it('should detect HTML content correctly', () => {
    expect(isHtmlContent('<p>Hello world</p>')).toBe(true);
    expect(isHtmlContent('<div>Content</div>')).toBe(true);
    expect(isHtmlContent('<h1>Title</h1>')).toBe(true);
  });

  it('should reject plain text with < symbols', () => {
    expect(isHtmlContent('x < 5')).toBe(false);
    expect(isHtmlContent('Price: $<100')).toBe(false);
    expect(isHtmlContent('Hello < world')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isHtmlContent('')).toBe(false);
    expect(isHtmlContent(null as any)).toBe(false);
    expect(isHtmlContent(undefined as any)).toBe(false);
    expect(isHtmlContent('<invalid')).toBe(false);
  });
});
```

**Integration Tests for CRUD Workflow:**
```typescript
// src/test/SavedPromptFormatConsistency.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditPromptModal } from '../components/EditPromptModal';
import { CreatePromptModal } from '../components/CreatePromptModal';

describe('SavedPrompt Format Consistency', () => {
  it('should maintain format consistency through create->edit->save cycle', async () => {
    // Test that content remains properly formatted
    // through the complete CRUD workflow
  });

  it('should handle legacy plain text content correctly', async () => {
    // Test migration of plain text to HTML
  });

  it('should preserve formatting during updates', async () => {
    // Test that rich text formatting is preserved
  });
});
```

## Migration Strategy

### 1. Data Migration Script

**Create a migration utility for existing data:**
```typescript
// src/utils/migration.ts
export async function migrateLegacyPrompts() {
  // Query all prompts with plain text content
  // Convert to HTML format
  // Update database in batches
  // Log migration results
}
```

### 2. Gradual Migration Approach

1. **Phase 1**: Fix content detection and validation in UI components
2. **Phase 2**: Add content normalization to save operations
3. **Phase 3**: Run background migration for existing data
4. **Phase 4**: Remove legacy content handling after migration complete

### 3. Backward Compatibility

- Maintain support for plain text content during transition period
- Auto-migrate content when accessed
- Monitor migration progress and completion

## Success Criteria

1. **Format Consistency**: All new prompts are stored as HTML
2. **Backward Compatibility**: Existing plain text prompts work correctly
3. **Edit Reliability**: Edit operations preserve content format
4. **Display Accuracy**: All display contexts show content correctly
5. **Migration Success**: Legacy content properly converted to HTML
6. **Test Coverage**: Comprehensive tests covering all scenarios

## Risk Mitigation

1. **Data Loss Prevention**: Always backup before migration
2. **Gradual Rollout**: Test with small user groups first
3. **Rollback Plan**: Ability to revert changes if issues arise
4. **Monitoring**: Track content format issues in production
5. **User Communication**: Clear messaging about any required actions

## Performance Considerations

1. **Content Processing**: Optimize HTML parsing for large content
2. **Migration Batching**: Process legacy data in reasonable batches
3. **Caching**: Cache converted content where appropriate
4. **Lazy Loading**: Convert content only when needed

This implementation analysis provides a comprehensive roadmap for fixing the SavedPrompt CRUD format inconsistencies while ensuring data integrity and backward compatibility.