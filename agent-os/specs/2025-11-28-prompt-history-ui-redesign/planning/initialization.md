# Prompt History UI Redesign

## Initial Idea

Reshape the prompt history UI from bottom tabs to overflow menus while preserving all functionality.

### Current Implementation
- Bottom tabs display prompt history
- Users can access previous prompts via tab interface

### Target Implementation
1. **/prompt tab**: Add overflow button at top left corner containing prompt history
2. **/knowledge tab**: Add History button with icon at bottom, above divider and profile button

### Reference Design
- Use Gemini.google.com's overflow menu pattern as design inspiration
- Ensure all current prompt history features are preserved in new placement

### Key Requirements
- Maintain all existing prompt history functionality
- Implement responsive overflow menu design
- Ensure smooth user experience across both tab locations
- Follow existing design patterns and component library