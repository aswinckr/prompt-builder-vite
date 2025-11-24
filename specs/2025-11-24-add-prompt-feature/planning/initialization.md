# Feature Specification: Add Prompt Feature

## Initial Idea

Create an "Add Prompt" feature similar to the existing "Add Knowledge" functionality for managing reusable prompt templates.

## Context

The user wants to add a prompt creation feature that mirrors the existing context block (knowledge) creation workflow. This would allow users to save, organize, and reuse prompt templates alongside their knowledge blocks in the Prompt Builder application.

The current system has:
- **Context Blocks (Knowledge)**: Reusable knowledge pieces that can be combined into prompts
- **Saved Prompts**: Pre-built prompt combinations
- **Project Organization**: Folders for organizing both knowledge and prompts

The new "Add Prompt" feature should create reusable prompt templates that users can quickly access and modify, similar to how the "Add Knowledge" modal creates reusable context blocks.

## Existing Patterns to Reference

Based on the codebase analysis:
- **CreateContextModal.tsx**: Template for the modal interface and form
- **LibraryContext.tsx**: State management patterns for CRUD operations
- **ContextLibrary.tsx**: Integration patterns for modals and UI
- **TipTapEditor**: Rich text editor component for content input
- **ProjectSidebar**: Project organization and selection patterns

## Key Questions to Research

1. How should prompts differ from context blocks in terms of structure and fields?
2. Should prompts be organized separately from knowledge or use the same project system?
3. What additional metadata fields should prompts have vs knowledge blocks?
4. How should prompt creation integrate with the existing workflow and UI?