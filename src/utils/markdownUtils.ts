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
export function sanitizeHtml(html: string): string {
  try {
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
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return empty string if sanitization fails
    return '';
  }
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
  try {
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
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    // Return original content as fallback
    return html;
  }
}

/**
 * Extracts plain text from HTML content
 *
 * @description Removes HTML tags and returns plain text content
 * Preserves line breaks and basic text structure
 *
 * @param html - HTML string to convert to plain text
 * @returns Plain text string
 *
 * @example
 * ```typescript
 * const html = '<p>This is <strong>bold</strong> text</p><p>Second paragraph</p>';
 * const text = htmlToText(html);
 * // Returns: 'This is bold text\n\nSecond paragraph'
 * ```
 */
export function htmlToText(html: string): string {
  try {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    return tempDiv.textContent || tempDiv.innerText || '';
  } catch (error) {
    console.error('Error converting HTML to text:', error);
    // Return original content as fallback
    return html;
  }
}

/**
 * Enhanced Markdown to HTML converter with better TipTapEditor compatibility
 *
 * @description Transforms Markdown elements into their HTML equivalents
 * Handles headings, lists, paragraphs, and inline text formatting
 * Enhanced for better TipTapEditor compatibility with proper list handling
 * Includes error handling for malformed input
 *
 * @param markdown - Markdown string to convert to HTML
 * @returns HTML-formatted string
 *
 * @example
 * ```typescript
 * const markdown = '# Title\n\nThis is a paragraph with **bold** text';
 * const html = markdownToHtml(markdown);
 * // Returns: '<h1>Title</h1><p>This is a paragraph with <strong>bold</strong> text</p>'
 * ```
 *
 * @supportedElements
 * - Headings: # ###### → h1-h6
 * - Lists: - / 1. → proper list structure with ul/ol wrappers
 * - Inline formatting: ** → strong, * → em, __ → u
 * - Code: ` → code, ``` → pre
 * - Empty lines: → <p></p>
 * - Regular text: → <p>text</p>
 */
export function markdownToHtml(markdown: string): string {
  try {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    if (!markdown.trim()) {
      return '';
    }

    const lines = markdown.split('\n');
    const htmlLines: string[] = [];
    let currentList: { type: 'ul' | 'ol' | null; items: string[] } = { type: null, items: [] };

    const processInlineFormatting = (text: string): string => {
      return text
        // Bold: **text** → <strong>text</strong>
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic: *text* → <em>text</em> (not already bold)
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
        // Underline: __text__ → <u>text</u>
        .replace(/__([^_]+)__/g, '<u>$1</u>')
        // Inline code: `code` → <code>code</code>
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    };

    const closeCurrentList = () => {
      if (currentList.type && currentList.items.length > 0) {
        const listTag = currentList.type;
        const listItems = currentList.items.map(item => `<li>${processInlineFormatting(item)}</li>`).join('');
        htmlLines.push(`<${listTag}>${listItems}</${listTag}>`);
        currentList = { type: null, items: [] };
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle code blocks (```language
      if (trimmedLine.startsWith('```')) {
        closeCurrentList();

        // Find the end of the code block
        let codeContent = '';
        let endIndex = i + 1;
        while (endIndex < lines.length && !lines[endIndex].trim().startsWith('```')) {
          codeContent += lines[endIndex] + '\n';
          endIndex++;
        }

        htmlLines.push(`<pre><code>${codeContent.trim()}</code></pre>`);
        i = endIndex; // Skip to end of code block
        continue;
      }

      // Handle headings
      if (trimmedLine.startsWith('# ')) {
        closeCurrentList();
        htmlLines.push(`<h1>${processInlineFormatting(trimmedLine.substring(2))}</h1>`);
        continue;
      }
      if (trimmedLine.startsWith('## ')) {
        closeCurrentList();
        htmlLines.push(`<h2>${processInlineFormatting(trimmedLine.substring(3))}</h2>`);
        continue;
      }
      if (trimmedLine.startsWith('### ')) {
        closeCurrentList();
        htmlLines.push(`<h3>${processInlineFormatting(trimmedLine.substring(4))}</h3>`);
        continue;
      }
      if (trimmedLine.startsWith('#### ')) {
        closeCurrentList();
        htmlLines.push(`<h4>${processInlineFormatting(trimmedLine.substring(5))}</h4>`);
        continue;
      }
      if (trimmedLine.startsWith('##### ')) {
        closeCurrentList();
        htmlLines.push(`<h5>${processInlineFormatting(trimmedLine.substring(6))}</h5>`);
        continue;
      }
      if (trimmedLine.startsWith('###### ')) {
        closeCurrentList();
        htmlLines.push(`<h6>${processInlineFormatting(trimmedLine.substring(7))}</h6>`);
        continue;
      }

      // Handle blockquotes
      if (trimmedLine.startsWith('> ')) {
        closeCurrentList();
        htmlLines.push(`<blockquote>${processInlineFormatting(trimmedLine.substring(2))}</blockquote>`);
        continue;
      }

      // Handle unordered list items
      if (trimmedLine.startsWith('- ')) {
        if (currentList.type !== 'ul') {
          closeCurrentList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(trimmedLine.substring(2));
        continue;
      }

      // Handle ordered list items (1., 2., etc.)
      if (/^\d+\. /.test(trimmedLine)) {
        if (currentList.type !== 'ol') {
          closeCurrentList();
          currentList = { type: 'ol', items: [] };
        }
        const spaceIndex = trimmedLine.indexOf(' ');
        currentList.items.push(trimmedLine.substring(spaceIndex + 1));
        continue;
      }

      // Handle empty lines
      if (trimmedLine === '') {
        closeCurrentList();
        htmlLines.push('<p></p>');
        continue;
      }

      // Handle regular text as paragraph
      closeCurrentList();
      htmlLines.push(`<p>${processInlineFormatting(line)}</p>`);
    }

    // Close any remaining list
    closeCurrentList();

    return htmlLines.join('');
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    // Return content wrapped in paragraph as fallback
    return `<p>${String(markdown).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
}