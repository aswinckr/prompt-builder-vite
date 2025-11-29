import React, { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PromptBuilderActions } from "./PromptBuilderActions";
import { ChatInterface } from "./ChatInterface";
import { PromptBuilderContent } from "./PromptBuilderContent";
import { UserProfile } from "./UserProfile";
import { ModelSelector } from "./ModelSelector";
import { ProfileModal } from "./ProfileModal";
import { HamburgerHistoryMenu } from "./HamburgerHistoryMenu";
import { SynchronizedLoading } from "./ui/SynchronizedLoading";
import { ErrorBoundary } from "./ErrorBoundary";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { useAuthState } from "../contexts/AuthContext";
import { htmlToMarkdown } from "../utils/markdownUtils";

export function PromptBuilder() {
  const { promptBuilder, chat, contextBlocks } = useLibraryState();
  const { isAuthenticated, isLoading } = useAuthState();

  const { setCustomText, setChatPanelOpen, setSelectedModel } =
    useLibraryActions();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Assemble the full prompt from blocks and custom text
  const assembledPrompt = useMemo(() => {
    const blocks = promptBuilder.blockOrder
      .map((blockId) => contextBlocks.find((block) => block.id === blockId))
      .filter(
        (block): block is NonNullable<typeof block> => block !== undefined
      );

    // Process blocks with markdown conversion for temporary blocks
    const blockTexts = blocks.map((block) => {
      // For temporary text blocks, convert HTML to markdown
      // For permanent knowledge blocks, add headers and keep original content
      if (block.isTemporary) {
        return htmlToMarkdown(block.content);
      } else {
        return `### ${block.title}\n\n${block.content}`;
      }
    });

    // Combine custom text and block contents
    const allTexts = [];
    if (promptBuilder.customText.trim()) {
      allTexts.push(promptBuilder.customText.trim());
    }
    allTexts.push(...blockTexts);

    return allTexts.join("\n\n").trim();
  }, [promptBuilder.blockOrder, promptBuilder.customText, contextBlocks]);

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

  const handleRunPrompt = () => {
    checkAuthenticationAndExecute(() => {
      // Open the chat panel directly
      setChatPanelOpen(true);
    });
  };

  const handleSaveChat = (conversation: any) => {
    // For now, just save the conversation. In a real implementation,
    // you'd save this to your database or state
    alert("Chat conversation saved!");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ErrorBoundary>
        <SynchronizedLoading isLoading={isLoading}>
        <div className="flex h-full flex-col bg-background text-foreground">
        {/* Header with Model Selector and Actions */}
        <div className="flex items-center justify-between border-b border-border p-4 backdrop-blur-sm">
          {/* Left side - Hamburger History Menu and Model Selector */}
          <div className="flex items-center gap-3">
            <HamburgerHistoryMenu />
            <ModelSelector
              selectedModel={chat.selectedModel}
              onModelChange={handleModelChange}
            />
          </div>

          {/* Right side - Prompt Actions */}
          <div className="flex items-center gap-3">
            <PromptBuilderActions />
          </div>
        </div>

        {/* Main Content - ChatGPT-style Centered Layout */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <PromptBuilderContent onRunPrompt={handleRunPrompt} />
        </div>

        {/* Chat Interface */}
        {chat.isChatPanelOpen && (
          <ChatInterface
            formattedPrompt={assembledPrompt}
            selectedModel={chat.selectedModel}
            isOpen={chat.isChatPanelOpen}
            onClose={() => setChatPanelOpen(false)}
          />
        )}

        {/* User Profile Button */}
        <UserProfile />

        {/* Profile Modal for Authentication */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          onAuthFailure={handleAuthFailure}
        />
        </div>
        </SynchronizedLoading>
      </ErrorBoundary>
    </DndProvider>
  );
}