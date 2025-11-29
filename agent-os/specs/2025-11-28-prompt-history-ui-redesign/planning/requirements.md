# Spec Requirements: Prompt History UI Redesign

## Initial Description
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

## Requirements Discussion

### User Requirements Clarification

The user has provided comprehensive answers defining the final scope:

**Q1:** Interface simplification - Remove filters and statistics panels, keep only search functionality?
**Answer:** Yes, show conversation history with ONLY search functionality. Remove filters and stats entirely.

**Q2:** Menu implementation - Implement as modal overlay on both /prompt and /knowledge tabs?
**Answer:** Yes, modal overlay on both /prompt and /knowledge tabs.

**Q3:** Route handling - Remove bottom History tab entirely but keep /history route accessible for direct navigation?
**Answer:** Yes, remove bottom History tab entirely, but keep /history route accessible.

**Q4:** Visual design - Use hamburger menu icon with similar highlighting behavior as current MotionHighlight?
**Answer:** Yes, hamburger menu icon with similar highlighting as current MotionHighlight.

**Q5:** Menu positioning - Standard overflow menu behavior for both locations?
**Answer:** Yes, standard overflow menu behavior.

### Existing Code to Reference
No specific existing features were identified by the user for reference. However, based on the requirements, the following existing patterns should be referenced:

**Similar Features Identified:**
- MotionHighlight component - for highlighting behavior on hamburger menu icon
- Current ConversationHistory component - to be simplified for search-only version
- Modal overlay patterns - for implementing overflow menus
- Bottom navigation system - to be removed but referenced for current implementation

### Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
- Reference design pattern: Gemini.google.com overflow menu system
- Hamburger menu icon with MotionHighlight-style interaction
- Modal overlay implementation pattern
- Two distinct positioning requirements (top-left for /prompt, bottom-above-divider for /knowledge)

## Requirements Summary

### Functional Requirements
- Move from bottom tabs to hamburger menu overflow system
- Simplify ConversationHistory to search-only version (remove filters and statistics)
- Implement as modal overlays on both /prompt and /knowledge tabs
- Preserve conversation list functionality
- Maintain search functionality
- Keep all conversation actions (edit, delete, etc.)
- Remove bottom History tab navigation
- Preserve /history route for direct navigation access

### Reusability Opportunities
- MotionHighlight component for menu icon highlighting
- Existing modal overlay patterns for overflow menus
- Current ConversationHistory component to be simplified
- Search functionality from existing implementation
- Conversation action handlers and logic

### Scope Boundaries
**In Scope:**
- Hamburger menu implementation on /prompt (top-left corner)
- History button implementation on /knowledge (bottom, above divider)
- Search-only conversation history modal
- Removal of filters and statistics panels
- Removal of bottom navigation tabs
- Preservation of /history route for direct access

**Out of Scope:**
- Changes to core conversation management logic
- Modifications to conversation data structure
- Changes to search backend implementation
- New functionality beyond UI restructuring

### Technical Considerations
- Integration points: /prompt tab (top-left), /knowledge tab (bottom above divider)
- Existing system constraints: Must preserve all current conversation functionality
- Technology preferences: React with TypeScript, Tailwind CSS for styling
- Similar code patterns to follow: Modal overlay patterns, MotionHighlight behavior
- Route preservation: /history route must remain accessible
- Component simplification: ConversationHistory to search-only version