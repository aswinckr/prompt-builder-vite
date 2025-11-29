# Complete UI Component Inventory - Prompt Builder Application

*Generated on: November 29, 2024*
*Total Components: 58*

## 📋 **MODAL & OVERLAY COMPONENTS (8)**

### Modal
- **Location**: `components/Modal.tsx`
- **Type**: Reusable Modal Component
- **Key Features**: Responsive design, accessibility (ARIA), portal-based, size variants (sm, md, lg, xl, full), mobile behavior options, keyboard navigation
- **Dependencies**: Portal component, Lucide icons (X)
- **Props**: isOpen, onClose, title, children, size, mobileBehavior, showCloseButton, closeOnOverlayClick, closeOnEscape

### ConfirmationModal
- **Location**: `components/ConfirmationModal.tsx`
- **Type**: Confirmation Dialog
- **Key Features**: Yes/No confirmation pattern, customizable message and actions
- **Dependencies**: Modal
- **Props**: Standard confirmation dialog props

### CreateContextModal
- **Location**: `components/CreateContextModal.tsx`
- **Type**: Context Creation Form
- **Key Features**: Form for creating new context blocks
- **Dependencies**: Modal, CustomTextInput
- **Props**: Form validation, context creation handlers

### CreateFolderModal
- **Location**: `components/CreateFolderModal.tsx`
- **Type**: Folder Creation Dialog
- **Key Features**: Folder creation form interface
- **Dependencies**: Modal
- **Props**: Folder name input, creation handlers

### CreatePromptModal
- **Location**: `components/CreatePromptModal.tsx`
- **Type**: Prompt Creation Form
- **Key Features**: Rich text prompt creation with editor integration
- **Dependencies**: Modal, TipTapEditor
- **Props**: Prompt content, save handlers

### EditContextModal
- **Location**: `components/EditContextModal.tsx`
- **Type**: Context Editing Form
- **Key Features**: Edit existing context blocks
- **Dependencies**: Modal, CustomTextInput
- **Props**: Context data, update handlers

### EditPromptModal
- **Location**: `components/EditPromptModal.tsx`
- **Type**: Prompt Editing Form
- **Key Features**: Edit existing prompts with rich text
- **Dependencies**: Modal, TipTapEditor
- **Props**: Prompt data, update handlers

### ProfileModal
- **Location**: `components/ProfileModal.tsx`
- **Type**: User Profile Management
- **Key Features**: User profile display and editing
- **Dependencies**: Modal
- **Props**: User data, profile management handlers

---

## 📝 **INPUT & FORM COMPONENTS (6)**

### CustomTextInput
- **Location**: `components/CustomTextInput.tsx`
- **Type**: Advanced Textarea
- **Key Features**: Auto-resize, keyboard shortcuts (Cmd+Enter), placeholder text, height limits
- **Dependencies**: LibraryContext, Lucide icons (Send)
- **Props**: value, onChange, onSubmit, placeholder, minHeight, maxHeight, className

### AIPromptInput
- **Location**: `components/AIPromptInput.tsx`
- **Type**: Chat Input Field
- **Key Features**: Loading states, submit handling, Enter key behavior, disabled states
- **Dependencies**: Lucide icons (Send, Loader2)
- **Props**: value, onChange, onSubmit, placeholder, disabled, isLoading, minHeight, maxHeight, className

### ModelSelector
- **Location**: `components/ModelSelector.tsx`
- **Type**: Dropdown Selector
- **Key Features**: Grouped AI models by provider, styled select with chevron
- **Dependencies**: LibraryContext, Lucide icons (ChevronDown)
- **Props**: selectedModel, onModelChange
- **Available Models**: OpenAI (GPT-4o, GPT-4o Mini), Anthropic (Claude Sonnet, Haiku, Opus), Google (Gemini 3 Pro, 2.5 Flash, 2.5 Flash Lite)

### IconPicker
- **Location**: `components/IconPicker.tsx`
- **Type**: Icon Selection Interface
- **Key Features**: Icon selection and display
- **Dependencies**: Lucide icons
- **Props**: Icon selection handlers

