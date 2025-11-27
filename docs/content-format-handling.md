# Content Format Handling Documentation

## Overview

This document provides comprehensive documentation for content format handling in the Prompt Builder application, including format detection, validation, migration, and troubleshooting guidelines.

## Table of Contents

1. [Content Format Standards](#content-format-standards)
2. [CRUD Operations Format Specifications](#crud-operations-format-specifications)
3. [Format Detection and Validation](#format-detection-and-validation)
4. [Content Migration](#content-migration)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [API Specifications](#api-specifications)

## Content Format Standards

### Supported Formats

| Format | Description | Use Case | Storage Format |
|--------|-------------|----------|----------------|
| **HTML** | Structured content with HTML tags | Primary storage format, rich text editing | Stored as-is |
| **Markdown** | Text-based formatting syntax | User input, simple content editing | Converted to HTML |
| **Plain Text** | Unformatted text content | Legacy data, simple prompts | Converted to HTML |
| **Mixed** | Combination of formats | Edge cases, complex content | Normalized to HTML |

### Format Classification Rules

#### HTML Detection Criteria
Content is classified as HTML when it meets ALL of these criteria:
1. Contains valid HTML tag patterns: `<p>`, `<div>`, `<strong>`, `<em>`, `<h1>-<h6>`, `<ul>`, `<ol>`, `<li>`, `<span>`, `<br>`
2. Has balanced opening and closing tags (except self-closing tags)
3. Contains substantial text content (>30% of total content)
4. Passes security validation (no dangerous elements)

#### Markdown Detection Criteria
Content is classified as Markdown when it meets at least 2 of these patterns:
1. Headers: `# `, `## `, `### `, etc.
2. Lists: `* `, `- `, `1. `, `2. `, etc.
3. Inline formatting: `**bold**`, `*italic*`, `__underline__`
4. Code blocks: `````code````, `` `inline code` ``
5. Links: `[text](url)`

#### Plain Text Detection Criteria
Content is classified as Plain Text when:
1. No HTML or Markdown patterns detected
2. Contains angle brackets but not valid HTML (e.g., `{{variables}}`, `< symbols`)
3. Simple text content with variable placeholders

## CRUD Operations Format Specifications

### Create Operation
```typescript
// Input: User-provided content (any format)
// Process: Convert to HTML for storage
// Output: HTML format stored in database

const userInput = markdownText || plainText || htmlContent;
const processedContent = convertToHtml(userInput);
// Store: processedContent.html
```

**Example:**
```typescript
// User inputs markdown
const markdown = `# My Prompt
This is **bold** text with {{variable}}.`;

// Converted to HTML for storage
const html = markdownToHtml(markdown);
// Result: "<h1>My Prompt</h1><p>This is <strong>bold</strong> text with {{variable}}.</p>"
```

### Read Operation
```typescript
// Input: HTML content from database
// Process: Detect format, validate, prepare for editor
// Output: HTML content for TipTapEditor

const storedContent = prompt.content; // Always HTML
const validation = validateContentCompatibility(storedContent, 'html');
// Use in TipTapEditor: storedContent (validated HTML)
```

### Update Operation
```typescript
// Input: HTML content from TipTapEditor
// Process: Validate, sanitize, store as HTML
// Output: Validated HTML in database

const editorOutput = tipTapEditor.getHTML();
const validation = validateContentForStorage(editorOutput);
// Store: validation.sanitizedContent || editorOutput
```

### Delete Operation
```typescript
// No content format considerations
// Simple record deletion
```

## Format Detection and Validation

### Core Detection Functions

#### `isHtmlContent(content: string): boolean`
Detects if content is valid HTML using pattern matching and structure validation.

```typescript
// Returns true for:
isHtmlContent('<p>This is HTML</p>');           // true
isHtmlContent('<div><strong>Bold</strong></div>'); // true

// Returns false for:
isHtmlContent('This is plain text');            // false
isHtmlContent('Use {{variable}} here');         // false
isHtmlContent('Version 1.0 < 2.0');             // false
```

#### `detectContentFormat(content: string): ContentFormatValidation`
Comprehensive format detection with confidence scoring and issue reporting.

```typescript
interface ContentFormatValidation {
  format: 'html' | 'plain-text' | 'markdown' | 'mixed' | 'unknown';
  confidence: number; // 0-1 scale
  issues: string[];
  isSanitized: boolean;
}

const result = detectContentFormat('**Bold** text');
// Returns: { format: 'markdown', confidence: 0.8, issues: [], isSanitized: true }
```

#### `convertToHtml(content: string, format?: ContentFormat): ConversionResult`
Converts any content format to standardized HTML for storage.

```typescript
const result = convertToHtml('# Title\n\nContent with **bold**');
// Returns: {
//   html: '<h1>Title</h1><p>Content with <strong>bold</strong></p>',
//   format: 'markdown',
//   validationResult: { ... }
// }
```

### Validation Layers

#### Client-Side Validation (Immediate Feedback)
- Format compatibility checking
- Content length validation
- Character encoding validation
- Real-time error reporting

#### Server-Side Validation (Storage Security)
- XSS prevention and sanitization
- HTML structure validation
- Variable placeholder validation
- Content size limits

#### Storage Validation (Data Integrity)
- Format consistency checks
- Content preservation validation
- Migration requirement detection

## Content Migration

### Migration Strategy

#### 1. Identification
```typescript
// Find prompts needing migration
const promptsNeedingMigration = identifyPromptsForMigration(allPrompts);
```

#### 2. Backup Creation
```typescript
// Create backup before migration
const backupData = createMigrationBackup(promptsToMigrate);
// Store backup securely with timestamp
```

#### 3. Batch Processing
```typescript
// Process in configurable batches
const migrationConfig = {
  batchSize: 50,
  maxRetries: 3,
  enableBackup: true,
  dryRun: false,
  contentValidation: true
};

const { results, status } = await migratePromptBatch(promptsToMigrate, migrationConfig);
```

#### 4. Validation
```typescript
// Validate migration integrity
const validation = validateMigrationIntegrity(originalPrompts, migrationResults);
```

#### 5. Rollback (if needed)
```typescript
// Rollback from backup if issues detected
if (!validation.isValid) {
  const restoredPrompts = rollbackMigration(backupData);
}
```

### Migration Scenarios

#### Plain Text → HTML
```typescript
// Input: "Simple prompt with {{variable}}"
// Output: "<p>Simple prompt with {{variable}}</p>"
```

#### Markdown → HTML
```typescript
// Input: "# Title\n\nContent with **bold** text"
// Output: "<h1>Title</h1><p>Content with <strong>bold</strong> text</p>"
```

#### Mixed Format → Normalized HTML
```typescript
// Input: "Text with {{vars}} and <em>some HTML</em>"
// Output: "<p>Text with {{vars}} and <em>some HTML</em></p>"
```

### Migration Monitoring

#### Progress Tracking
```typescript
interface MigrationStatus {
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
  inProgress: number;
}
```

#### Error Reporting
- Individual prompt migration errors
- Batch processing failures
- Content integrity issues
- Rollback status

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Content Format Detection Failure
**Symptoms:**
- Content misclassified as wrong format
- Low confidence scores (< 0.5)
- Unexpected format conversions

**Solutions:**
1. Check content for mixed format patterns
2. Validate HTML tag structure
3. Review variable placeholder syntax
4. Use `detectContentFormat()` to diagnose

```typescript
const diagnosis = detectContentFormat(problematicContent);
console.log(`Format: ${diagnosis.format}, Confidence: ${diagnosis.confidence}`);
console.log(`Issues: ${diagnosis.issues.join(', ')}`);
```

#### Issue: Content Corruption During Conversion
**Symptoms:**
- Lost content after format conversion
- Missing variable placeholders
- Malformed HTML output

**Solutions:**
1. Validate input content before conversion
2. Check conversion utilities error handling
3. Verify variable preservation
4. Use content integrity validation

```typescript
const result = convertToHtml(content);
const integrity = validateContentIntegrity(content, result.html);
if (!integrity.preserved) {
  console.warn('Content integrity issues detected:', integrity.issues);
}
```

#### Issue: Migration Failures
**Symptoms:**
- Batch migration stopping mid-process
- High failure rates
- Rollback not working

**Solutions:**
1. Reduce batch size
2. Check database connection stability
3. Validate input content before migration
4. Monitor migration logs

```typescript
// Use smaller batches for problematic content
const safeConfig = { ...migrationConfig, batchSize: 10 };
const result = await migratePromptBatch(problematicPrompts, safeConfig);
```

#### Issue: TipTapEditor Compatibility
**Symptoms:**
- Editor not displaying content correctly
- Format changes during editing
- Save operation failing

**Solutions:**
1. Ensure HTML is properly sanitized
2. Validate HTML structure before editor initialization
3. Use proper content initialization

```typescript
// Validate content for TipTapEditor
const editorValidation = validateContentForEditor(htmlContent, 'html');
if (!editorValidation.isValid) {
  const sanitized = sanitizeHtmlForEditor(htmlContent);
  // Use sanitized content in editor
}
```

### Debugging Tools

#### Content Analysis
```typescript
const analysis = analyzeContentForStorage(content);
console.log('Original Format:', analysis.originalFormat);
console.log('Requires Migration:', analysis.requiresMigration);
console.log('Conversion Notes:', analysis.conversionNotes);
```

#### Step-by-Step Conversion
```typescript
// Debug conversion process
const detection = detectContentFormat(content);
const conversion = convertToHtml(content, detection.format);
const validation = validateContentForStorage(conversion.html);
console.log('Detection:', detection);
console.log('Conversion:', conversion);
console.log('Validation:', validation);
```

### Performance Optimization

#### Large Content Handling
- Process content in chunks
- Use streaming for very large content
- Implement content size limits
- Monitor memory usage during migration

#### Batch Processing
- Configure appropriate batch sizes (50-100 prompts)
- Add delays between batches to prevent database overload
- Implement retry logic for failed batches
- Monitor database performance during migration

## API Specifications

### Content Format Detection API

```typescript
/**
 * Detect content format with confidence scoring
 * GET /api/content/detect
 *
 * @param {string} content - Content to analyze
 * @returns {ContentFormatValidation} Format detection result
 */
```

### Content Conversion API

```typescript
/**
 * Convert content to HTML format
 * POST /api/content/convert
 *
 * @param {string} content - Source content
 * @param {ContentFormat} format - Source format (optional)
 * @returns {ConversionResult} Converted content with metadata
 */
```

### Content Validation API

```typescript
/**
 * Validate content format and security
 * POST /api/content/validate
 *
 * @param {string} content - Content to validate
 * @param {ContentFormat} expectedFormat - Expected format
 * @returns {ValidationResult} Validation result with issues
 */
```

### Migration API

```typescript
/**
 * Get migration status and recommendations
 * GET /api/migration/status
 * @returns {MigrationStatus} Current migration status
 */

/**
 * Start content migration process
 * POST /api/migration/start
 * @param {MigrationConfig} config - Migration configuration
 * @returns {MigrationJob} Migration job identifier
 */

/**
 * Get migration results and report
 * GET /api/migration/results/:jobId
 * @returns {MigrationReport} Detailed migration results
 */
```

## Security Considerations

### XSS Prevention
- Sanitize all HTML content before storage
- Remove dangerous attributes (onclick, onload, etc.)
- Use allowlist approach for allowed HTML elements
- Validate and escape variable placeholders

### Content Validation
- Validate HTML structure before processing
- Check for malformed or malicious content
- Implement size limits to prevent DoS attacks
- Use content security headers for rendered content

### Migration Security
- Create backups before any migration
- Validate migration integrity before finalizing
- Implement rollback capabilities
- Audit all migration operations

## Best Practices

### Content Handling
1. **Always validate content format** before processing
2. **Preserve variable placeholders** during all conversions
3. **Use appropriate conversion utilities** for each format type
4. **Implement comprehensive error handling** for edge cases
5. **Test content integrity** through conversion cycles

### Migration Planning
1. **Create complete backups** before any migration
2. **Test migrations on subset** of data first
3. **Monitor migration progress** and error rates
4. **Validate content integrity** after migration
5. **Keep rollback plans** ready for immediate use

### Performance Optimization
1. **Process content in batches** for large datasets
2. **Implement appropriate caching** for conversion results
3. **Monitor memory usage** during intensive operations
4. **Use streaming** for very large content processing
5. **Optimize database queries** for content retrieval

### Error Handling
1. **Provide clear error messages** for format issues
2. **Implement fallback mechanisms** for conversion failures
3. **Log all migration operations** for auditing
4. **Create user-friendly feedback** for validation issues
5. **Document common issues** and resolution procedures

## Testing Guidelines

### Unit Testing
- Test all format detection functions with edge cases
- Validate content conversion utilities with various input types
- Test error handling and fallback mechanisms
- Verify variable placeholder preservation

### Integration Testing
- Test complete CRUD workflows with different content formats
- Validate editor compatibility with converted content
- Test migration processes with realistic data
- Verify rollback functionality

### Performance Testing
- Test with large content datasets
- Measure memory usage during migrations
- Validate batch processing performance
- Test system behavior under load

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11-27 | Initial implementation of content format handling system |
| 1.1.0 | TBD | Enhanced validation and error handling |
| 1.2.0 | TBD | Migration tooling and monitoring |

---

For support and questions about content format handling, please refer to the troubleshooting guide above or contact the development team.