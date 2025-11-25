import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../markdownUtils';

// Note: htmlToMarkdown tests are skipped because they require DOM which causes issues in the test environment
// The markdownToHtml function is pure and doesn't require DOM, so we can test it directly

describe('markdownToHtml', () => {
  it('should convert headings to HTML', () => {
    const markdown = '# Title\n## Subtitle\n### Section';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>');
  });

  it('should convert empty lines to empty paragraphs', () => {
    const markdown = '\n\n';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<p></p><p></p><p></p>');
  });

  it('should convert unordered list items', () => {
    const markdown = '- Item 1\n- Item 2';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<li>Item 1</li><li>Item 2</li>');
  });

  it('should convert ordered list items', () => {
    const markdown = '1. First\n2. Second';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<li>First</li><li>Second</li>');
  });

  it('should convert regular text to paragraphs', () => {
    const markdown = 'This is a paragraph\nAnother paragraph';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<p>This is a paragraph</p><p>Another paragraph</p>');
  });

  it('should handle mixed content', () => {
    const markdown = '# Title\n\n- List item\n\nRegular text';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<h1>Title</h1><p></p><li>List item</li><p></p><p>Regular text</p>');
  });

  it('should handle empty input', () => {
    const result = markdownToHtml('');
    expect(result).toBe('');
  });

  it('should handle whitespace-only input', () => {
    const result = markdownToHtml('   \n  \n');
    expect(result).toBe('');
  });

  it('should preserve original line content for paragraphs', () => {
    const markdown = '  This line has spaces  ';
    const result = markdownToHtml(markdown);
    expect(result).toBe('<p>  This line has spaces  </p>');
  });
});