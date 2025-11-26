# Raw Idea - Data Synchronization Between Local State and Database

## User Description

The user wants to ensure data synchronization between local state and database. When they save a prompt and navigate to the knowledge tab, the data is still local and not synced to the database, so saved prompts don't appear. They want the library context (which contains all context data) to be updated after every CRUD operation in the app to ensure data is always latest from the database.

## Problem Statement

1. **Data Inconsistency**: After saving a prompt, the data remains in local state
2. **Missing Data**: Saved prompts don't appear when navigating to the knowledge tab
3. **Stale Context**: Library context is not updated after CRUD operations
4. **User Experience Impact**: Users cannot see their saved data immediately

## Desired Solution

Update the library context (which contains all context data) after every CRUD operation in the app to ensure data is always the latest from the database.

## Context Areas Affected

- Prompt saving operations
- Knowledge tab data display
- Library context management
- Any other CRUD operations in the application