### ConversationSearch
- **Location**: `components/ConversationSearch.tsx`
- **Type**: Search Input
- **Key Features**: Conversation filtering and search
- **Dependencies**: Search utilities
- **Props**: Search handlers, filters

### TipTapEditor
- **Location**: `components/TipTapEditor.tsx`
- **Type**: Rich Text Editor
- **Key Features**: Rich text editing, variable highlighting, toolbar integration
- **Dependencies**: TipTap (starter kit, react, extensions), VariablePlaceholderHelper
- **Props**: Content, onChange, placeholder, editable

---

## 🎯 **DISPLAY & CONTENT COMPONENTS (11)**

### ChatMessage
- **Location**: `components/ChatMessage.tsx`
- **Type**: Message Display
- **Key Features**: Markdown rendering, syntax highlighting, code blocks, user/AI differentiation, timestamps
- **Dependencies**: ReactMarkdown, remarkGfm, rehypeHighlight, highlight.js
- **Props**: message object with id, role, content, createdAt

### ContextBlock
- **Location**: `components/ContextBlock.tsx`
- **Type**: Content Card
- **Key Features**: Selectable cards, keyboard shortcuts (E for edit, D for delete), tags display, hover states
- **Dependencies**: Lucide icons (Hash, Edit, Trash2)
- **Props**: block data, isSelected, onSelect, onEdit, onDelete, onKeyDown

### ContextBlocksGrid
- **Location**: `components/ContextBlocksGrid.tsx`
- **Type**: Grid Layout
- **Key Features**: Grid layout for context blocks, drag-and-drop functionality
- **Dependencies**: React DnD, ContextBlock
- **Props**: Context blocks array, selection handlers

### SearchResultItem
- **Location**: `components/SearchResultItem.tsx`
- **Type**: Search Result Display
- **Key Features**: Individual search result display with metadata
- **Dependencies**: Search utilities
- **Props**: Result data, click handlers

### SearchResultsGroup
- **Location**: `components/SearchResultsGroup.tsx`
- **Type**: Grouped Results
- **Key Features**: Groups search results by category
- **Dependencies**: SearchResultItem
- **Props**: Grouped results, category labels

### SearchResultsList
- **Location**: `components/SearchResultsList.tsx`
- **Type**: Results List
- **Key Features**: Complete search results display
- **Dependencies**: SearchResultsGroup, SearchResultItem
- **Props**: Search results, loading states

### SavedPromptList
- **Location**: `components/SavedPromptList.tsx`
- **Type**: Prompt Management List
- **Key Features**: Display and manage saved prompts
- **Dependencies**: Prompt data
- **Props**: Saved prompts, management handlers

### PromptBuilderBlock
- **Location**: `components/PromptBuilderBlock.tsx`
- **Type**: Prompt Block Display
- **Key Features**: Individual prompt block display and management
- **Dependencies**: Block data
- **Props**: Block data, management handlers

### PromptBuilderBlockList
- **Location**: `components/PromptBuilderBlockList.tsx`
- **Type**: Block List Management
- **Key Features**: List of prompt blocks with management
- **Dependencies**: PromptBuilderBlock
- **Props**: Blocks array, list management

### TemporaryContextBlock
- **Location**: `components/TemporaryContextBlock.tsx`
- **Type**: Temporary Content
- **Key Features**: Temporary context block display
- **Dependencies**: Context utilities
- **Props**: Temporary content data

### SelectionActionBar
- **Location**: `components/SelectionActionBar.tsx`
- **Type**: Bulk Actions Bar
- **Key Features**: Bulk selection and actions
- **Dependencies**: Action handlers
- **Props**: Selected items, action handlers

---

## 🧭 **NAVIGATION COMPONENTS (7)**

### Header
- **Location**: `components/Header.tsx`
- **Type**: Application Header
- **Key Features**: App header with branding and navigation
- **Dependencies**: AppLogo
- **Props**: Navigation elements, branding

