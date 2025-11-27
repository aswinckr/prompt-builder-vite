/**
 * Tests for CRUD format consistency
 * Task Group 3.1: Write 2-4 focused tests for CRUD format consistency
 */

import { convertToHtml, detectContentFormat, analyzeContentForStorage } from '../utils/contentFormatUtils';
import { markdownToHtml } from '../utils/markdownUtils';

describe('CRUD Format Consistency', () => {
  describe('Create Operation Format Handling', () => {
    test('should consistently convert markdown to HTML for storage', () => {
      const markdownContent = `# Test Prompt

This is **bold** and *italic* text with {{variable}}.

## Usage
- Use this for testing
- Format should be preserved`;

      const result = convertToHtml(markdownContent, 'markdown');
      const analysis = analyzeContentForStorage(result.html);

      // Should convert to proper HTML
      expect(result.html).toContain('<h1>');
      expect(result.html).toContain('<strong>');
      expect(result.html).toContain('<em>');
      expect(result.html).toContain('{{variable}}');

      // Should be ready for storage
      expect(analysis.storageFormat).toBe('html');
      expect(analysis.requiresMigration).toBe(false);
    });

    test('should handle plain text input correctly', () => {
      const plainText = 'This is a simple prompt template for {{name}} to use.';

      const result = convertToHtml(plainText, 'plain-text');
      const analysis = analyzeContentForStorage(result.html);

      // Should wrap in paragraph tags
      expect(result.html).toBe('<p>This is a simple prompt template for {{name}} to use.</p>');
      expect(analysis.originalFormat).toBe('plain-text');
      expect(analysis.storageFormat).toBe('html');
    });
  });

  describe('Read Operation Format Preservation', () => {
    test('should preserve HTML format when reading from database', () => {
      const storedHtml = '<p>Existing <strong>HTML</strong> content with {{variable}}</p>';

      const detection = detectContentFormat(storedHtml);
      const analysis = analyzeContentForStorage(storedHtml);

      // Should be detected as HTML
      expect(detection.format).toBe('html');
      expect(detection.confidence).toBeGreaterThan(0.8);

      // Should not require conversion
      expect(analysis.originalFormat).toBe('html');
      expect(analysis.requiresMigration).toBe(false);
    });

    test('should handle legacy plain text when reading from database', () => {
      const legacyText = 'Legacy plain text prompt with {{placeholder}}';

      const detection = detectContentFormat(legacyText);
      const conversion = convertToHtml(legacyText);

      // Should detect as plain text but convert properly
      expect(detection.format).toBe('plain-text');
      expect(conversion.html).toBe('<p>Legacy plain text prompt with {{placeholder}}</p>');
    });
  });

  describe('Update Operation Format Integrity', () => {
    test('should maintain HTML format through edit cycle', () => {
      const originalHtml = '<p>Original <em>content</em> with {{var}}</p>';

      // Simulate edit cycle
      const detection1 = detectContentFormat(originalHtml);
      const conversion1 = convertToHtml(originalHtml);

      // Simulate TipTapEditor output (should be HTML)
      const editedHtml = '<p>Modified <strong>content</strong> with {{var}}</p>';
      const detection2 = detectContentFormat(editedHtml);
      const conversion2 = convertToHtml(editedHtml);

      // Both should be valid HTML
      expect(detection1.format).toBe('html');
      expect(detection2.format).toBe('html');
      expect(conversion1.format).toBe('html');
      expect(conversion2.format).toBe('html');
    });

    test('should handle content with mixed formatting correctly', () => {
      const mixedContent = `# Header
Paragraph with **bold** and {{variable}}.
Another paragraph with <span class="custom">inline HTML</span>.`;

      const conversion = convertToHtml(mixedContent);
      const detection = detectContentFormat(conversion.html);

      // Should handle markdown conversion but preserve inline HTML where appropriate
      expect(conversion.html).toContain('<h1>');
      expect(conversion.html).toContain('<strong>');
      expect(detection.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Cross-Operation Consistency', () => {
    test('should maintain consistent format across all CRUD operations', () => {
      // Test the full cycle: Create -> Read -> Update -> Read
      const initialMarkdown = `# Test Prompt

This content has **formatting** and {{variables}}.`;

      // Create: Convert markdown to HTML for storage
      const createResult = convertToHtml(initialMarkdown);
      expect(createResult.format).toBe('markdown');

      // Read: Detect HTML format from storage
      const readDetection = detectContentFormat(createResult.html);
      expect(readDetection.format).toBe('html');

      // Update: Simulate edit and maintain HTML
      const editedHtml = createResult.html.replace('formatting', '<em>formatting</em>');
      const updateDetection = detectContentFormat(editedHtml);
      expect(updateDetection.format).toBe('html');

      // Read again: Should still be HTML
      const finalDetection = detectContentFormat(editedHtml);
      expect(finalDetection.format).toBe('html');
    });

    test('should preserve placeholder variables through format conversions', () => {
      const contentWithVars = 'Use {{name}} and {{email}} in this template.';

      const conversion = convertToHtml(contentWithVars);

      // Variables should be preserved
      expect(conversion.html).toContain('{{name}}');
      expect(conversion.html).toContain('{{email}}');
      expect(conversion.html).toContain('<p>');
    });
  });
});