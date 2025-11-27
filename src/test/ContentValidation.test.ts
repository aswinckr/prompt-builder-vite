/**
 * Tests for content format validation and error handling
 * Task Group 4.1: Write 2-4 focused tests for validation scenarios
 */

import {
  detectContentFormat,
  validateContentCompatibility,
  convertToHtml,
  ContentFormat
} from '../utils/contentFormatUtils';
import { htmlToMarkdown, markdownToHtml } from '../utils/markdownUtils';

describe('Content Format Validation', () => {
  describe('Content Format Validation', () => {
    test('should validate HTML content correctly', () => {
      const validHtml = '<p>This is <strong>valid</strong> HTML content with {{variable}}</p>';
      const invalidHtml = 'This is not HTML content';
      const xssHtml = '<p onclick="alert(\'xss\')">Click me</p>';

      const validResult = validateContentCompatibility(validHtml, 'html');
      const invalidResult = validateContentCompatibility(invalidHtml, 'html');
      const xssResult = validateContentCompatibility(xssHtml, 'html');

      expect(validResult.isCompatible).toBe(true);
      expect(invalidResult.isCompatible).toBe(false);
      expect(xssResult.isCompatible).toBe(true); // Still compatible after sanitization
      expect(xssResult.recommendation).toContain('matches expected format');
    });

    test('should provide specific validation issues for different content types', () => {
      const emptyContent = '';
      const whitespaceOnly = '   \n\t   ';
      const onlyVariables = '{{name}} {{email}}';

      const emptyResult = validateContentCompatibility(emptyContent, 'html');
      const whitespaceResult = validateContentCompatibility(whitespaceOnly, 'html');
      const variablesResult = validateContentCompatibility(onlyVariables, 'html');

      expect(emptyResult.issues).toContain('Empty content');
      expect(variablesResult.isCompatible).toBe(false);
      expect(variablesResult.recommendation).toContain('convert to HTML');
    });

    test('should handle edge cases gracefully', () => {
      const edgeCases = [
        null,
        undefined,
        123,
        {},
        []
      ];

      edgeCases.forEach(content => {
        const result = validateContentCompatibility(content as any, 'html');
        expect(result).toBeDefined();
        expect(typeof result.isCompatible).toBe('boolean');
        expect(Array.isArray(result.issues)).toBe(true);
        expect(typeof result.recommendation).toBe('string');
      });
    });
  });

  describe('Error Handling for Malformed Content', () => {
    test('should handle malformed HTML gracefully', () => {
      const malformedHtml = [
        '<p>Unclosed paragraph',
        '<div><span>Nested content</div></span>', // Improper nesting
        '<p><script>alert("xss")</script>Content</p>', // Dangerous content
        '<<<multiple>>>brackets<<<',
        'Content with <invalid-tag>unsupported HTML</invalid-tag>'
      ];

      malformedHtml.forEach(html => {
        // Should not throw errors
        expect(() => {
          const detection = detectContentFormat(html);
          expect(detection).toBeDefined();
          expect(detection.format).toBeDefined();
        }).not.toThrow();

        expect(() => {
          const conversion = convertToHtml(html);
          expect(conversion).toBeDefined();
          expect(conversion.html).toBeDefined();
        }).not.toThrow();
      });
    });

    test('should handle conversion errors with fallbacks', () => {
      const problematicContent = [
        null,
        undefined,
        '',
        '<<<<<>>>>>',
        '\0\0\0 Null bytes',
        'Content with \x00 null characters'
      ];

      problematicContent.forEach(content => {
        // Should not throw exceptions
        expect(() => {
          const result = convertToHtml(content as any);
          expect(result).toBeDefined();
        }).not.toThrow();

        expect(() => {
          const result = detectContentFormat(content as any);
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });

    test('should recover from validation failures', () => {
      const validContent = '<p>Valid content</p>';
      const invalidContent = '<script>alert("xss")</script>';

      const validResult = validateContentCompatibility(validContent, 'html');
      const invalidResult = validateContentCompatibility(invalidContent, 'html');

      // Valid content should pass
      expect(validResult.isCompatible).toBe(true);

      // Invalid content should provide recovery path
      expect(invalidResult.recommendation).toBeDefined();
      expect(invalidResult.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('Content Sanitization', () => {
    test('should sanitize dangerous HTML while preserving content', () => {
      const dangerousHtml = `
        <div onclick="alert('xss')" onload="malicious()">
          <p>This is <em>safe</em> content</p>
          <script>alert('xss')</script>
          <img src="x" onerror="alert('xss')">
          <iframe src="javascript:alert('xss')"></iframe>
          Safe content with {{variable}}
        </div>
      `;

      const result = convertToHtml(dangerousHtml);
      const detection = detectContentFormat(result.html);

      // Should preserve safe content
      expect(result.html).toContain('This is');
      expect(result.html).toContain('safe');
      expect(result.html).toContain('{{variable}}');

      // Should detect as HTML
      expect(detection.format).toBe('html');

      // Should remove dangerous elements
      expect(result.html).not.toContain('onclick');
      expect(result.html).not.toContain('onerror');
      expect(result.html).not.toContain('<script>');
      expect(result.html).not.toContain('<iframe>');
    });

    test('should preserve allowed HTML formatting', () => {
      const formattingHtml = `
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <blockquote>Quote content</blockquote>
        <code>inline code</code>
      `;

      const result = htmlToMarkdown(formattingHtml);

      // Should preserve formatting structure
      expect(result).toContain('# Title');
      expect(result).toContain('**bold**');
      expect(result).toContain('*italic*');
      expect(result).toContain('- List item');
      expect(result).toContain('> Quote content');
      expect(result).toContain('`inline code`');
    });
  });

  describe('Round-trip Conversion Validation', () => {
    test('should maintain content integrity through multiple conversions', () => {
      const originalContent = `# Test Prompt

This prompt contains **bold text**, *italic text*, and {{variable}} placeholders.

## Usage Instructions
1. First step
2. Second step

## Notes
- Important note
- Another note

Code example: \`console.log('hello')\``;

      // Convert markdown to HTML
      const htmlResult = markdownToHtml(originalContent);

      // Convert back to markdown
      const markdownResult = htmlToMarkdown(htmlResult);

      // Should preserve key elements
      expect(htmlResult).toContain('<h1>');
      expect(htmlResult).toContain('<strong>');
      expect(htmlResult).toContain('<em>');
      expect(htmlResult).toContain('<ol>');
      expect(htmlResult).toContain('<ul>');
      expect(htmlResult).toContain('{{variable}}');
      expect(htmlResult).toContain('<code>');

      expect(markdownResult).toContain('# Test Prompt');
      expect(markdownResult).toContain('**bold text**');
      expect(markdownResult).toContain('*italic text*');
      expect(markdownResult).toContain('{{variable}}');
      expect(markdownResult).toContain('console.log');
    });

    test('should handle variable placeholders through conversions', () => {
      const contentWithVars = `
        # Template for {{name}}

        Dear {{name}},

        Your email is {{email}} and your phone is {{phone}}.

        Best regards,
        {{sender}}
      `;

      const html = markdownToHtml(contentWithVars);
      const backToMarkdown = htmlToMarkdown(html);

      // Variables should be preserved
      const variables = ['{{name}}', '{{email}}', '{{phone}}', '{{sender}}'];
      variables.forEach(variable => {
        expect(html).toContain(variable);
        expect(backToMarkdown).toContain(variable);
      });
    });
  });
});