# Specification: Add Prompt Feature

## Goal
Create an "Add Prompt" feature that allows users to create reusable prompt templates with variable placeholders, similar to the existing "Add Knowledge" functionality but designed specifically for complete, ready-to-use prompts.

## User Stories
- As a user, I want to create complete prompt templates that I can quickly access and reuse for different tasks
- As a user, I want to organize my prompt templates in separate projects from my knowledge blocks for better organization
- As a user, I want to use variable placeholders in my prompts so I can quickly customize them for different contexts

## Specific Requirements

**Prompt Creation Modal**
- Create a new modal component similar to CreateContextModal.tsx for prompt creation
- Include title and content fields matching the database schema (title, description, content)
- Use TipTapEditor for rich text content editing with support for variable placeholders
- Support markdown formatting in the content area
- Add optional description field for additional context about the prompt
- Integrate with existing project selection system using prompt_projects table
- Include keyboard shortcuts (Cmd+Enter to save) and proper error handling

**Variable Placeholder System**
- Support variable placeholders using double curly braces syntax: {{user_input}}
- Allow multiple variables per prompt with descriptive names
- Provide visual highlighting of variables in the editor interface
- Include helper text explaining the variable placeholder syntax
- Ensure variables are preserved as plain text in the database content field

**UI Integration and Placement**
- Add "Add Prompt" button in prompt project views (similar to "Add Knowledge" in context views)
- Position the button in the SearchBar component when viewing prompt projects
- Use consistent styling with existing blue gradient buttons
- Ensure responsive design with proper mobile behavior
- Follow existing modal patterns with fullscreen behavior on mobile

**Database Integration**
- Leverage existing PromptService.createPrompt() method for database operations
- Use existing prompt_projects table for organization
- Store prompts with proper user authentication and project association
- Integrate with LibraryContext state management for real-time updates
- Follow existing error handling and loading state patterns

**Project Organization**
- Separate prompt templates from knowledge blocks using different project types
- Use existing prompt_projects vs context_blocks projects system
- Allow users to organize prompts in folders/projects like knowledge blocks
- Support "Unsorted" folder for unassigned prompts
- Maintain existing project sidebar integration

## Visual Design

No visual mockups were provided in the planning/visuals/ folder. The implementation should follow existing UI patterns from CreateContextModal.tsx and SearchBar.tsx components.

## Existing Code to Leverage

**CreateContextModal.tsx**
- Complete modal structure with form validation and error handling
- TipTapEditor integration for rich text content
- Project selection integration and keyboard shortcuts
- Mobile-responsive modal behavior and loading states

**PromptService.ts**
- Complete CRUD operations for prompt creation and management
- Database integration with Supabase and user authentication
- Project association methods (getPromptsByProject, createPrompt)
- Error handling patterns consistent with existing codebase

**LibraryContext.tsx**
- State management for prompt operations and real-time updates
- Existing action creators for prompt CRUD operations
- Project management integration and folder modal handling
- Loading and error state management patterns

**SearchBar.tsx**
- Existing "Add Knowledge" button pattern and styling
- Responsive design with mobile text truncation
- Consistent button styling with blue gradient and hover effects
- Integration with modal opening and callback patterns

**Modal.tsx**
- Reusable modal component with accessibility features
- Responsive behavior configuration (mobile fullscreen)
- Keyboard navigation and close on overlay click
- Consistent styling and animation patterns

## Out of Scope
- Advanced prompt variable validation or type checking
- Prompt execution or testing functionality
- Variable value substitution at runtime
- Prompt analytics or usage tracking
- Prompt versioning or history tracking
- Collaboration features for shared prompts
- Advanced formatting beyond basic markdown support
- Import/export functionality for prompts
- AI-powered prompt suggestions or improvements