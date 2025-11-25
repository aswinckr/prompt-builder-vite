import React, { useState, useMemo } from "react";
import { ChevronDown, User, MessageCircle } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CustomTextInput } from "./CustomTextInput";
import { PromptBuilderBlockList } from "./PromptBuilderBlockList";
import { PromptBuilderActions } from "./PromptBuilderActions";
import { ChatInterface } from "./ChatInterface";
import { ProfileModal } from "./ProfileModal";
import { SynchronizedLoading } from "./ui/SynchronizedLoading";
import { useLibraryState, useLibraryActions } from "../contexts/LibraryContext";
import { useAuthState } from "../contexts/AuthContext";

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

export function PromptBuilder() {
  const { promptBuilder, chat, contextBlocks } = useLibraryState();
  const { user, isAuthenticated, isLoading } = useAuthState();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  const { setCustomText, setChatPanelOpen, setSelectedModel } =
    useLibraryActions();

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

  const handleRunPrompt = () => {
    // Open the chat panel directly
    setChatPanelOpen(true);
  };

  const handleSaveChat = (conversation: any) => {
    // For now, just log the conversation. In a real implementation,
    // you'd save this to your database or state
    console.log("Saving conversation:", conversation);
    alert("Chat conversation saved!");
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // Available models - includes actual OpenRouter models
  const availableModels = [
    { value: "gemini-3-pro", label: "Gemini 3 Pro", group: "Google" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", group: "Google" },
    {
      value: "gemini-2.5-flash-lite",
      label: "Gemini 2.5 Flash Lite",
      group: "Google",
    },
    { value: "gpt-4o", label: "GPT-4o", group: "OpenAI" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", group: "OpenAI" },
    { value: "claude-sonnet", label: "Claude 3 Sonnet", group: "Anthropic" },
    { value: "claude-haiku", label: "Claude 3 Haiku", group: "Anthropic" },
    { value: "claude-opus", label: "Claude 3 Opus", group: "Anthropic" },
  ];

  // Group models by provider
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.group]) {
      acc[model.group] = [];
    }
    acc[model.group].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);

  return (
    <DndProvider backend={HTML5Backend}>
      <SynchronizedLoading isLoading={isLoading}>
        <div className="flex h-full flex-col bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-neutral-100">
        {/* Header with Model Selector and Actions */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 p-4 backdrop-blur-sm">
          {/* Left side - Model Selector */}
          <div className="relative">
            <select
              className="min-w-[160px] appearance-none rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-2 pr-8 text-sm backdrop-blur-sm transition-all duration-200 hover:bg-neutral-800/70 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={chat.selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              {Object.entries(groupedModels).map(([group, models]) => (
                <optgroup key={group} label={group}>
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-neutral-400" />
          </div>

          {/* Right side - Prompt Actions */}
          <div className="flex items-center gap-3">
            {/* Prompt Builder Actions */}
            <PromptBuilderActions />
          </div>
        </div>

        {/* Main Content - ChatGPT-style Centered Layout */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Profile Circle - Bottom Left */}
          <div className="fixed bottom-6 left-6 z-50">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsProfileModalOpen(true);
                }
              }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-700 shadow-lg transition-colors hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
              aria-label="Open profile menu"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white"></div>
              ) : isAuthenticated && user?.user_metadata?.avatar_url && !avatarImageError ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarImageError(true)}
                />
              ) : isAuthenticated && user?.email ? (
                <span className="text-sm font-medium text-neutral-300">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User
                  size={18}
                  className="text-neutral-300"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center space-y-6">
              {/* Title - Like Claude/ChatGPT branding */}
              <div className="text-center">
                <h1
                  className="mb-4 text-4xl font-medium text-neutral-100 lg:text-5xl"
                  style={{ fontFamily: '"Libra Baskerville", Georgia, serif' }}
                >
                  What can I help with?
                </h1>
              </div>

              {/* Centered Main Input Area */}
              <div className="relative">
                <CustomTextInput onRunPrompt={handleRunPrompt} />
              </div>

              {/* Context Blocks - Displayed below input as cards */}
              <PromptBuilderBlockList />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {chat.isChatPanelOpen && (
          <ChatInterface
            formattedPrompt={assembledPrompt}
            selectedModel={chat.selectedModel}
            isOpen={chat.isChatPanelOpen}
            onClose={() => setChatPanelOpen(false)}
            onSave={handleSaveChat}
          />
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
        </div>
      </SynchronizedLoading>
    </DndProvider>
  );
}
