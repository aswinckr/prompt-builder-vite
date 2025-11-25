import React, { useState } from 'react';
import { Copy, Download, Save, Trash2 } from 'lucide-react';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { CreatePromptModal } from './CreatePromptModal';

/**
 * Convert HTML content to markdown for copying to clipboard
 */
const htmlToMarkdown = (html: string): string => {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

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
          const ulItems = Array.from(element.querySelectorAll('li'));
          return ulItems.map(li => `- ${processChildren(li).trim()}`).join('\n') + '\n\n';

        case 'ol':
          const olItems = Array.from(element.querySelectorAll('li'));
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
};

export function PromptBuilderActions() {
  const { promptBuilder, contextBlocks } = useLibraryState();
  const { clearPromptBuilder, savePromptAsTemplate, createFolder, movePromptToFolder } = useLibraryActions();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalContent, setSaveModalContent] = useState('');

  // Assemble the complete prompt for export
  const assemblePrompt = (): string => {
    const selectedBlocks = promptBuilder.blockOrder
      .map(blockId => contextBlocks.find(block => block.id === blockId))
      .filter(block => block !== undefined);

    console.log('🔍 Assemble Prompt Debug:');
    console.log('- Block order:', promptBuilder.blockOrder);
    console.log('- Selected blocks count:', selectedBlocks.length);
    console.log('- Temporary blocks:', selectedBlocks.filter(b => b?.isTemporary).length);
    console.log('- Permanent blocks:', selectedBlocks.filter(b => !b?.isTemporary).length);
    console.log('- Custom text:', promptBuilder.customText.trim() ? 'Present' : 'Empty');

    let assembledText = '';

    // Add custom text if provided
    if (promptBuilder.customText.trim()) {
      assembledText += promptBuilder.customText.trim() + '\n\n';
      console.log('- Added custom text length:', promptBuilder.customText.trim().length);
    }

    // Add context blocks
    selectedBlocks.forEach((block, index) => {
      if (index > 0) assembledText += '\n\n';

      console.log(`- Processing block ${index + 1}:`, {
        id: block.id,
        title: block.title,
        isTemporary: block.isTemporary,
        contentLength: block.content.length,
        contentPreview: block.content.substring(0, 100) + '...'
      });

      // For temporary text blocks, only add content without headers
      // For permanent knowledge blocks, add content with headers
      if (block.isTemporary) {
        // Convert HTML content to markdown for temporary blocks
        const markdown = htmlToMarkdown(block.content);
        console.log(`  - HTML to markdown conversion:`, {
          original: block.content,
          converted: markdown,
          convertedLength: markdown.length
        });
        assembledText += markdown;
      } else {
        assembledText += `### ${block.title}\n\n${block.content}`;
        console.log(`  - Added permanent block with header`);
      }
    });

    const finalText = assembledText.trim();
    console.log('- Final assembled prompt length:', finalText.length);
    console.log('- Final assembled prompt:', finalText);

    return finalText;
  };

  const handleCopyToClipboard = async () => {
    console.log('🚀 Starting copy to clipboard process...');

    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available in this browser');
      }

      const prompt = assemblePrompt();

      // Validate that we have content to copy
      if (!prompt || prompt.trim() === '') {
        throw new Error('No content to copy - assembled prompt is empty');
      }

      console.log('📋 Attempting to copy to clipboard:', {
        contentLength: prompt.length,
        contentPreview: prompt.substring(0, 200) + '...'
      });

      await navigator.clipboard.writeText(prompt);

      console.log('✅ Successfully copied to clipboard');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ Copy to clipboard failed:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleExport = () => {
    const prompt = assemblePrompt();
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenSaveModal = () => {
    const assembledContent = assemblePrompt();
    setSaveModalContent(assembledContent);
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
    setSaveModalContent('');
  };

  const handleSaveAsPrompt = () => {
    const templateName = `Prompt ${new Date().toLocaleDateString()}`;
    const promptId = savePromptAsTemplate(templateName);

    // Create "Unsorted" folder if it doesn't exist and move prompt there
    const unsortedFolderId = createFolder("Unsorted");
    movePromptToFolder(promptId, unsortedFolderId);
  };

  const handleClearAll = () => {
    if (promptBuilder.blockOrder.length > 0 || promptBuilder.customText.trim()) {
      if (window.confirm('Are you sure you want to clear all blocks and text? This action cannot be undone.')) {
        clearPromptBuilder();
      }
    }
  };

  const hasContent = promptBuilder.blockOrder.length > 0 || promptBuilder.customText.trim();

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClearAll}
          disabled={!hasContent}
          className="flex items-center justify-center w-8 h-8 text-neutral-400 hover:text-neutral-200 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          title="Clear all blocks and text"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-700" />

        <button
          onClick={handleCopyToClipboard}
          disabled={!hasContent}
          className="flex items-center justify-center w-8 h-8 text-neutral-100 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title={copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy assembled prompt to clipboard'}
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={handleOpenSaveModal}
          disabled={!hasContent}
          className="flex items-center justify-center w-8 h-8 text-neutral-100 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Save prompt"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={handleExport}
          disabled={!hasContent}
          className="flex items-center justify-center w-8 h-8 text-white hover:bg-blue-600 disabled:text-neutral-600 disabled:cursor-not-allowed disabled:bg-neutral-800 bg-blue-500 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          title="Export prompt as text file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <CreatePromptModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        selectedProjectId={null}
        initialContent={saveModalContent}
      />
    </>
  );
}