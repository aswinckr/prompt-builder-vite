# Specification: Save Prompt Feature

## Goal
Enable users to save assembled prompts from the prompt builder page using a modal interface that pre-populates the assembled content and provides clear feedback upon successful save.

## User Stories
- As a user assembling a prompt with context blocks and custom text, I want to click a save button and open a modal with my assembled prompt already populated so that I can quickly save it with a title
- As a user saving a prompt, I want to receive clear feedback when my prompt is successfully saved so that I know my action was completed

## Specific Requirements

**Save Button Integration**
- Enhance existing save button in PromptBuilderActions to open the CreatePromptModal instead of directly saving
- Pass the assembled prompt content to the modal for pre-population
- Maintain current visual design and placement of the save button
- Only enable save button when there's content to save (existing logic preserved)

**Modal Content Pre-population**
- Modify CreatePromptModal to accept and display pre-populated content when opened for saving
- Pre-fill the content field with the assembled prompt from the prompt builder
- Use the same TipTapEditor for consistency with existing create prompt flow
- Allow users to edit the pre-populated content before saving if needed

**Assembled Prompt Content Structure**
- Combine custom text and selected context blocks in the correct order
- Maintain existing prompt assembly logic from PromptBuilderActions.assemblePrompt()
- Include block titles as headers when assembling context blocks
- Use consistent formatting (### Title) for context block sections

**Feedback System Integration**
- Show success toast notification when prompt is successfully saved
- Display error toast notification if save operation fails
- Use existing ToastContext and Toast components for consistency
- Include descriptive messages that clearly indicate the save operation result

**Save Operation Logic**
- Use the existing createSavedPrompt function from LibraryContext
- Pass assembled content as text (not HTML) for consistency with existing prompts
- Allow user to provide a title and optional description
- Associate with selected project if one is active

## Visual Design

No visual assets provided for this specification.

## Existing Code to Leverage

**CreatePromptModal Component**
- Fully functional modal with title, description, and content fields
- Integrated TipTapEditor for rich text editing
- Existing form validation and error handling
- Keyboard shortcuts (⌘+Enter) and accessibility features
- Uses the base Modal component for consistent behavior

**PromptBuilderActions Component**
- Existing save button with proper positioning and styling
- Current assemblePrompt() function that combines custom text and context blocks
- Proper content validation logic for enabling/disabling the save button
- Uses lucide-react Save icon for consistency

**Toast System**
- Complete ToastContext with showToast and dismissToast functions
- Toast component with multiple variants (success, error, info, warning)
- Auto-dismiss functionality and proper accessibility attributes
- Already integrated into the app structure

**LibraryContext Actions**
- createSavedPrompt function for persisting prompts
- Proper error handling and state management
- Integration with backend PromptService
- Support for project associations and tags

**Modal Component**
- Reusable base modal with configurable sizes and mobile behavior
- Built-in accessibility features (ARIA labels, keyboard navigation)
- Consistent styling and close button functionality
- Support for overlay click and escape key closing

## Out of Scope
- Bulk save operations for multiple prompts at once
- Save as different file formats beyond the database storage
- Advanced prompt template management features
- Prompt versioning or history tracking
- Collaborative saving or sharing features
- Auto-save functionality during prompt assembly
- Prompt scheduling or delayed save features
- Save prompt as different prompt types or categories beyond existing project system
- Export prompts during save operation (separate existing export feature)