### BottomTabNavigation
- **Location**: `components/BottomTabNavigation.tsx`
- **Type**: Mobile Navigation
- **Key Features**: Bottom tab navigation with highlighting, responsive design
- **Dependencies**: React Router, MotionHighlight, Lucide icons (MessageSquare, Brain, History)
- **Props**: Current route, navigation handlers

### HamburgerHistoryMenu
- **Location**: `components/HamburgerHistoryMenu.tsx`
- **Type**: Mobile Navigation Menu
- **Key Features**: Hamburger menu with history navigation
- **Dependencies**: Drawer, SimplifiedConversationHistory, MotionHighlight
- **Props**: Menu state, navigation handlers

### HistoryMenuButton
- **Location**: `components/HistoryMenuButton.tsx`
- **Type**: History Access Button
- **Key Features**: Button with modal overlay for history
- **Dependencies**: Drawer, MotionHighlight, Lucide icons (History)
- **Props**: Button styling, modal content

### ProfileButton
- **Location**: `components/ProfileButton.tsx`
- **Type**: User Profile Access
- **Key Features**: Profile access button with modal
- **Dependencies**: ProfileModal, user context
- **Props**: User data, modal handlers

### ProjectSidebar
- **Location**: `components/ProjectSidebar.tsx`
- **Type**: Project Navigation
- **Key Features**: Sidebar navigation for projects
- **Dependencies**: Project data
- **Props**: Project list, navigation handlers

### KnowledgeHistoryButton
- **Location**: `components/KnowledgeHistoryButton.tsx`
- **Type**: Knowledge History Access
- **Key Features**: History access from knowledge tab
- **Dependencies**: History components
- **Props**: History navigation handlers

---

## 🎨 **UTILITY & PRIMITIVE COMPONENTS (8)**

### Portal
- **Location**: `components/ui/Portal.tsx`
- **Type**: React Portal
- **Key Features**: React portal implementation for overlays
- **Dependencies**: React DOM
- **Props**: Children, portal container

### RouteTransition
- **Location**: `components/ui/RouteTransition.tsx`
- **Type**: Page Transitions
- **Key Features**: Smooth page transitions and animations
- **Dependencies**: React transition utilities
- **Props**: Transition configuration

### SynchronizedLoading
- **Location**: `components/ui/SynchronizedLoading.tsx`
- **Type**: Loading States
- **Key Features**: Synchronized loading indicators
- **Dependencies**: Loading utilities
- **Props**: Loading state, loading messages

### Toast
- **Location**: `components/Toast.tsx`
- **Type**: Notification System
- **Key Features**: Auto-dismiss notifications, variants (success, error, warning, info), manual dismiss
- **Dependencies**: Lucide icons (X, CheckCircle, AlertCircle, AlertTriangle, Info)
- **Props**: id, message, variant, duration, isVisible, onDismiss

### TypingIndicator
- **Location**: `components/TypingIndicator.tsx`
- **Type**: Chat Typing Animation
- **Key Features**: Animated typing indicator for chat
- **Dependencies**: Animation utilities
- **Props**: Typing state, animation configuration

### ErrorBoundary
- **Location**: `components/ErrorBoundary.tsx`
- **Type**: Error Handling
- **Key Features**: React error boundary with fallback UI
- **Dependencies**: Error handling utilities
- **Props**: Error handlers, fallback components

### AppLogo
- **Location**: `components/AppLogo.tsx`
- **Type**: Brand Logo
- **Key Features**: Application logo display
- **Dependencies**: Brand assets
- **Props**: Logo size, variants

### VariablePlaceholderHelper
- **Location**: `components/VariablePlaceholderHelper.tsx`
- **Type**: Syntax Helper
- **Key Features**: Variable syntax documentation and help
- **Dependencies**: Variable system
- **Props**: Help content, display options

---

## 📱 **FEATURE-SPECIFIC COMPONENTS (12)**

### PromptBuilder
- **Location**: `components/PromptBuilder.tsx`
- **Type**: Main Prompt Interface
- **Key Features**: Complete prompt building interface with text input and context blocks
- **Dependencies**: CustomTextInput, ContextBlocksGrid, Multiple utility components
- **Props**: Prompt data, building handlers, context management

