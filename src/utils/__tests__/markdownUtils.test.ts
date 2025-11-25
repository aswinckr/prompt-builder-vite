import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from '../markdownUtils';

describe('htmlToMarkdown', () => {
  it('should convert simple paragraphs to markdown', () => {
    const html = '<p>Hello world</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Hello world');
  });

  it('should convert bold and italic text', () => {
    const html = '<p>This is <strong>bold</strong> and <em>italic</em> text</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('This is **bold** and *italic* text');
  });

  it('should convert headings', () => {
    const html = '<h1>Title</h1><h2>Subtitle</h2>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('# Title\n\n## Subtitle');
  });

  it('should convert unordered lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('- Item 1\n- Item 2');
  });

  it('should convert ordered lists', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('1. First\n2. Second');
  });

  it('should convert code blocks', () => {
    const html = '<pre><code>console.log("hello");</code></pre>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('```\nconsole.log("hello");\n```');
  });

  it('should convert inline code', () => {
    const html = '<p>Use <code>console.log</code> for debugging</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Use `console.log` for debugging');
  });

  it('should convert blockquotes', () => {
    const html = '<blockquote>This is a quote</blockquote>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('> This is a quote');
  });

  it('should handle nested elements', () => {
    const html = '<p>This is <strong>bold <em>and italic</em></strong> text</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('This is **bold *and italic*** text');
  });

  it('should sanitize dangerous HTML', () => {
    const html = '<p onclick="alert(\'xss\')">Safe content</p><script>alert("xss")</script>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Safe content');
  });

  it('should handle empty input', () => {
    const result = htmlToMarkdown('');
    expect(result).toBe('');
  });

  it('should handle multiple line breaks', () => {
    const html = '<p>Line 1</p><br><p>Line 2</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Line 1\n\nLine 2');
  });

  it('should handle complex nested lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2 with <strong>bold</strong> text</li></ul>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('- Item 1\n- Item 2 with **bold** text');
  });

  it('should remove excessive whitespace', () => {
    const html = '<p>   Hello    world   </p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Hello world');
  });
});