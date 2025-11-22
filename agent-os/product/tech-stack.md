# Tech Stack

## Framework & Runtime
- **Application Framework:** React (Vite-based SPA with potential for Electron desktop app)
- **Language/Runtime:** TypeScript (frontend) + Node.js (build tools, potential backend services)
- **Package Manager:** npm (current), potential migration to yarn/pnpm for performance

## Frontend
- **JavaScript Framework:** React 17.0.2 with planned upgrade to React 18+ for concurrent features
- **CSS Framework:** Tailwind CSS (via Vitawind 2.0.0) for rapid utility-first styling
- **UI Components:** Custom component library with Lucide React icons
- **State Management:** React Context API with useReducer for state management
- **Routing:** React Router DOM v5.3.4 (current), planned migration to v6 for improved performance
- **Drag & Drop:** React DnD v16.0.1 with HTML5 backend for prompt block manipulation

## Backend & Data
- **Database:** Mock data system (current), minimal LocalStorage usage, planned PostgreSQL for team collaboration features
- **ORM/Query Builder:** Prisma (planned for database operations and type safety)
- **API Layer:** RESTful API (planned), GraphQL consideration for complex data relationships
- **Caching:** React Query/SWR for client-side caching, Redis for server-side caching (planned)
- **Data Storage:** TypeScript interfaces with in-memory mock data for development

## Desktop Integration
- **Desktop Framework:** Electron (planned) for global command palette and cross-app integration
- **Native APIs:** System tray, global hotkeys, clipboard access for seamless workflow
- **Background Services:** Node.js services for AI platform integrations and smart suggestions

## Testing & Quality
- **Test Framework:** Jest + React Testing Library (planned), Playwright for E2E testing
- **Linting/Formatting:** Prettier 2.5.1 (configured) with prettier-plugin-tailwindcss, planned ESLint for code quality
- **Type Checking:** TypeScript 4.4.4 with strict mode enabled for type safety
- **Code Quality:** Husky pre-commit hooks for automated checks (planned)
- **IDE Integration:** VS Code with automatic formatting on save configured

## AI Integration
- **AI SDK:** OpenAI SDK, Anthropic SDK for AI-powered features
- **Vector Database:** Pinecone or Chroma (planned) for semantic search and content recommendations
- **ML Models:** OpenAI embeddings for content similarity and relationship mapping

## Build & Deployment
- **Build Tool:** Vite 2.7.2 with @vitejs/plugin-react 1.0.7 for fast development and optimized builds
- **Hosting:** Vercel (web app), planned GitHub Releases for desktop app distribution
- **CI/CD:** GitHub Actions for automated testing and deployment
- **Monitoring:** Sentry for error tracking (planned), LogRocket for user session analytics

## Security & Authentication
- **Authentication:** Auth0 or NextAuth.js (planned for team features)
- **Authorization:** Role-based access control (RBAC) for enterprise features
- **Data Encryption:** Client-side encryption for sensitive context data
- **API Security:** JWT tokens, rate limiting, and CORS configuration

## Performance & Monitoring
- **Performance Tools:** React DevTools Profiler, Bundle Analyzer for optimization
- **Analytics:** Segment or Mixpanel for user behavior tracking
- **Error Monitoring:** Sentry for production error tracking and alerting
- **Performance Monitoring:** Web Vitals monitoring for user experience optimization

## Development Tools
- **IDE Integration:** VS Code extensions for TypeScript, Tailwind, and React
- **Component Development:** Storybook for component testing and documentation
- **API Documentation:** Swagger/OpenAPI for backend API specification
- **Version Control:** Git with conventional commits for automated changelog generation