### PromptBuilderActions
- **Location**: `components/PromptBuilderActions.tsx`
- **Type**: Prompt Actions
- **Key Features**: Action buttons for prompt operations
- **Dependencies**: Action handlers
- **Props**: Available actions, action handlers

### PromptBuilderContent
- **Location**: `components/PromptBuilderContent.tsx`
- **Type**: Prompt Content Area
- **Key Features**: Content display and editing area
- **Dependencies**: Content components
- **Props**: Content data, editing handlers

### ContextLibrary
- **Location**: `components/ContextLibrary.tsx`
- **Type**: Knowledge Management
- **Key Features**: Complete knowledge and context management interface
- **Dependencies**: Multiple context components
- **Props**: Context data, library management

### ChatInterface
- **Location**: `components/ChatInterface.tsx`
- **Type**: Chat Interface
- **Key Features**: Complete chat interface with message display and input
- **Dependencies**: ChatMessage, AIPromptInput, Multiple chat components
- **Props**: Chat data, message handlers

### ConversationHistory
- **Location**: `components/ConversationHistory.tsx`
- **Type**: Full Conversation History
- **Key Features**: Complete conversation history with filters and statistics
- **Dependencies**: Conversation components, filters, stats
- **Props**: History data, filtering options

### ConversationDetail
- **Location**: `components/ConversationDetail.tsx`
- **Type**: Conversation View
- **Key Features**: Individual conversation detail view
- **Dependencies**: ChatMessage, ConversationActions
- **Props**: Conversation data, detail handlers

### ConversationActions
- **Location**: `components/ConversationActions.tsx`
- **Type**: Conversation Controls
- **Key Features**: Actions for conversation management
- **Dependencies**: Action handlers
- **Props**: Conversation data, available actions

### ConversationFilters
- **Location**: `components/ConversationFilters.tsx`
- **Type**: Filtering Interface
- **Key Features**: Filter options for conversation history
- **Dependencies**: Filter components
- **Props**: Filter state, filter handlers

### ConversationStats
- **Location**: `components/ConversationStats.tsx`
- **Type**: Statistics Display
- **Key Features**: Conversation statistics and analytics
- **Dependencies**: Stats utilities
- **Props**: Statistics data, display options

### SimplifiedConversationHistory
- **Location**: `components/SimplifiedConversationHistory.tsx`
- **Type**: Search-Only History
- **Key Features**: Simplified conversation history with search only
- **Dependencies**: ConversationSearch, SearchResultItem
- **Props**: Search functionality, results display

### GlobalSearch
- **Location**: `components/GlobalSearch.tsx`
- **Type**: Global Search Interface
- **Key Features**: Application-wide search functionality
- **Dependencies**: Search components
- **Props**: Search configuration, results handling

---

## 🏷️ **FILTER & TAG COMPONENTS (3)**

### TagFilterPills
- **Location**: `components/TagFilterPills.tsx`
- **Type**: Tag Filtering
- **Key Features**: Pill-style tag filters with selection states
- **Dependencies**: Tag utilities
- **Props**: Available tags, selected tags, filter handlers

### CollapsibleTagSection
- **Location**: `components/CollapsibleTagSection.tsx`
- **Type**: Collapsible Tags
- **Key Features**: Collapsible sections for tag organization
- **Dependencies**: Tag components
- **Props**: Tag groups, collapse states

### ContextDropdown
- **Location**: `components/ContextDropdown.tsx`
- **Type**: Context Selection
- **Key Features**: Dropdown for context selection
- **Dependencies**: Dropdown utilities
- **Props**: Context options, selection handlers

---

## ⚙️ **LOW-LEVEL UI COMPONENTS (3)**

### dropdown-menu
- **Location**: `components/ui/dropdown-menu.tsx`
- **Type**: Radix Dropdown Wrapper
- **Key Features**: Radix UI dropdown menu implementation
- **Dependencies**: @radix-ui/react-dropdown-menu
- **Props**: Standard dropdown menu props

