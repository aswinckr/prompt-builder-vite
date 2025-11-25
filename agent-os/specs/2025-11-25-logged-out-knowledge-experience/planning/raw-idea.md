**Feature Description**: Improve the logged-out user experience on the /knowledge tab. Currently when logged-out users visit the /knowledge tab, they see blocking error messages. The goal is to:

1. Show the knowledge interface to logged-out users (instead of errors)
2. When logged-out users click on "add prompt" or "add knowledge" buttons, prompt them to login
3. Provide a smooth, non-blocking user experience that encourages sign-up without preventing exploration

**Project Context**: This is a React + TypeScript + Vite project called "Prompt Builder" with Supabase authentication. The /knowledge route exists but the Knowledge component is currently just a placeholder.