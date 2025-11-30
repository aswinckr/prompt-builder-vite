# Requirements Research

## Current Application Analysis

### Architecture Overview
- **Framework**: React 18.3.1 with TypeScript
- **UI Library**: Radix UI components with custom styling
- **Database**: Supabase with PostgreSQL backend
- **State Management**: React Context (LibraryContext) with useReducer
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom design system

### Current Folder Structure Implementation
- **Project Type**: Interface supports both 'prompt' and 'dataset' folders
- **System Folders**: Protected folders like "Unsorted" with is_system flag
- **Hierarchy**: Supports parent_id for nested folder structure (future feature)
- **Storage**: Separate tables for prompt_projects and dataset_projects
- **Service Layer**: ProjectService handles all CRUD operations

### Existing Folder Management Components
- **ProjectSidebar**: Renders folder list with keyboard navigation
- **CreateFolderModal**: Handles folder creation with validation
- **IconPicker**: Allows folder icon customization
- **ConfirmationModal**: Provides delete confirmation dialogs
- **DropdownMenu**: Radix UI component for context menus

### Current Folder Service Capabilities
- **ProjectService.createProject**: Creates new folders
- **ProjectService.updateProject**: Updates folder properties ✅ **Can be extended for rename**
- **ProjectService.deleteProject**: Deletes folders ✅ **Already handles system folder protection**
- **ProjectService.getUserProjects**: Gets user-created folders
- **ProjectService.getSystemProjects**: Gets system folders

### State Management Patterns
- **LibraryContext**: Central state with actions for folder operations
- **Existing Actions**:
  - UPDATE_PROMPT_PROJECT / UPDATE_DATASET_PROJECT ✅ **Ready for rename**
  - DELETE_PROMPT_PROJECT / DELETE_DATASET_PROJECT ✅ **Ready for delete**
  - Folder modal state management already implemented

### UI Component Patterns to Follow
- **Modal Pattern**: Uses Shadcn Dialog with consistent styling
- **Form Validation**: Character limits (50), required field validation
- **Loading States**: Button spinners and disabled states
- **Error Handling**: Inline error messages with icons
- **Keyboard Navigation**: Enter/Esc support, proper focus management

### Database Schema Considerations
- **Existing Tables**: prompt_projects, dataset_projects
- **Key Fields**: id, user_id, name, icon, parent_id, is_system, updated_at
- **RLS Policies**: Row Level Security already implemented
- **Triggers**: Automatic updated_at timestamp management

### Current ProjectSidebar Structure
```tsx
// Shows folder count for prompt projects
{type === "prompts" && project.promptCount !== undefined && (
  <span className="text-xs">({project.promptCount})</span>
)}
// System folders are sorted first in the list
const sortedProjects = [...projects].sort((a, b) => {
  if (a.is_system && !b.is_system) return -1;
  if (!a.is_system && b.is_system) return 1;
  return a.name.localeCompare(b.name);
});
```

### Existing Validation Rules
- **Folder Name**: Required, max 50 characters
- **System Protection**: is_system folders cannot be deleted
- **User Scope**: Users can only manage their own folders
- **Type Separation**: Prompt folders separate from dataset folders

### Questions Resolved

✅ **Current folder structure implementation**: Found in Project type and ProjectService
✅ **UI components for folder display**: ProjectSidebar with CreateFolderModal and IconPicker
✅ **Existing modal/dialog patterns**: Modal component built on Shadcn Dialog, ConfirmationModal for delete confirmations
✅ **Data models and state management**: LibraryContext with complete folder state and actions
✅ **Existing APIs**: ProjectService with full CRUD operations already implemented

### Key Insights
1. **Rename capability exists**: ProjectService.updateProject can be used for folder renaming
2. **Delete protection is implemented**: System folders are already protected from deletion
3. **State management ready**: LibraryContext has the necessary actions for folder updates
4. **UI components available**: All required UI patterns already exist and can be reused
5. **Validation patterns established**: Folder validation logic already exists in CreateFolderModal