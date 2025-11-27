/**
 * Tests for improved content detection logic
 * Task Group 2.1: Write 2-4 focused tests for improved content detection
 */

import {
  isHtmlContent,
  detectContentFormat,
  convertToHtml,
  validateContentCompatibility
} from '../utils/contentFormatUtils';

describe('Content Detection Logic Repair', () => {
  describe('isHtmlContent function', () => {
    test('should correctly identify HTML content with common elements', () => {
      // Valid HTML should be detected
      expect(isHtmlContent('<p>This is a paragraph</p>')).toBe(true);
      expect(isHtmlContent('<div>Content</div>')).toBe(true);
      expect(isHtmlContent('<strong>Bold text</strong>')).toBe(true);
      expect(isHtmlContent('<em>Italic text</em>')).toBe(true);
      expect(isHtmlContent('<h1>Header</h1>')).toBe(true);
      expect(isHtmlContent('<ul><li>Item</li></ul>')).toBe(true);
      expect(isHtmlContent('<br />')).toBe(true);
    });

    test('should reject plain text with angle brackets as HTML', () => {
      // Edge cases that should NOT be detected as HTML
      expect(isHtmlContent('Use {{variable}} in your prompt')).toBe(false);
      expect(isHtmlContent('This has < less than and > greater than symbols')).toBe(false);
      expect(isHtmlContent('Email: user@domain.com')).toBe(false);
      expect(isHtmlContent('Version 2.3.1 < 3.0.0')).toBe(false);
    });

    test('should handle malformed content gracefully', () => {
      // Malformed HTML or edge cases
      expect(isHtmlContent('<p>Unclosed paragraph')).toBe(true); // Still has HTML tag
      expect(isHtmlContent('Just text without tags')).toBe(false);
      expect(isHtmlContent('')).toBe(false);
      expect(isHtmlContent(null as any)).toBe(false);
      expect(isHtmlContent(undefined as any)).toBe(false);
    });
  });

  describe('detectContentFormat function', () => {
    test('should detect markdown content correctly', () => {
      const markdownContent = `# Title

This is **bold** and *italic* text.

## Lists
- Item 1
- Item 2

1. Numbered item
2. Another item

\`\`\`javascript
const code = 'example';
\`\`\``;

      const result = detectContentFormat(markdownContent);
      expect(result.format).toBe('markdown');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should handle mixed content appropriately', () => {
      const mixedContent = 'This has {{variables}} but not <real> HTML tags';
      const result = detectContentFormat(mixedContent);
      expect(result.format).toBe('plain-text');
      expect(result.issues).toContain('Contains angle brackets but not valid HTML');
    });

    test('should provide appropriate confidence scores', () => {
      // High confidence for clear cases
      expect(detectContentFormat('<p>Clear HTML</p>').confidence).toBeGreaterThan(0.8);
      expect(detectContentFormat('Just plain text').confidence).toBeGreaterThan(0.7);

      // Lower confidence for ambiguous cases
      const ambiguous = detectContentFormat('Text with < symbols');
      expect(ambiguous.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('convertToHtml function', () => {
    test('should preserve HTML content as-is', () => {
      const htmlContent = '<p><strong>Bold</strong> text</p>';
      const result = convertToHtml(htmlContent);
      expect(result.html).toBe(htmlContent);
      expect(result.format).toBe('html');
    });

    test('should convert markdown to HTML properly', () => {
      const markdown = '# Title\n\nThis is **bold** text.';
      const result = convertToHtml(markdown);
      expect(result.html).toContain('<h1>');
      expect(result.html).toContain('<strong>');
      expect(result.format).toBe('markdown');
    });

    test('should wrap plain text in paragraph tags', () => {
      const plainText = 'This is plain text content';
      const result = convertToHtml(plainText);
      expect(result.html).toBe('<p>This is plain text content</p>');
      expect(result.format).toBe('plain-text');
    });

    test('should handle multi-line plain text', () => {
      const multiLine = 'First line\nSecond line\nThird line';
      const result = convertToHtml(multiLine);
      expect(result.html).toContain('<p>First line</p>');
      expect(result.html).toContain('<p>Second line</p>');
      expect(result.html).toContain('<p>Third line</p>');
    });
  });

  describe('validateContentCompatibility function', () => {
    test('should validate compatible content formats', () => {
      const htmlContent = '<p>HTML content</p>';
      const result = validateContentCompatibility(htmlContent, 'html');
      expect(result.isCompatible).toBe(true);
      expect(result.recommendation).toContain('matches expected format');
    });

    test('should provide recommendations for incompatible formats', () => {
      const plainText = 'Plain text content';
      const result = validateContentCompatibility(plainText, 'html');
      expect(result.isCompatible).toBe(false);
      expect(result.recommendation).toContain('convert to HTML');
    });

    test('should handle edge cases gracefully', () => {
      const result = validateContentCompatibility('', 'html');
      expect(result.issues).toContain('Empty content');
    });
  });
});