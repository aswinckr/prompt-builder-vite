import React, { useState, useMemo, useEffect } from "react";
import { Copy, Download, Save, Trash2 } from "lucide-react";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { useAuthState } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { CreatePromptModal } from "./CreatePromptModal";
import { ProfileModal } from "./ProfileModal";
import { htmlToMarkdown } from "../utils/markdownUtils";
import { TIMEOUTS } from "../utils/constants";

export function PromptBuilderActions() {
  const { promptBuilder, contextBlocks } = useLibraryState();
  const {
    clearPromptBuilder,
    savePromptAsTemplate,
    createFolder,
    movePromptToFolder,
  } = useLibraryActions();
  const { isAuthenticated } = useAuthState();
  const { showToast } = useToast();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalContent, setSaveModalContent] = useState("");
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
      .map((blockId) => contextBlocks.find((block) => block.id === blockId))
      .filter((block) => block !== undefined);

    let assembledText = "";

    // Add custom text if provided
    if (promptBuilder.customText.trim()) {
      // Convert HTML custom text to markdown for consistent formatting
      const customTextMarkdown = htmlToMarkdown(promptBuilder.customText.trim());
      assembledText += customTextMarkdown + "\n\n";
    }

    // Add context blocks
    selectedBlocks.forEach((block, index) => {
      if (index > 0) assembledText += "\n\n";

      // Process blocks with markdown conversion for ALL blocks
      // Convert ALL block content from HTML to markdown for consistent formatting
      const markdownContent = htmlToMarkdown(block.content);
      assembledText += `### ${block.title}\n\n${markdownContent}`;
    });

    return assembledText.trim();
  }, [promptBuilder.blockOrder, promptBuilder.customText, contextBlocks]);

  const handleCopyToClipboard = async () => {
    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available in this browser");
      }

      const prompt = assemblePrompt;

      // Validate that we have content to copy
      if (!prompt || prompt.trim() === "") {
        throw new Error("No content to copy - assembled prompt is empty");
      }

      await navigator.clipboard.writeText(prompt);
      setCopyStatus("copied");

      // Show success toast message
      showToast("Prompt copied to clipboard!", "success");
    } catch (error) {
      setCopyStatus("error");

      // Show error toast message
      showToast("Failed to copy prompt to clipboard", "error");
    } finally {
      // Reset status after delay, regardless of success or error
      setTimeout(() => setCopyStatus("idle"), TIMEOUTS.COPY_STATUS_RESET);
    }
  };

  const handleExport = () => {
    const prompt = assemblePrompt;
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
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
    setSaveModalContent("");
  };

  const handleSaveAsPrompt = async () => {
    const templateTitle = `Prompt ${new Date().toLocaleDateString()}`;
    try {
      const promptId = await savePromptAsTemplate(templateTitle);

      // Create "Unsorted" folder if it doesn't exist and move prompt there
      const unsortedFolderId = createFolder("Unsorted");
      movePromptToFolder(promptId, unsortedFolderId);
    } catch (error) {
      console.warn("Failed to save prompt as template");
    }
  };

  const handleClearAll = () => {
    if (
      promptBuilder.blockOrder.length > 0 ||
      promptBuilder.customText.trim()
    ) {
      if (
        window.confirm(
          "Are you sure you want to clear all blocks and text? This action cannot be undone."
        )
      ) {
        clearPromptBuilder();
      }
    }
  };

  const hasContent =
    promptBuilder.blockOrder.length > 0 || promptBuilder.customText.trim();

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClearAll}
          disabled={!hasContent}
          className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:text-muted"
          title="Clear all blocks and text"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          onClick={handleCopyToClipboard}
          disabled={!hasContent}
          className="flex h-8 w-8 items-center justify-center rounded border border-input bg-muted text-foreground transition-colors hover:bg-primary/90 hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          title={
            copyStatus === "copied"
              ? "Copied!"
              : copyStatus === "error"
              ? "Copy failed"
              : "Copy assembled prompt to clipboard"
          }
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          onClick={handleOpenSaveModal}
          disabled={!hasContent}
          className="flex h-8 w-8 items-center justify-center rounded border border-input bg-muted text-foreground transition-colors hover:bg-primary/90 hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          title="Save prompt"
        >
          <Save className="h-4 w-4" />
        </button>

        <button
          onClick={handleExport}
          disabled={!hasContent}
          className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground shadow-glow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          title="Export prompt as text file"
        >
          <Download className="h-4 w-4" />
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
