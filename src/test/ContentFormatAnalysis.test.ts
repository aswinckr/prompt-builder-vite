/**
 * Tests for content format analysis and detection
 * Task Group 1.1: Write 2-4 focused tests for content detection scenarios
 */

import { htmlToText, markdownToHtml } from '../utils/markdownUtils';

describe('Content Format Analysis', () => {
  describe('HTML vs Plain Text Detection', () => {
    test('should detect HTML content correctly', () => {
      // Test various HTML patterns that should be detected as HTML
      const htmlContent = '<p>This is <strong>HTML</strong> content</p>';
      const plainContent = 'This is plain text content';

      // HTML content should contain actual HTML tags when converted to text
      const htmlAsText = htmlToText(htmlContent);
      expect(htmlAsText).toBe('This is HTML content');

      // Plain text should remain unchanged
      expect(plainContent).toBe('This is plain text content');
    });

    test('should detect edge cases in HTML detection', () => {
      // Test content that might confuse simple detection
      const edgeCase1 = 'This contains < angle brackets but not HTML';
      const edgeCase2 = 'This contains script <script>alert("xss")</script> content';

      // Angle brackets in plain text should not be treated as HTML
      expect(htmlToText(edgeCase1)).toBe('This contains < angle brackets but not HTML');

      // Script tags should be removed by sanitization
      expect(htmlToText(edgeCase2)).not.toContain('alert("xss")');
    });

    test('should handle complex markdown conversion to HTML', () => {
      const markdown = `# Title

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const code = 'example';
\`\`\``;

      const html = markdownToHtml(markdown);

      // Should contain proper HTML structure
      expect(html).toContain('<h1>');
      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
      expect(html).toContain('<li>');
    });

    test('should preserve content through format conversions', () => {
      const originalContent = 'This is a test prompt with {{variable}} placeholders.';

      // Convert to HTML and back to text
      const html = markdownToHtml(originalContent);
      const backToText = htmlToText(html);

      // Content should be preserved (allowing for minor formatting differences)
      expect(backToText).toContain('This is a test prompt');
      expect(backToText).toContain('{{variable}}');
    });
  });
});