### drawer
- **Location**: `components/ui/drawer.tsx`
- **Type**: Slide-out Drawer
- **Key Features**: Modal drawer with slide animation
- **Dependencies**: Radix UI primitives
- **Props**: Drawer content, side, size, open state

### motion-highlight
- **Location**: `components/ui/shadcn-io/motion-highlight.tsx`
- **Type**: Animation Effects
- **Key Features**: Motion highlight effects for interactive elements
- **Dependencies**: Animation utilities
- **Props**: Highlight configuration, children

---

## 🎯 **MIGRATION STRATEGY & ANALYSIS**

### **Current Technology Stack**
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4.18 with custom design system
- **UI Primitives**: Radix UI components (@radix-ui/react-*)
- **Icons**: Lucide React and Radix Icons
- **State Management**: React Context API
- **Animations**: Custom CSS animations and motion components

### **Design System Foundation**
- **Color Palette**: Neutral grays (`bg-neutral-800`, `text-neutral-100`) with blue accents (`text-blue-400`)
- **Typography**: System font stack with Tailwind typography plugin
- **Spacing**: Tailwind's spacing scale (4px base unit)
- **Border Radius**: Consistent `0.5rem` (8px) radius throughout
- **Animations**: CSS transitions with Tailwind transition utilities
- **Theme**: CSS custom properties for light/dark mode support

### **Component Architecture Patterns**
- **Compound Components**: Many components use compound patterns (Modal + content, Input + button)
- **Render Props**: Some components use render prop patterns for flexibility
- **Custom Hooks**: Business logic extracted into custom hooks
- **Context Integration**: Most components integrate with React contexts for state
- **Accessibility**: ARIA attributes and keyboard navigation throughout

### **Dependencies Analysis**

#### **High-Value Dependencies (Keep)**
- **Radix UI**: Provides accessible primitives (dialog, dropdown, slot)
- **Lucide React**: Consistent icon system (36+ icons used)
- **React Markdown**: Content rendering with syntax highlighting
- **TipTap**: Rich text editor with extensibility

#### **Consider for Migration**
- **Custom Animations**: May need reimplementation in new UI library
- **CSS Variables**: Preserve for theming consistency
- **Component Variants**: Use `class-variance-authority` pattern

### **Migration Priority Matrix**

#### **Phase 1: Core Components (High Priority)**
1. **Modal** - Foundation for overlays
2. **Button** patterns (embedded in components)
3. **Input** components (CustomTextInput, AIPromptInput)
4. **Card/Display** components (ContextBlock, ChatMessage)

#### **Phase 2: Complex Components (Medium Priority)**
1. **Navigation** components (Header, BottomTabNavigation)
2. **Form** components (Modal forms with validation)
3. **List/Grid** components (SearchResults, ContextBlocksGrid)

#### **Phase 3: Specialized Components (Low Priority)**
1. **Editor** integration (TipTapEditor)
2. **Feature-specific** components (PromptBuilder, ContextLibrary)
3. **Utility** components (ErrorBoundary, Toast)

### **Testing Coverage Analysis**
- **43 test files** covering components and integration flows
- **Testing Library**: React Testing Library with Jest DOM
- **Test Framework**: Vitest with UI support
- **Coverage Areas**: Component rendering, user interactions, integration flows

### **Recommendations for UI Library Selection**

#### **Ideal Library Characteristics**
1. **Component Completeness**: Has Modal, Button, Input, Card, Navigation components
2. **Accessibility Built-in**: WCAG compliant with ARIA support
3. **Customizable Theming**: CSS custom properties support
4. **TypeScript Support**: Full type definitions
5. **Tree Shaking**: Minimal bundle size impact
6. **Animation Support**: Compatible with existing animation patterns

#### **Potential Migration Paths**
1. **Gradual Migration**: Replace components category by category
2. **Theme Preservation**: Maintain existing color and spacing system
3. **Accessibility Maintenance**: Preserve ARIA attributes and keyboard navigation
4. **Component Mapping**: Create mapping between existing and new library components

This comprehensive inventory provides a complete foundation for planning your UI library migration strategy, ensuring no functionality is lost while taking advantage of modern UI component systems.