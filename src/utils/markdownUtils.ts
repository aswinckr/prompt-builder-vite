/**
 * Convert HTML content to markdown format
 * Handles common HTML elements and converts them to appropriate markdown syntax
 *
 * @module markdownUtils
 */

// Constants for HTML sanitization - prevent XSS attacks
const ALLOWED_HTML_TAGS = [
  'p', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'br', 'div', 'span'
];

const DANGEROUS_ATTRIBUTES = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];

/**
 * Sanitizes HTML content to prevent XSS attacks
 *
 * @description Removes dangerous attributes and disallowed HTML elements
 * Uses a whitelist approach for security
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for DOM manipulation
 *
 * @example
 * ```typescript
 * const unsafeHtml = '<div onclick="alert(\'xss\')">Safe content</div>';
 * const safeHtml = sanitizeHtml(unsafeHtml);
 * // Returns: '<div>Safe content</div>'
 * ```
 */
function sanitizeHtml(html: string): string {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove dangerous attributes from all elements
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_ELEMENT
  );

  let node = walker.currentNode as Element;
  while (node) {
    // Remove dangerous attributes
    DANGEROUS_ATTRIBUTES.forEach(attr => {
      if (node.hasAttribute(attr)) {
        node.removeAttribute(attr);
      }
    });

    // Remove elements that aren't in our allowed list
    if (!ALLOWED_HTML_TAGS.includes(node.tagName.toLowerCase())) {
      const parent = node.parentNode;
      if (parent) {
        parent.removeChild(node);
      }
    }

    node = walker.nextNode() as Element;
  }

  return tempDiv.innerHTML;
}

/**
 * Converts HTML content to Markdown format
 *
 * @description Transforms HTML elements into their Markdown equivalents
 * Handles headings, lists, formatting, code blocks, and more
 * Includes security sanitization to prevent XSS attacks
 *
 * @param html - HTML string to convert to Markdown
 * @returns Markdown-formatted string
 *
 * @example
 * ```typescript
 * const html = '<h1>Title</h1><p>This is <strong>bold</strong> text</p>';
 * const markdown = htmlToMarkdown(html);
 * // Returns: '# Title\n\nThis is **bold** text'
 * ```
 *
 * @supportedElements
 * - Headings: h1-h6 → # ######
 * - Text formatting: strong/b → **, em/i → *, u → __
 * - Lists: ul/ol → - / 1. 2.
 * - Code: code → `code`, pre → ```code```
 * - Quotes: blockquote → > text
 * - Line breaks: br → \n
 *
 * @securityInput is sanitized before processing to prevent XSS
 */
export function htmlToMarkdown(html: string): string {
  // Sanitize HTML first to prevent XSS
  const sanitizedHtml = sanitizeHtml(html);

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedHtml;

  let markdown = '';

  // Process each node recursively
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          return processChildren(element) + '\n\n';

        case 'strong':
        case 'b':
          return `**${processChildren(element)}**`;

        case 'em':
        case 'i':
          return `*${processChildren(element)}*`;

        case 'u':
          return `__${processChildren(element)}__`;

        case 'h1':
          return `# ${processChildren(element)}\n\n`;

        case 'h2':
          return `## ${processChildren(element)}\n\n`;

        case 'h3':
          return `### ${processChildren(element)}\n\n`;

        case 'h4':
          return `#### ${processChildren(element)}\n\n`;

        case 'h5':
          return `##### ${processChildren(element)}\n\n`;

        case 'h6':
          return `###### ${processChildren(element)}\n\n`;

        case 'ul':
          const ulItems = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'li');
          return ulItems.map(li => `- ${processChildren(li).trim()}`).join('\n') + '\n\n';

        case 'ol':
          const olItems = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'li');
          return olItems.map((li, index) => `${index + 1}. ${processChildren(li).trim()}`).join('\n') + '\n\n';

        case 'li':
          return processChildren(element);

        case 'code':
          return `\`${processChildren(element)}\``;

        case 'pre':
          return `\`\`\`\n${processChildren(element)}\n\`\`\`\n\n`;

        case 'blockquote':
          return `> ${processChildren(element).replace(/\n/g, '\n> ')}\n\n`;

        case 'br':
          return '\n';

        case 'div':
        case 'span':
        default:
          return processChildren(element);
      }
    }

    return '';
  };

  const processChildren = (element: Element): string => {
    return Array.from(element.childNodes).map(processNode).join('');
  };

  markdown = processNode(tempDiv);

  // Clean up extra whitespace and normalize newlines
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive newlines
    .replace(/[ \t]+/g, ' ')           // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/g, '')         // Trim leading/trailing whitespace
    .replace(/\n[ \t]+/g, '\n');       // Remove spaces at start of lines

  return markdown;
}