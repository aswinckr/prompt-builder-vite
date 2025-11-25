# Spec Requirements: Prompt System

## Initial Description
Create a prompt system similar to the knowledge system, allowing users to create reusable prompts with variable placeholders that can be used across different agents.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the prompt system will need fields for title, content, tags, and possibly description, similar to how knowledge blocks are structured. Is that correct, or would you prefer a simpler structure with just title and content?
**Answer:** No - just simple markdown prompt, similar to knowledge block (title + content only)

**Q2:** I'm thinking prompts should be organized in folders/collections similar to how knowledge blocks are grouped. Should we use the same folder-based organization, or would you prefer a different approach like tags or categories?
**Answer:** Prompts should have their own separate folders using the existing prompt_projects table structure

**Q3:** Should the prompt content support variable placeholders (like {{user_input}}) that can be dynamically filled when the prompt is used, or should they be static complete prompts?
**Answer:** Markdown formatted text with variable placeholders (like {{user_input}})

**Q4:** Where in the UI should users access the prompt creation? Should it be integrated into the existing knowledge interface, or have its own dedicated section in the app?
**Answer:** Yes, similar to "Add Knowledge" button placement

**Q5:** Will these be ready-to-use complete prompts, or template-like partials that users combine and customize?
**Answer:** Ready-to-use complete prompts

**Q6:** Should we provide any suggested structure or formatting guidelines for users when creating prompts, or leave it completely free-form?
**Answer:** Free-form, no suggested structure

**Q7:** Are these prompts intended to be model-agnostic, or should we optimize them for specific AI models (like Claude, GPT, etc.)?
**Answer:** Model-agnostic

### Existing Code to Reference
Based on user's response about similar features and database context:

**Similar Features Identified:**
- Knowledge System: Similar UI patterns for adding content blocks with title + content structure
- Folder Organization: Existing prompt_projects and dataset_projects table structure for folder-based organization
- Database Schema: Complete infrastructure already in place with prompts, prompt_projects, and prompt_context_blocks tables

**Components to potentially reuse:**
- Knowledge block UI components for title/content editing
- Folder navigation and management interface
- Existing project/folder organization patterns

**Backend logic to reference:**
- Knowledge block creation and management endpoints
- Project folder structure management
- Context block connection logic (for prompt_context_blocks integration)

### Follow-up Questions
No follow-up questions needed - requirements are clear and database infrastructure is already in place.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets to analyze.

## Requirements Summary

### Functional Requirements
- Create prompt system with title + content structure (similar to knowledge blocks)
- Support markdown formatted content with variable placeholders (like {{user_input}})
- Organize prompts in separate folders using existing prompt_projects table structure
- Integrate prompt creation into existing UI with similar placement to "Add Knowledge" button
- Provide ready-to-use complete prompts that are model-agnostic
- Allow free-form prompt creation without suggested structure guidelines
- Connect prompts with knowledge blocks using existing prompt_context_blocks table

### Reusability Opportunities
- Knowledge block UI components for title/content editing
- Existing folder navigation and project management interface
- Database schema and table structures already implemented
- Backend API patterns from knowledge system for prompt CRUD operations
- Project/folder organization logic from existing implementation

### Scope Boundaries
**In Scope:**
- UI for creating and managing prompts with title + markdown content
- Folder-based organization using prompt_projects table
- Integration with existing knowledge system UI patterns
- Support for variable placeholders in prompt content
- Connection between prompts and knowledge blocks via prompt_context_blocks

**Out of Scope:**
- Model-specific optimizations or configurations
- Template combination system (prompts are ready-to-use)
- Formatting guidelines or structure suggestions
- Additional metadata beyond title and content

### Technical Considerations
- Database infrastructure already complete with prompts, prompt_projects, and prompt_context_blocks tables
- Should follow existing knowledge system UI patterns for consistency
- Variable placeholder system needs to be implemented for dynamic content
- Integration with existing project management and folder organization
- Model-agnostic approach allows for flexibility in prompt usage
- Free-form markdown content requires proper rendering support in the UI