import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Download, Save, Trash2 } from 'lucide-react';
import { useLibraryState, useLibraryActions } from '../contexts/LibraryContext';
import { useAuthState } from '../contexts/AuthContext';
import { CreatePromptModal } from './CreatePromptModal';
import { ProfileModal } from './ProfileModal';
import { htmlToMarkdown } from '../utils/markdownUtils';
import { TIMEOUTS } from '../utils/constants';

export function PromptBuilderActions() {
  const { promptBuilder, contextBlocks } = useLibraryState();
  const { clearPromptBuilder, savePromptAsTemplate, createFolder, movePromptToFolder } = useLibraryActions();
  const { isAuthenticated } = useAuthState();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalContent, setSaveModalContent] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Any pending timeouts will be cleaned up by the individual useEffect hooks
    };
  }, []);

  // Assemble the complete prompt for export with memoization
  const assemblePrompt = useMemo((): string => {
    const selectedBlocks = promptBuilder.blockOrder
      .map(blockId => contextBlocks.find(block => block.id === blockId))
      .filter(block => block !== undefined);

    let assembledText = '';

    // Add custom text if provided
    if (promptBuilder.customText.trim()) {
      assembledText += promptBuilder.customText.trim() + '\n\n';
    }

    // Add context blocks
    selectedBlocks.forEach((block, index) => {
      if (index > 0) assembledText += '\n\n';

      // For temporary text blocks, only add content without headers
      // For permanent knowledge blocks, add content with headers
      if (block.isTemporary) {
        // Convert HTML content to markdown for temporary blocks
        const markdown = htmlToMarkdown(block.content);
        assembledText += markdown;
      } else {
        assembledText += `### ${block.title}\n\n${block.content}`;
      }
    });

    return assembledText.trim();
  }, [promptBuilder.blockOrder, promptBuilder.customText, contextBlocks]);

  const handleCopyToClipboard = async () => {
    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available in this browser');
      }

      const prompt = assemblePrompt;

      // Validate that we have content to copy
      if (!prompt || prompt.trim() === '') {
        throw new Error('No content to copy - assembled prompt is empty');
      }

      await navigator.clipboard.writeText(prompt);
      setCopyStatus('copied');

      // Reset status after delay
      setTimeout(() => setCopyStatus('idle'), TIMEOUTS.COPY_STATUS_RESET);
    } catch (error) {
      setCopyStatus('error');

      // Reset status after delay
      setTimeout(() => setCopyStatus('idle'), TIMEOUTS.COPY_STATUS_RESET);
    }
  };

  const handleExport = () => {
    const prompt = assemblePrompt;
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

  const handleAuthSuccess = () => {
    // Execute pending action after successful authentication
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleAuthFailure = () => {
    // Clear pending action if authentication fails or is cancelled
    setPendingAction(null);
  };

  const checkAuthenticationAndExecute = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action);
      setIsProfileModalOpen(true);
    }
  };

  const handleOpenSaveModal = () => {
    checkAuthenticationAndExecute(() => {
      const assembledContent = assemblePrompt;
      setSaveModalContent(assembledContent);
      setIsSaveModalOpen(true);
    });
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

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onAuthFailure={handleAuthFailure}
      />
    </>
  );
}